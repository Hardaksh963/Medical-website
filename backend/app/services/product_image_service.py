import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_image import ProductImage


def verify_product(
    db: Session,
    product_id: uuid.UUID
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


def add_product_image(
    db: Session,
    product_id: uuid.UUID,
    image_url: str,
    is_primary: bool,
    display_order: int
):

    verify_product(db, product_id)

    # If this becomes the primary image,
    # remove primary status from existing images.
    if is_primary:

        db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).update(
            {"is_primary": False},
            synchronize_session=False
        )

    image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        is_primary=is_primary,
        display_order=display_order
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


def get_product_images(
    db: Session,
    product_id: uuid.UUID
):

    verify_product(db, product_id)

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id
        )
        .order_by(
            ProductImage.is_primary.desc(),
            ProductImage.display_order.asc()
        )
        .all()
    )


def update_product_image(
    db: Session,
    image_id: uuid.UUID,
    image_url: str | None,
    is_primary: bool | None,
    display_order: int | None
):

    image = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Product image not found"
        )

    if image_url is not None:
        image.image_url = image_url

    if display_order is not None:
        image.display_order = display_order

    if is_primary is True:

        db.query(ProductImage).filter(
            ProductImage.product_id == image.product_id,
            ProductImage.id != image.id
        ).update(
            {"is_primary": False},
            synchronize_session=False
        )

        image.is_primary = True

    elif is_primary is False:
        image.is_primary = False

    db.commit()
    db.refresh(image)

    return image


def delete_product_image(
    db: Session,
    image_id: uuid.UUID
):

    image = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Product image not found"
        )

    db.delete(image)
    db.commit()

    return {
        "message": "Product image deleted successfully"
    }