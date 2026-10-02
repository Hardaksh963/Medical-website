from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.admin_dependencies import get_current_admin
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderStatusUpdate, OrderResponse
from app.services.notification_service import create_notification
from app.services.order_service import (
    cancel_order,
    create_order,
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


def build_order_response(
    db: Session,
    order: Order,
):
    """
    Build a complete order response including product names.

    Product names are fetched from the Product table so that
    customer and admin order pages can display the products
    contained in each order.
    """

    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    item_data = []

    for item in items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        item_data.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
                "product_name": (
                    product.name
                    if product
                    else "Product no longer available"
                ),
            }
        )

    return {
        "id": order.id,
        "user_id": order.user_id,
        "order_number": order.order_number,
        "status": order.status,
        "subtotal": order.subtotal,
        "shipping_cost": order.shipping_cost,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "items": item_data,
    }


# ---------------------------------------------------------
# CUSTOMER
# ---------------------------------------------------------


@router.post("/checkout")
def checkout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = create_order(
        db,
        current_user.id,
    )

    return {
        "message": "Order created successfully",
        "order_id": str(order.id),
        "order_number": order.order_number,
        "total": order.total_amount,
    }


@router.get(
    "",
    response_model=list[OrderResponse],
)
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [
        build_order_response(
            db=db,
            order=order,
        )
        for order in orders
    ]

@router.get("/admin")
def get_all_orders(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [
        build_order_response(
            db=db,
            order=order,
        )
        for order in orders
    ]


@router.get("/admin/{order_id}")
def get_admin_order(
    order_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return build_order_response(
        db=db,
        order=order,
    )


@router.patch("/admin/{order_id}/status")
def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    old_status = order.status

    # Do not create a notification if the status has not changed.
    if old_status == data.status:
        return order

    order.status = data.status

    # Notify the customer.
    create_notification(
        db=db,
        user_id=order.user_id,
        title="Order Status Updated",
        message=(
            f"Your order {order.order_number} status has been "
            f"updated from {old_status} to {data.status}."
        ),
        notification_type="ORDER",
    )

    db.commit()
    db.refresh(order)

    return order

@router.patch("/{order_id}/cancel")
def cancel_customer_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = cancel_order(
        db=db,
        user_id=current_user.id,
        order_id=order_id,
    )

    return {
        "message": "Order cancelled successfully",
        "order_id": order.id,
        "order_number": order.order_number,
        "status": order.status,
    }

@router.get("/{order_id}")
def get_my_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return build_order_response(
        db=db,
        order=order,
    )





# ---------------------------------------------------------
# ADMIN
# ---------------------------------------------------------


