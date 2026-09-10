import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    RazorpayOrderResponse,
)

from app.services.payment_service import (
    create_payment,
    confirm_payment,
    fail_payment,
    create_razorpay_order,
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_payment_endpoint(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_payment(
        db=db,
        user_id=current_user.id,
        order_id=data.order_id,
        payment_method=data.payment_method,
    )

@router.post(
    "/razorpay/create-order",
    response_model=RazorpayOrderResponse,
)
def create_razorpay_order_endpoint(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_razorpay_order(
        db=db,
        user_id=current_user.id,
        order_id=order_id,
    )

@router.post(
    "/{payment_id}/confirm",
    response_model=PaymentResponse
)
def confirm_payment_endpoint(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return confirm_payment(
        db=db,
        user_id=current_user.id,
        payment_id=payment_id,
    )

@router.post(
    "/{payment_id}/fail",
    response_model=PaymentResponse
)
def fail_payment_endpoint(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return fail_payment(
        db=db,
        user_id=current_user.id,
        payment_id=payment_id,
    )