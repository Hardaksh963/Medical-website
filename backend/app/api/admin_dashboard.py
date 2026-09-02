from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.admin_dependencies import get_current_admin

from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.complaint import Complaint
from app.models.batch import ProductBatch

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)


@router.get("")
def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    total_customers = (
        db.query(User)
        .filter(User.role == "CUSTOMER")
        .count()
    )

    total_products = (
        db.query(Product)
        .count()
    )

    total_orders = (
        db.query(Order)
        .count()
    )

    total_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status != "CANCELLED")
        .scalar()
    )

    pending_orders = (
        db.query(Order)
        .filter(Order.status == "PENDING")
        .count()
    )

    processing_orders = (
        db.query(Order)
        .filter(Order.status == "PROCESSING")
        .count()
    )

    delivered_orders = (
        db.query(Order)
        .filter(Order.status == "DELIVERED")
        .count()
    )

    cancelled_orders = (
        db.query(Order)
        .filter(Order.status == "CANCELLED")
        .count()
    )

    open_complaints = (
        db.query(Complaint)
        .filter(
            Complaint.status.in_(["OPEN", "IN_PROGRESS"])
        )
        .count()
    )

    low_stock_products = (
        db.query(ProductBatch.product_id)
        .join(Product, Product.id == ProductBatch.product_id)
        .group_by(
            ProductBatch.product_id,
            Product.reorder_level
        )
        .having(
            func.sum(ProductBatch.quantity)
            <= Product.reorder_level
        )
        .count()
    )

    total_inventory_units = (
        db.query(
            func.coalesce(func.sum(ProductBatch.quantity), 0)
        )
        .scalar()
    )

    return {
        "customers": {
            "total": total_customers
        },
        "products": {
            "total": total_products
        },
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "processing": processing_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders
        },
        "revenue": {
            "total": total_revenue
        },
        "complaints": {
            "open": open_complaints
        },
        "inventory": {
            "total_units": total_inventory_units,
            "low_stock_products": low_stock_products
        }
    }