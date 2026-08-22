from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


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
    db: Session = Depends(get_db)
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
                Product.description.ilike(pattern)
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
    db: Session = Depends(get_db)
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