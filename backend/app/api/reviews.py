import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewSummary,
    ReviewUpdate,
)
from app.services.review_service import (
    create_review,
    delete_review,
    get_my_reviews,
    get_product_review_summary,
    get_product_reviews,
    update_review,
)


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review_endpoint(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_review(
        db=db,
        user_id=current_user.id,
        product_id=data.product_id,
        order_id=data.order_id,
        rating=data.rating,
        comment=data.comment,
    )


@router.get(
    "/product/{product_id}",
    response_model=list[ReviewResponse],
)
def get_product_reviews_endpoint(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return get_product_reviews(
        db=db,
        product_id=product_id,
    )


@router.get(
    "/product/{product_id}/summary",
    response_model=ReviewSummary,
)
def get_product_review_summary_endpoint(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return get_product_review_summary(
        db=db,
        product_id=product_id,
    )


@router.get(
    "/my",
    response_model=list[ReviewResponse],
)
def get_my_reviews_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_reviews(
        db=db,
        user_id=current_user.id,
    )


@router.put(
    "/{review_id}",
    response_model=ReviewResponse,
)
def update_review_endpoint(
    review_id: uuid.UUID,
    data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_review(
        db=db,
        user_id=current_user.id,
        review_id=review_id,
        rating=data.rating,
        comment=data.comment,
    )


@router.delete(
    "/{review_id}",
)
def delete_review_endpoint(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return delete_review(
        db=db,
        user_id=current_user.id,
        review_id=review_id,
    )