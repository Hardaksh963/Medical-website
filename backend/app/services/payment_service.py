import uuid
import razorpay

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order
from app.models.payment import Payment
from app.services.inventory_service import restore_order_inventory

def confirm_payment(
    db: Session,
    user_id: uuid.UUID,
    payment_id: uuid.UUID,
):
    # ---------------------------------------------------------
    # Find payment
    # ---------------------------------------------------------
    payment = (
        db.query(Payment)
        .join(Order, Payment.order_id == Order.id)
        .filter(
            Payment.id == payment_id,
            Order.user_id == user_id,
        )
        .with_for_update()
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # ---------------------------------------------------------
    # Prevent duplicate confirmation
    # ---------------------------------------------------------
    if payment.status == "SUCCESS":
        raise HTTPException(
            status_code=409,
            detail="Payment already confirmed"
        )

    if payment.status == "REFUNDED":
        raise HTTPException(
            status_code=400,
            detail="Refunded payment cannot be confirmed"
        )

    # ---------------------------------------------------------
    # Get order
    # ---------------------------------------------------------
    order = (
        db.query(Order)
        .filter(Order.id == payment.order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # ---------------------------------------------------------
    # Do not confirm cancelled orders
    # ---------------------------------------------------------
    if order.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot confirm payment for cancelled order"
        )

    try:
        # -----------------------------------------------------
        # Mark payment successful
        # -----------------------------------------------------
        payment.status = "SUCCESS"

        payment.transaction_id = (
            f"TXN-{uuid.uuid4().hex[:16].upper()}"
        )

        # -----------------------------------------------------
        # Confirm order
        # -----------------------------------------------------
        if order.status == "PENDING":
            order.status = "CONFIRMED"

        db.commit()

        db.refresh(payment)

        return payment

    except Exception:
        db.rollback()
        raise

def create_payment(
    db: Session,
    user_id: uuid.UUID,
    order_id: uuid.UUID,
    payment_method: str,
):
    # ---------------------------------------------------------
    # Validate payment method
    # ---------------------------------------------------------
    if payment_method not in {"COD", "ONLINE"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )

    # ---------------------------------------------------------
    # Find order belonging to current user
    # ---------------------------------------------------------
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # ---------------------------------------------------------
    # Prevent payment for cancelled orders
    # ---------------------------------------------------------
    if order.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot create payment for cancelled order"
        )

    # ---------------------------------------------------------
    # Check if payment already exists
    # ---------------------------------------------------------
    existing_payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=409,
            detail="Payment already exists for this order"
        )

    # ---------------------------------------------------------
    # COD
    # ---------------------------------------------------------
    if payment_method == "COD":
        payment_status = "PENDING"

    # ---------------------------------------------------------
    # ONLINE
    #
    # Actual gateway integration will be added later.
    # For now, create a pending payment.
    # ---------------------------------------------------------
    else:
        payment_status = "PENDING"

    payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        payment_method=payment_method,
        status=payment_status,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment

def create_razorpay_order(
    db: Session,
    user_id: uuid.UUID,
    order_id: uuid.UUID,
):
    # ---------------------------------------------------------
    # Find order belonging to current user
    # ---------------------------------------------------------
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    # ---------------------------------------------------------
    # Prevent payment for cancelled orders
    # ---------------------------------------------------------
    if order.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot create payment for cancelled order",
        )

    # ---------------------------------------------------------
    # Check if a payment already exists
    # ---------------------------------------------------------
    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .first()
    )

    # ---------------------------------------------------------
    # If Razorpay order already exists, return it
    # This makes the endpoint safer for repeated requests.
    # ---------------------------------------------------------
    if payment and payment.razorpay_order_id:
        return {
            "payment_id": payment.id,
            "order_id": order.id,
            "razorpay_order_id": payment.razorpay_order_id,
            "amount": int(order.total_amount * 100),
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
        }

    # ---------------------------------------------------------
    # Don't allow creating a Razorpay payment if another
    # payment method already exists for this order.
    # ---------------------------------------------------------
    if payment:
        raise HTTPException(
            status_code=409,
            detail="Payment already exists for this order",
        )

    # ---------------------------------------------------------
    # Convert INR to paise
    # Example:
    # ₹2499.00 -> 249900 paise
    # ---------------------------------------------------------
    amount_paise = int(order.total_amount * 100)

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Order amount must be greater than zero",
        )

    # ---------------------------------------------------------
    # Create Razorpay client
    # ---------------------------------------------------------
    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )

    # ---------------------------------------------------------
    # Create Razorpay order
    # ---------------------------------------------------------
    try:
        razorpay_order = client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": order.order_number,
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to create Razorpay order: {str(exc)}",
        )

    # ---------------------------------------------------------
    # Create local payment record
    # ---------------------------------------------------------
    payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        payment_method="ONLINE",
        status="PENDING",
        razorpay_order_id=razorpay_order["id"],
    )

    db.add(payment)

    try:
        db.commit()
        db.refresh(payment)

    except Exception:
        db.rollback()
        raise

    return {
        "payment_id": payment.id,
        "order_id": order.id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
    }

def fail_payment(
    db: Session,
    user_id: uuid.UUID,
    payment_id: uuid.UUID,
):
    payment = (
        db.query(Payment)
        .join(Order, Payment.order_id == Order.id)
        .filter(
            Payment.id == payment_id,
            Order.user_id == user_id,
        )
        .with_for_update()
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.status == "SUCCESS":
        raise HTTPException(
            status_code=400,
            detail="Successful payment cannot be marked as failed"
        )

    order = (
        db.query(Order)
        .filter(Order.id == payment.order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    try:
        payment.status = "FAILED"

        if order.status == "PENDING":
            restore_order_inventory(
                db=db,
                order_id=order.id
            )

            order.status = "CANCELLED"

        db.commit()
        db.refresh(payment)

        return payment

    except Exception:
        db.rollback()
        raise