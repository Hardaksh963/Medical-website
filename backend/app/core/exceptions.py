from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


def register_exception_handlers(app):

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request,
        exc: IntegrityError
    ):
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Database constraint violation",
                "message": "The requested operation conflicts with existing data."
            }
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(
        request: Request,
        exc: ValueError
    ):
        return JSONResponse(
            status_code=400,
            content={
                "detail": "Invalid value",
                "message": str(exc)
            }
        )