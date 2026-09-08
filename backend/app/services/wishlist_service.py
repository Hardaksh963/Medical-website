import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.wishlist import Wishlist


def add_to_wishlist(
    db: Session,
    user_id: uuid.UUID,
    product_id: uuid.UUID,
):
    # Make sure the product exists and is active
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

    # Prevent duplicate wishlist entries
    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Product already exists in wishlist",
        )

    wishlist_item = Wishlist(
        user_id=user_id,
        product_id=product_id,
    )

    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return wishlist_item


def remove_from_wishlist(
    db: Session,
    user_id: uuid.UUID,
    product_id: uuid.UUID,
):
    wishlist_item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if not wishlist_item:
        raise HTTPException(
            status_code=404,
            detail="Product is not in wishlist",
        )

    db.delete(wishlist_item)
    db.commit()

    return {
        "message": "Product removed from wishlist"
    }


def get_user_wishlist(
    db: Session,
    user_id: uuid.UUID,
):
    return (
        db.query(Wishlist)
        .join(Product, Wishlist.product_id == Product.id)
        .filter(
            Wishlist.user_id == user_id,
            Product.status == "ACTIVE",
        )
        .order_by(Wishlist.created_at.desc())
        .all()
    )


def is_product_in_wishlist(
    db: Session,
    user_id: uuid.UUID,
    product_id: uuid.UUID,
):
    return (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        )
        .first()
        is not None
    )