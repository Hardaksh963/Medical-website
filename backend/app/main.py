from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.cart import router as cart_router
from app.api.orders import router as orders_router
from app.api.inventory import router as inventory_router

from app.api.dependencies import get_current_user
from app.api.admin_dependencies import get_current_admin
from app.models.user import User
from app.api.complaints import router as complaints_router
from app.api.admin_dashboard import router as admin_dashboard_router
from app.api.payments import router as payments_router
from app.api.reviews import router as reviews_router

app = FastAPI(
    title="Medical Store API",
    description="Backend API for a medical products e-commerce platform",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(inventory_router)
app.include_router(complaints_router)
app.include_router(admin_dashboard_router)
app.include_router(payments_router)
app.include_router(reviews_router)

@app.get("/")
def root():

    return {
        "message": "Medical Store API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }

@app.get("/test/user")
def test_user(
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Authenticated successfully",
        "user": current_user.email,
        "role": current_user.role,
    }


@app.get("/test/admin")
def test_admin(
    current_user: User = Depends(get_current_admin),
):
    return {
        "message": "Admin access granted",
        "user": current_user.email,
        "role": current_user.role,
    }