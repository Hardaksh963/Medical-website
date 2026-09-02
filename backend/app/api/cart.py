from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.batch import ProductBatch
from app.models.user import User


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


# =========================================================
# GET CART
# =========================================================

@router.get("")
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if not cart:
        return {
            "cart_id": None,
            "items": [],
            "total_items": 0,
            "total_amount": 0
        }

    items = (
        db.query(CartItem, Product)
        .join(
            Product,
            Product.id == CartItem.product_id
        )
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    result = []
    total_items = 0
    total_amount = 0

    for item, product in items:
        item_total = (
            product.selling_price * item.quantity
        )

        total_items += item.quantity
        total_amount += item_total

        result.append({
            "item_id": item.id,
            "product_id": product.id,
            "product_name": product.name,
            "quantity": item.quantity,
            "unit_price": product.selling_price,
            "subtotal": item_total,
        })

    return {
        "cart_id": cart.id,
        "items": result,
        "total_items": total_items,
        "total_amount": total_amount
    }


# =========================================================
# ADD TO CART
# =========================================================

@router.post("/items")
def add_to_cart(
    product_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.status == "ACTIVE"
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # -----------------------------------------------------
    # CHECK AVAILABLE STOCK
    # -----------------------------------------------------

    available_stock = (
        db.query(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            )
        )
        .filter(
            ProductBatch.product_id == product.id,
            ProductBatch.is_active.is_(True)
        )
        .scalar()
    )

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if not cart:
        cart = Cart(
            user_id=current_user.id
        )

        db.add(cart)
        db.flush()

    item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product.id
        )
        .first()
    )

    existing_quantity = (
        item.quantity
        if item
        else 0
    )

    new_quantity = (
        existing_quantity + quantity
    )

    if new_quantity > available_stock:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only {available_stock} units "
                f"are available in stock"
            )
        )

    if item:
        item.quantity = new_quantity
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=quantity
        )

        db.add(item)

    db.commit()

    return {
        "message": "Product added to cart",
        "product_id": product.id,
        "quantity": new_quantity
    }


# =========================================================
# UPDATE CART ITEM
# =========================================================

@router.patch("/items/{item_id}")
def update_cart_item(
    item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    item = (
        db.query(CartItem)
        .join(
            Cart,
            Cart.id == CartItem.cart_id
        )
        .filter(
            CartItem.id == item_id,
            Cart.user_id == current_user.id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    available_stock = (
        db.query(
            func.coalesce(
                func.sum(ProductBatch.quantity),
                0
            )
        )
        .filter(
            ProductBatch.product_id == item.product_id,
            ProductBatch.is_active.is_(True)
        )
        .scalar()
    )

    if quantity > available_stock:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only {available_stock} units "
                f"are available in stock"
            )
        )

    item.quantity = quantity

    db.commit()
    db.refresh(item)

    return {
        "message": "Cart item updated",
        "item_id": item.id,
        "quantity": item.quantity
    }


# =========================================================
# REMOVE CART ITEM
# =========================================================

@router.delete("/items/{item_id}")
def remove_cart_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    item = (
        db.query(CartItem)
        .join(
            Cart,
            Cart.id == CartItem.cart_id
        )
        .filter(
            CartItem.id == item_id,
            Cart.user_id == current_user.id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Cart item removed"
    }


# =========================================================
# CLEAR CART
# =========================================================

@router.delete("")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if not cart:
        return {
            "message": "Cart is already empty"
        }

    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete(
        synchronize_session=False
    )

    db.commit()

    return {
        "message": "Cart cleared successfully"
    }