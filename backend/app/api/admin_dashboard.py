from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.admin_dependencies import get_current_admin

from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.complaint import Complaint
from app.models.batch import ProductBatch


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)


# =========================================================
# DASHBOARD OVERVIEW
# =========================================================

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
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        )
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
            Complaint.status.in_(
                ["OPEN", "IN_PROGRESS"]
            )
        )
        .count()
    )

    low_stock_products = (
        db.query(ProductBatch.product_id)
        .join(
            Product,
            Product.id == ProductBatch.product_id
        )
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
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            )
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


# =========================================================
# RECENT ORDERS
# =========================================================

@router.get("/recent-orders")
def get_recent_orders(
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "status": order.status,
            "subtotal": order.subtotal,
            "shipping_cost": order.shipping_cost,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
        }
        for order in orders
    ]


# =========================================================
# TOP SELLING PRODUCTS
# =========================================================

@router.get("/top-products")
def get_top_products(
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            func.sum(OrderItem.quantity).label(
                "total_quantity"
            ),
            func.sum(OrderItem.subtotal).label(
                "total_sales"
            ),
        )
        .join(
            OrderItem,
            OrderItem.product_id == Product.id
        )
        .join(
            Order,
            Order.id == OrderItem.order_id
        )
        .filter(
            Order.status != "CANCELLED"
        )
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(
                OrderItem.quantity
            ).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "product_id": row.product_id,
            "product_name": row.product_name,
            "total_quantity": row.total_quantity,
            "total_sales": row.total_sales,
        }
        for row in results
    ]


# =========================================================
# SALES HISTORY
# =========================================================

@router.get("/sales")
def get_sales_history(
    days: int = Query(30, ge=1, le=365),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    start_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(
            func.date(Order.created_at).label(
                "date"
            ),
            func.count(Order.id).label(
                "orders"
            ),
            func.coalesce(
                func.sum(Order.total_amount),
                0
            ).label(
                "revenue"
            ),
        )
        .filter(
            Order.created_at >= start_date,
            Order.status != "CANCELLED"
        )
        .group_by(
            func.date(Order.created_at)
        )
        .order_by(
            func.date(Order.created_at).asc()
        )
        .all()
    )

    return [
        {
            "date": row.date,
            "orders": row.orders,
            "revenue": row.revenue,
        }
        for row in results
    ]


# =========================================================
# EXPIRING INVENTORY
# =========================================================

@router.get("/expiring-batches")
def get_expiring_batches(
    days: int = Query(30, ge=1, le=365),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    today = datetime.utcnow().date()
    expiry_limit = today + timedelta(days=days)

    results = (
        db.query(
            ProductBatch,
            Product.name.label("product_name")
        )
        .join(
            Product,
            Product.id == ProductBatch.product_id
        )
        .filter(
            ProductBatch.is_active.is_(True),
            ProductBatch.quantity > 0,
            ProductBatch.expiry_date.isnot(None),
            ProductBatch.expiry_date <= expiry_limit,
        )
        .order_by(
            ProductBatch.expiry_date.asc()
        )
        .all()
    )

    return [
        {
            "batch_id": batch.id,
            "product_id": batch.product_id,
            "product_name": product_name,
            "batch_number": batch.batch_number,
            "quantity": batch.quantity,
            "manufacturing_date": batch.manufacturing_date,
            "expiry_date": batch.expiry_date,
        }
        for batch, product_name in results
    ]