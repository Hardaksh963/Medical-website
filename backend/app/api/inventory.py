from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.admin_dependencies import get_current_admin
from app.core.database import get_db

from app.models.batch import ProductBatch
from app.models.inventory import InventoryMovement
from app.models.product import Product
from app.models.user import User

from app.schemas.inventory import (
    BatchCreate,
    BatchResponse,
    InventoryAdjustment,
    InventoryMovementResponse,
)

from app.services.inventory_service import (
    adjust_inventory,
    create_batch,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.post(
    "/admin/batches",
    response_model=BatchResponse,
    status_code=201,
)
def create_inventory_batch(
    data: BatchCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return create_batch(
        db=db,
        product_id=data.product_id,
        batch_number=data.batch_number,
        quantity=data.quantity,
        manufacturing_date=data.manufacturing_date,
        expiry_date=data.expiry_date,
    )


@router.get(
    "/admin/{product_id}",
    response_model=list[BatchResponse],
)
def get_product_inventory(
    product_id: UUID,
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()

    if not product:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    query = select(ProductBatch).where(
        ProductBatch.product_id == product_id
    )

    if active_only:
        query = query.where(ProductBatch.is_active.is_(True))

    query = query.order_by(
        ProductBatch.expiry_date.asc().nullslast()
    )

    return db.execute(query).scalars().all()


@router.post(
    "/admin/adjust",
    response_model=BatchResponse,
)
def adjust_inventory_stock(
    data: InventoryAdjustment,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return adjust_inventory(
        db=db,
        batch_id=data.batch_id,
        quantity=data.quantity,
        movement_type=data.movement_type,
        reason=data.reason,
    )


@router.get(
    "/admin/{product_id}/movements",
    response_model=list[InventoryMovementResponse],
)
def get_inventory_movements(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()

    if not product:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    query = (
        select(InventoryMovement)
        .where(InventoryMovement.product_id == product_id)
        .order_by(InventoryMovement.created_at.desc())
    )

    return db.execute(query).scalars().all()