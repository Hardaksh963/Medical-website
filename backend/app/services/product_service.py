from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.review import Review
from app.models.batch import ProductBatch


def get_product_details(
    db: Session,
    product_id: UUID
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.status == "ACTIVE"
        )
        .first()
    )

    if not product:
        return None

    images = (
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

    rating_data = (
        db.query(
            func.coalesce(
                func.avg(Review.rating),
                0
            ),
            func.count(Review.id)
        )
        .filter(
            Review.product_id == product_id,
            Review.is_approved.is_(True)
        )
        .first()
    )

    average_rating = float(rating_data[0] or 0)
    review_count = int(rating_data[1] or 0)

    total_stock = (
        db.query(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            )
        )
        .filter(
            ProductBatch.product_id == product_id,
            ProductBatch.is_active.is_(True)
        )
        .scalar()
    )

    total_stock = int(total_stock or 0)

    return {
        "product": product,
        "images": images,
        "average_rating": round(average_rating, 2),
        "review_count": review_count,
        "stock": total_stock
    }