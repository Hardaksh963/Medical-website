from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.admin_dependencies import require_admin
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.brand import Brand
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================

@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    search: str | None = None,
    category_id: UUID | None = None,
    product_type: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    sort: str = Query(
        default="newest",
        pattern="^(newest|oldest|price_asc|price_desc|name_asc|name_desc)$",
    ),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):

    query = (
        db.query(Product)
        .filter(Product.status == "ACTIVE")
    )

    # Search
    if search:
        pattern = f"%{search}%"

        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.short_description.ilike(pattern),
                Product.description.ilike(pattern),
                Product.sku.ilike(pattern),
            )
        )

    # Category
    if category_id:
        query = query.filter(
            Product.category_id == category_id
        )

    # Product type
    if product_type:
        query = query.filter(
            Product.product_type == product_type
        )

    # Price
    if min_price is not None:
        query = query.filter(
            Product.selling_price >= min_price
        )

    if max_price is not None:
        query = query.filter(
            Product.selling_price <= max_price
        )

    # Sorting
    if sort == "oldest":
        query = query.order_by(Product.created_at.asc())

    elif sort == "price_asc":
        query = query.order_by(Product.selling_price.asc())

    elif sort == "price_desc":
        query = query.order_by(Product.selling_price.desc())

    elif sort == "name_asc":
        query = query.order_by(Product.name.asc())

    elif sort == "name_desc":
        query = query.order_by(Product.name.desc())

    else:
        query = query.order_by(Product.created_at.desc())

    offset = (page - 1) * limit

    return (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: UUID,
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):

    # Check category
    category = (
        db.query(Category)
        .filter(Category.id == data.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category not found",
        )

    # Check brand if provided
    if data.brand_id:

        brand = (
            db.query(Brand)
            .filter(Brand.id == data.brand_id)
            .first()
        )

        if not brand:
            raise HTTPException(
                status_code=400,
                detail="Brand not found",
            )

    # Check SKU
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

    # Check slug
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
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
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

    # Check category
    if "category_id" in update_data:

        category = (
            db.query(Category)
            .filter(
                Category.id == update_data["category_id"]
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Category not found",
            )

    # Check brand
    if "brand_id" in update_data:

        if update_data["brand_id"] is not None:

            brand = (
                db.query(Brand)
                .filter(
                    Brand.id == update_data["brand_id"]
                )
                .first()
            )

            if not brand:
                raise HTTPException(
                    status_code=400,
                    detail="Brand not found",
                )

    # Check SKU uniqueness
    if "sku" in update_data:

        existing = (
            db.query(Product)
            .filter(
                Product.sku == update_data["sku"],
                Product.id != product_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="SKU already exists",
            )

    # Check slug uniqueness
    if "slug" in update_data:

        existing = (
            db.query(Product)
            .filter(
                Product.slug == update_data["slug"],
                Product.id != product_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Slug already exists",
            )

    # Update fields
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete(
    "/{product_id}",
    response_model=ProductResponse,
)
def deactivate_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
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

    # Soft delete
    product.status = "INACTIVE"

    db.commit()
    db.refresh(product)

    return product