from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.user import User
from app.models.product import Product
from app.models.wishlist import Wishlist

from app.schemas.wishlist import (
    WishlistAdd,
    WishlistResponse,
    WishlistCheckResponse,
)


router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"],
)


# ---------------------------------------------------------
# ADD TO WISHLIST
# ---------------------------------------------------------

@router.post(
    "",
    response_model=WishlistResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_to_wishlist(
    data: WishlistAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    product = (
        db.query(Product)
        .filter(
            Product.id == data.product_id,
            Product.status == "ACTIVE",
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == data.product_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Product already exists in wishlist",
        )

    wishlist = Wishlist(
        user_id=current_user.id,
        product_id=data.product_id,
    )

    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)

    return wishlist


# ---------------------------------------------------------
# GET MY WISHLIST
# ---------------------------------------------------------

@router.get(
    "",
    response_model=list[WishlistResponse],
)
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    wishlist = (
        db.query(Wishlist)
        .join(Product, Product.id == Wishlist.product_id)
        .filter(
            Wishlist.user_id == current_user.id
        )
        .order_by(
            Wishlist.created_at.desc()
        )
        .all()
    )

    result = []

    for item in wishlist:

        result.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "created_at": item.created_at,
                "product": item.product,
            }
        )

    return result


# ---------------------------------------------------------
# CHECK PRODUCT
# ---------------------------------------------------------

@router.get(
    "/check/{product_id}",
    response_model=WishlistCheckResponse,
)
def check_wishlist(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    exists = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
        .first()
        is not None
    )

    return {
        "product_id": product_id,
        "wishlisted": exists,
    }


# ---------------------------------------------------------
# REMOVE FROM WISHLIST
# ---------------------------------------------------------

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_from_wishlist(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    wishlist = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Product is not in wishlist",
        )

    db.delete(wishlist)
    db.commit()

    return None