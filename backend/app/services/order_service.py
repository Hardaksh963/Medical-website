import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.inventory import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.batch import ProductBatch


def create_order(
    db: Session,
    user_id: uuid.UUID
):
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

        for cart_item in items:

            if cart_item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid cart quantity"
                )

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

            # Get active batches with available stock.
            # Lock them so two customers cannot consume
            # the same stock simultaneously.
            batches = (
                db.query(ProductBatch)
                .filter(
                    ProductBatch.product_id == product.id,
                    ProductBatch.is_active == True,
                    ProductBatch.quantity > 0
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

            price = product.selling_price

            item_total = (
                price * cart_item.quantity
            )

            subtotal += item_total

            order_items.append({
                "product": product,
                "quantity": cart_item.quantity,
                "unit_price": price,
                "subtotal": item_total,
                "batches": batches
            })

        shipping = Decimal("0")
        total = subtotal + shipping

        # Create order
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

        # Process inventory + order items
        for item in order_items:

            product = item["product"]
            remaining_quantity = item["quantity"]

            # Create order item
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                subtotal=item["subtotal"]
            )

            db.add(order_item)

            # Deduct stock using batches
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
                    quantity=deducted,
                    movement_type="STOCK_OUT",
                    reason="Stock sold"
                )

                db.add(movement)

                remaining_quantity -= deducted

        # Clear cart
        db.query(CartItem).filter(
            CartItem.cart_id == cart.id
        ).delete(
            synchronize_session=False
        )

        db.commit()

        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise