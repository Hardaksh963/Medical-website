from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.services.order_service import create_order
from app.api.admin_dependencies import get_current_admin
from app.schemas.order import OrderStatusUpdate

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post("/checkout")
def checkout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    order = create_order(
        db,
        current_user.id
    )

    return {
        "message": "Order created successfully",
        "order_id": str(order.id),
        "order_number": order.order_number,
        "total": order.total_amount
    }

@router.get("") 
def get_my_orders(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db) 
    ): 
        orders = ( 
            db.query(Order) 
            .filter(Order.user_id == current_user.id) 
            .order_by(Order.created_at.desc()) 
            .all() 
            ) 
        return orders 

@router.get("/{order_id}") 
def get_my_order( 
    order_id: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db) 
    ): 
    order = ( 
        db.query(Order) 
        .filter( 
            Order.id == order_id, 
            Order.user_id == current_user.id 
            ) 
            .first() 
            ) 
    if not order: 
        raise HTTPException( status_code=404, detail="Order not found" ) 
    items = ( db.query(OrderItem) 
            .filter(OrderItem.order_id == order.id) 
            .all() ) 
    return { "id": order.id, 
            "order_number": order.order_number, 
            "status": order.status, 
            "subtotal": order.subtotal, 
            "shipping_cost": order.shipping_cost, 
            "total_amount": order.total_amount, 
            "created_at": order.created_at, 
            "items": items }

@router.get("/admin")
def get_all_orders(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .all()
    )

    return orders


@router.get("/admin/{order_id}")
def get_admin_order(
    order_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
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
        "items": items
    }


@router.patch("/admin/{order_id}/status")
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    allowed_statuses = {
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    }

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid order status. "
                f"Allowed values: {', '.join(sorted(allowed_statuses))}"
            )
        )

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = data.status

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": str(order.id),
        "order_number": order.order_number,
        "status": order.status
    }