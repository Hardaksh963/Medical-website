from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.order_service import create_order


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