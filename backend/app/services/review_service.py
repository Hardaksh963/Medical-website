import uuid

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.review import Review


def create_review(
    db: Session,
    user_id: uuid.UUID,
    product_id: uuid.UUID,
    order_id: uuid.UUID,
    rating: int,
    comment: str | None,
):
    # ---------------------------------------------------------
    # Verify product exists and is active
    # ---------------------------------------------------------
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.status == "ACTIVE",
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    # ---------------------------------------------------------
    # Verify order belongs to current user
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
    # Only delivered orders can be reviewed
    # ---------------------------------------------------------
    if order.status != "DELIVERED":
        raise HTTPException(
            status_code=400,
            detail="You can review a product only after the order is delivered",
        )

    # ---------------------------------------------------------
    # Verify product was actually purchased in this order
    # ---------------------------------------------------------
    purchased = (
        db.query(OrderItem)
        .filter(
            OrderItem.order_id == order.id,
            OrderItem.product_id == product_id,
        )
        .first()
    )

    if not purchased:
        raise HTTPException(
            status_code=400,
            detail="You can only review products purchased in this order",
        )

    # ---------------------------------------------------------
    # Prevent duplicate review
    # ---------------------------------------------------------
    existing_review = (
        db.query(Review)
        .filter(
            Review.user_id == user_id,
            Review.product_id == product_id,
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this product",
        )

    # ---------------------------------------------------------
    # Create review
    # ---------------------------------------------------------
    review = Review(
        user_id=user_id,
        product_id=product_id,
        order_id=order_id,
        rating=rating,
        comment=comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


def update_review(
    db: Session,
    user_id: uuid.UUID,
    review_id: uuid.UUID,
    rating: int | None,
    comment: str | None,
):
    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.user_id == user_id,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    if rating is not None:
        review.rating = rating

    if comment is not None:
        review.comment = comment

    db.commit()
    db.refresh(review)

    return review


def delete_review(
    db: Session,
    user_id: uuid.UUID,
    review_id: uuid.UUID,
):
    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.user_id == user_id,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted successfully"
    }


def get_product_reviews(
    db: Session,
    product_id: uuid.UUID,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )


def get_my_reviews(
    db: Session,
    user_id: uuid.UUID,
):
    return (
        db.query(Review)
        .filter(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )


def get_product_review_summary(
    db: Session,
    product_id: uuid.UUID,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    result = (
        db.query(
            func.coalesce(func.avg(Review.rating), 0),
            func.count(Review.id),
        )
        .filter(Review.product_id == product_id)
        .first()
    )

    average_rating = float(result[0] or 0)
    total_reviews = int(result[1] or 0)

    return {
        "product_id": product_id,
        "average_rating": round(average_rating, 2),
        "total_reviews": total_reviews,
    }