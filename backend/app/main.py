from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.cart import router as cart_router
from app.api.orders import router as orders_router

from app.api.auth import router as auth_router
from app.api.products import router as products_router


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