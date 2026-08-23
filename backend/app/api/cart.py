from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


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

    if item:

        item.quantity += quantity

    else:

        item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=quantity
        )

        db.add(item)

    db.commit()

    return {
        "message": "Product added to cart"
    }