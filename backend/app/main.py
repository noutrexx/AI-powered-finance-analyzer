from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import analytics, auth, transactions

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="Upload bank transactions, classify spending, and review personal finance insights.",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", tags=["health"])
    def root() -> dict[str, str]:
        return {"message": settings.app_name}

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(transactions.router, prefix=settings.api_prefix)
    app.include_router(analytics.router, prefix=settings.api_prefix)

    return app


app = create_app()
