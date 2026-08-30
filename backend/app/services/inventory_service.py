from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.batch import ProductBatch
from app.models.inventory import InventoryMovement
from app.models.product import Product


VALID_MOVEMENT_TYPES = {
    "STOCK_IN",
    "STOCK_OUT",
    "ADJUSTMENT",
    "RETURN",
    "DAMAGED",
    "EXPIRED",
}


def create_batch(
    db: Session,
    product_id: UUID,
    batch_number: str,
    quantity: int,
    manufacturing_date=None,
    expiry_date=None,
):
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    existing_batch = db.execute(
        select(ProductBatch).where(
            ProductBatch.product_id == product_id,
            ProductBatch.batch_number == batch_number,
        )
    ).scalar_one_or_none()

    if existing_batch:
        raise HTTPException(
            status_code=409,
            detail="Batch number already exists for this product",
        )

    if expiry_date and manufacturing_date:
        if expiry_date <= manufacturing_date:
            raise HTTPException(
                status_code=400,
                detail="Expiry date must be after manufacturing date",
            )

    batch = ProductBatch(
        product_id=product_id,
        batch_number=batch_number,
        quantity=quantity,
        manufacturing_date=manufacturing_date,
        expiry_date=expiry_date,
        is_active=True,
    )

    db.add(batch)
    db.flush()

    if quantity > 0:
        movement = InventoryMovement(
            product_id=product_id,
            batch_id=batch.id,
            quantity=quantity,
            movement_type="STOCK_IN",
            reason="Initial batch stock",
        )

        db.add(movement)

    db.commit()
    db.refresh(batch)

    return batch


def adjust_inventory(
    db: Session,
    batch_id: UUID,
    quantity: int,
    movement_type: str,
    reason: str | None = None,
):
    if movement_type not in VALID_MOVEMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid movement type: {movement_type}",
        )

    batch = db.execute(
        select(ProductBatch)
        .where(ProductBatch.id == batch_id)
        .with_for_update()
    ).scalar_one_or_none()

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch not found",
        )

    if not batch.is_active:
        raise HTTPException(
            status_code=400,
            detail="Batch is inactive",
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    if movement_type in {"STOCK_IN", "RETURN"}:
        new_quantity = batch.quantity + quantity

    elif movement_type in {
        "STOCK_OUT",
        "DAMAGED",
        "EXPIRED",
    }:
        if batch.quantity < quantity:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock",
            )

        new_quantity = batch.quantity - quantity

    elif movement_type == "ADJUSTMENT":
        new_quantity = quantity

    batch.quantity = new_quantity

    movement_quantity = quantity

    movement = InventoryMovement(
        product_id=batch.product_id,
        batch_id=batch.id,
        quantity=movement_quantity,
        movement_type=movement_type,
        reason=reason,
    )

    db.add(movement)
    db.commit()
    db.refresh(batch)

    return batch