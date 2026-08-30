from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.admin_dependencies import get_current_admin
from app.core.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ---------------------------------------------------------
# CUSTOMER / PUBLIC
# ---------------------------------------------------------

@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_products(
    search: str | None = None,
    category_id: str | None = None,
    product_type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):

    query = (
        db.query(Product)
        .filter(Product.status == "ACTIVE")
    )

    if search:
        pattern = f"%{search}%"

        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.short_description.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )

    if category_id:
        query = query.filter(
            Product.category_id == category_id
        )

    if product_type:
        query = query.filter(
            Product.product_type == product_type
        )

    if min_price is not None:
        query = query.filter(
            Product.selling_price >= min_price
        )

    if max_price is not None:
        query = query.filter(
            Product.selling_price <= max_price
        )

    offset = (page - 1) * limit

    return (
        query
        .order_by(Product.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
):

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

    return product


# ---------------------------------------------------------
# ADMIN
# ---------------------------------------------------------

@router.post(
    "/admin",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):

    existing_sku = (
        db.query(Product)
        .filter(Product.sku == data.sku)
        .first()
    )

    if existing_sku:
        raise HTTPException(
            status_code=409,
            detail="SKU already exists",
        )

    existing_slug = (
        db.query(Product)
        .filter(Product.slug == data.slug)
        .first()
    )

    if existing_slug:
        raise HTTPException(
            status_code=409,
            detail="Slug already exists",
        )

    product = Product(
        **data.model_dump()
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.put(
    "/admin/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
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

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "sku" in update_data:

        existing = (
            db.query(Product)
            .filter(
                Product.sku == update_data["sku"],
                Product.id != product.id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="SKU already exists",
            )

    if "slug" in update_data:

        existing = (
            db.query(Product)
            .filter(
                Product.slug == update_data["slug"],
                Product.id != product.id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Slug already exists",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete(
    "/admin/{product_id}",
    response_model=ProductResponse,
)
def deactivate_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
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

    # Do NOT physically delete the product.
    product.status = "INACTIVE"

    db.commit()
    db.refresh(product)

    return product