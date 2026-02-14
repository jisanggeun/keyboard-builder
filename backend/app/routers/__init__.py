from app.routers.parts import router as parts_router
from app.routers.auth import router as auth_router
from app.routers.builds import router as builds_router

__all__ = ["parts_router", "auth_router", "builds_router"]
