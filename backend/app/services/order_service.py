import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.inventory import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product


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

            # This assumes a stock column is added to products
            # or replaced with an inventory aggregation service.

            if cart_item.quantity <= 0:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid cart quantity"
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
                "subtotal": item_total
            })

        shipping = Decimal("0")

        total = subtotal + shipping

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

        for item in order_items:

            order_item = OrderItem(
                order_id=order.id,
                product_id=item["product"].id,
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                subtotal=item["subtotal"]
            )

            db.add(order_item)

        db.query(CartItem).filter(
            CartItem.cart_id == cart.id
        ).delete(
            synchronize_session=False
        )

        db.commit()

        db.refresh(order)

        return order

    except Exception:

        db.rollback()

        raise