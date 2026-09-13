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
    now = datetime.utcnow()

    # -----------------------------------------------------
    # DATE RANGES
    # -----------------------------------------------------

    today_start = datetime(
        now.year,
        now.month,
        now.day
    )

    if now.month == 1:
        previous_month_start = datetime(
            now.year - 1,
            12,
            1
        )
    else:
        previous_month_start = datetime(
            now.year,
            now.month - 1,
            1
        )

    current_month_start = datetime(
        now.year,
        now.month,
        1
    )

    # -----------------------------------------------------
    # CUSTOMERS
    # -----------------------------------------------------

    total_customers = (
        db.query(User)
        .filter(User.role == "CUSTOMER")
        .count()
    )

    # -----------------------------------------------------
    # PRODUCTS
    # -----------------------------------------------------

    total_products = (
        db.query(Product)
        .count()
    )

    active_products = (
        db.query(Product)
        .filter(Product.status == "ACTIVE")
        .count()
    )

    inactive_products = (
        db.query(Product)
        .filter(Product.status == "INACTIVE")
        .count()
    )

    # -----------------------------------------------------
    # ORDERS
    # -----------------------------------------------------

    total_orders = (
        db.query(Order)
        .count()
    )

    pending_orders = (
        db.query(Order)
        .filter(Order.status == "PENDING")
        .count()
    )

    confirmed_orders = (
        db.query(Order)
        .filter(Order.status == "CONFIRMED")
        .count()
    )

    processing_orders = (
        db.query(Order)
        .filter(Order.status == "PROCESSING")
        .count()
    )

    shipped_orders = (
        db.query(Order)
        .filter(Order.status == "SHIPPED")
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

    returned_orders = (
        db.query(Order)
        .filter(Order.status == "RETURNED")
        .count()
    )

    # -----------------------------------------------------
    # REVENUE
    #
    # Cancelled orders are excluded from revenue.
    # -----------------------------------------------------

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

    today_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        )
        .filter(
            Order.created_at >= today_start,
            Order.status != "CANCELLED"
        )
        .scalar()
    )

    current_month_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        )
        .filter(
            Order.created_at >= current_month_start,
            Order.status != "CANCELLED"
        )
        .scalar()
    )

    previous_month_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        )
        .filter(
            Order.created_at >= previous_month_start,
            Order.created_at < current_month_start,
            Order.status != "CANCELLED"
        )
        .scalar()
    )

    # -----------------------------------------------------
    # COMPLAINTS
    # -----------------------------------------------------

    total_complaints = (
        db.query(Complaint)
        .count()
    )

    open_complaints = (
        db.query(Complaint)
        .filter(Complaint.status == "OPEN")
        .count()
    )

    in_progress_complaints = (
        db.query(Complaint)
        .filter(Complaint.status == "IN_PROGRESS")
        .count()
    )

    resolved_complaints = (
        db.query(Complaint)
        .filter(Complaint.status == "RESOLVED")
        .count()
    )

    closed_complaints = (
        db.query(Complaint)
        .filter(Complaint.status == "CLOSED")
        .count()
    )

    # -----------------------------------------------------
    # INVENTORY
    # -----------------------------------------------------

    total_inventory_units = (
        db.query(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            )
        )
        .filter(
            ProductBatch.is_active.is_(True)
        )
        .scalar()
    )

    # -----------------------------------------------------
    # LOW STOCK PRODUCTS
    # -----------------------------------------------------

    low_stock_products = (
        db.query(ProductBatch.product_id)
        .join(
            Product,
            Product.id == ProductBatch.product_id
        )
        .filter(
            Product.status == "ACTIVE",
            ProductBatch.is_active.is_(True)
        )
        .group_by(
            ProductBatch.product_id,
            Product.reorder_level
        )
        .having(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            ) <= Product.reorder_level
        )
        .count()
    )

    # -----------------------------------------------------
    # OUT OF STOCK PRODUCTS
    # -----------------------------------------------------

    out_of_stock_products = (
        db.query(Product.id)
        .outerjoin(
            ProductBatch,
            (
                ProductBatch.product_id == Product.id
            )
            & (
                ProductBatch.is_active.is_(True)
            )
        )
        .filter(
            Product.status == "ACTIVE"
        )
        .group_by(Product.id)
        .having(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            ) <= 0
        )
        .count()
    )

    # -----------------------------------------------------
    # EXPIRING BATCHES
    # -----------------------------------------------------

    today = now.date()
    expiry_limit = today + timedelta(days=30)

    expiring_batches = (
        db.query(ProductBatch)
        .filter(
            ProductBatch.is_active.is_(True),
            ProductBatch.quantity > 0,
            ProductBatch.expiry_date.isnot(None),
            ProductBatch.expiry_date <= expiry_limit
        )
        .count()
    )

    # -----------------------------------------------------
    # DASHBOARD RESPONSE
    # -----------------------------------------------------

    return {
        "customers": {
            "total": total_customers
        },

        "products": {
            "total": total_products,
            "active": active_products,
            "inactive": inactive_products
        },

        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "confirmed": confirmed_orders,
            "processing": processing_orders,
            "shipped": shipped_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders,
            "returned": returned_orders
        },

        "revenue": {
            "total": total_revenue,
            "today": today_revenue,
            "this_month": current_month_revenue,
            "previous_month": previous_month_revenue
        },

        "complaints": {
            "total": total_complaints,
            "open": open_complaints,
            "in_progress": in_progress_complaints,
            "resolved": resolved_complaints,
            "closed": closed_complaints
        },

        "inventory": {
            "total_units": total_inventory_units,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "expiring_batches_30_days": expiring_batches
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
