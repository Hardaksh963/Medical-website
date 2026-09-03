import uuid
from datetime import date
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.inventory import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.batch import ProductBatch
from app.models.payment import Payment


def create_order(
    db: Session,
    user_id: uuid.UUID
):
    # ---------------------------------------------------------
    # 1. Get user's cart
    # ---------------------------------------------------------
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .first()
    )

    if not cart:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    items = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    subtotal = Decimal("0")
    order_items = []

    try:
        # -----------------------------------------------------
        # 2. Validate products and inventory
        # -----------------------------------------------------
        for cart_item in items:

            if cart_item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid cart quantity"
                )

            # Lock product row
            product = (
                db.query(Product)
                .filter(
                    Product.id == cart_item.product_id,
                    Product.status == "ACTIVE"
                )
                .with_for_update()
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Product no longer available"
                )

            # -------------------------------------------------
            # Get valid batches
            #
            # - Active only
            # - Quantity > 0
            # - Not expired
            # - Earliest expiry first
            # - No-expiry batches last
            # - Lock rows to prevent overselling
            # -------------------------------------------------
            batches = (
                db.query(ProductBatch)
                .filter(
                    ProductBatch.product_id == product.id,
                    ProductBatch.is_active == True,
                    ProductBatch.quantity > 0,
                    (
                        ProductBatch.expiry_date.is_(None)
                        | (ProductBatch.expiry_date >= date.today())
                    )
                )
                .order_by(
                    ProductBatch.expiry_date.asc().nulls_last(),
                    ProductBatch.created_at.asc()
                )
                .with_for_update()
                .all()
            )

            available_stock = sum(
                batch.quantity
                for batch in batches
            )

            # -------------------------------------------------
            # Insufficient stock
            # -------------------------------------------------
            if available_stock < cart_item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Insufficient stock for "
                        f"{product.name}. "
                        f"Available: {available_stock}, "
                        f"Requested: {cart_item.quantity}"
                    )
                )

            # Always use current selling price
            price = product.selling_price

            item_total = price * cart_item.quantity

            subtotal += item_total

            order_items.append({
                "product": product,
                "quantity": cart_item.quantity,
                "unit_price": price,
                "subtotal": item_total,
                "batches": batches
            })

        # -----------------------------------------------------
        # 3. Calculate order total
        # -----------------------------------------------------
        shipping = Decimal("0")
        total = subtotal + shipping

        # -----------------------------------------------------
        # 4. Create order
        # -----------------------------------------------------
        order = Order(
            user_id=user_id,
            order_number=f"ORD-{uuid.uuid4().hex[:10].upper()}",
            status="PENDING",
            subtotal=subtotal,
            shipping_cost=shipping,
            total_amount=total
        )

        db.add(order)
        db.flush()

        # -----------------------------------------------------
        # 5. Create order items + deduct inventory
        # -----------------------------------------------------
        for item in order_items:

            product = item["product"]
            remaining_quantity = item["quantity"]

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                subtotal=item["subtotal"]
            )

            db.add(order_item)

            # FIFO / earliest-expiry-first deduction
            for batch in item["batches"]:

                if remaining_quantity <= 0:
                    break

                deducted = min(
                    batch.quantity,
                    remaining_quantity
                )

                batch.quantity -= deducted

                movement = InventoryMovement(
                    product_id=product.id,
                    batch_id=batch.id,
                    order_id=order.id,
                    quantity=deducted,
                    movement_type="STOCK_OUT",
                    reason="Stock sold"
                )

                db.add(movement)

                remaining_quantity -= deducted

            # Defensive check
            if remaining_quantity > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}"
                )

        # -----------------------------------------------------
        # 6. Clear cart
        # -----------------------------------------------------
        db.query(CartItem).filter(
            CartItem.cart_id == cart.id
        ).delete(
            synchronize_session=False
        )

        # -----------------------------------------------------
        # 7. Commit entire transaction
        # -----------------------------------------------------
        db.commit()

        db.refresh(order)

        return order

    except HTTPException:
        # Roll back EVERYTHING:
        # order + order items + inventory changes
        db.rollback()
        raise

    except Exception:
        # Roll back unexpected failures too
        db.rollback()
        raise

def cancel_order(
    db: Session,
    user_id: uuid.UUID,
    order_id: uuid.UUID,
):
    # ---------------------------------------------------------
    # Find customer's order
    # ---------------------------------------------------------
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id,
        )
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # ---------------------------------------------------------
    # Check whether order can be cancelled
    # ---------------------------------------------------------
    if order.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Order is already cancelled"
        )

    if order.status in {"SHIPPED", "DELIVERED", "RETURNED"}:
        raise HTTPException(
            status_code=400,
            detail="Order cannot be cancelled at this stage"
        )

    try:
        # -----------------------------------------------------
        # Restore inventory from STOCK_OUT movements
        # -----------------------------------------------------
        movements = (
            db.query(InventoryMovement)
            .filter(
                InventoryMovement.order_id == order.id,
                InventoryMovement.movement_type == "STOCK_OUT",
            )
            .with_for_update()
            .all()
        )

        for movement in movements:

            batch = (
                db.query(ProductBatch)
                .filter(
                    ProductBatch.id == movement.batch_id
                )
                .with_for_update()
                .first()
            )

            if not batch:
                raise HTTPException(
                    status_code=404,
                    detail="Inventory batch not found"
                )

            batch.quantity += movement.quantity

            # Mark original movement as returned
            movement.movement_type = "RETURN"
            movement.reason = "Order cancelled - stock restored"

        # -----------------------------------------------------
        # Cancel order
        # -----------------------------------------------------
        order.status = "CANCELLED"

        # -----------------------------------------------------
        # If payment exists, update it
        # -----------------------------------------------------
        payment = (
            db.query(Payment)
            .filter(Payment.order_id == order.id)
            .with_for_update()
            .first()
        )

        if payment and payment.status == "PENDING":
            payment.status = "FAILED"

        db.commit()
        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise