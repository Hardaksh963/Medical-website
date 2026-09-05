import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.admin_dependencies import get_current_admin
from app.api.dependencies import get_current_user
from app.core.database import get_db

from app.models.user import User

from app.schemas.product_image import (
    ProductImageCreate,
    ProductImageResponse,
    ProductImageUpdate,
)

from app.services.product_image_service import (
    add_product_image,
    delete_product_image,
    get_product_images,
    update_product_image,
)


router = APIRouter(
    prefix="/product-images",
    tags=["Product Images"]
)


# ---------------------------------------------------------
# CUSTOMER
# ---------------------------------------------------------

@router.get(
    "/product/{product_id}",
    response_model=list[ProductImageResponse]
)
def get_images(
    product_id: uuid.UUID,
    db: Session = Depends(get_db)
):

    return get_product_images(
        db=db,
        product_id=product_id
    )


# ---------------------------------------------------------
# ADMIN
# ---------------------------------------------------------

@router.post(
    "/admin",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED
)
def add_image(
    data: ProductImageCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    return add_product_image(
        db=db,
        product_id=data.product_id,
        image_url=data.image_url,
        is_primary=data.is_primary,
        display_order=data.display_order
    )


@router.put(
    "/admin/{image_id}",
    response_model=ProductImageResponse
)
def update_image(
    image_id: uuid.UUID,
    data: ProductImageUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    return update_product_image(
        db=db,
        image_id=image_id,
        image_url=data.image_url,
        is_primary=data.is_primary,
        display_order=data.display_order
    )


@router.delete(
    "/admin/{image_id}"
)
def delete_image(
    image_id: uuid.UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    return delete_product_image(
        db=db,
        image_id=image_id
    )