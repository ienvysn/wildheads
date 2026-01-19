from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, users, patients, departments, doctors, admin, ai, vitals, appointments
from .core.logging import setup_logging, logger
from .core.exceptions import CredentialsException, EmailAlreadyRegisteredException

# Lifecycle context
@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting up WildHeads HRM API...")
    # Initialize DB (Dev only)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="WildHeads HRM System",
    description="AI-Powered Hospital Resource Management System API",
    version="0.1.0",
    lifespan=lifespan
)

# Exception Handlers
@app.exception_handler(CredentialsException)
async def credentials_exception_handler(request: Request, exc: CredentialsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

@app.exception_handler(EmailAlreadyRegisteredException)
async def email_exists_handler(request: Request, exc: EmailAlreadyRegisteredException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(departments.router)
app.include_router(doctors.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(vitals.router)
app.include_router(appointments.router)

from fastapi import WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .services.websocket_manager import manager
from .services.auth_service import AuthService
from .database import get_db

@app.websocket("/ws/alerts")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Authenticate
        auth_service = AuthService(db)
        # We need to reuse the decode logic or get_current_user. 
        # But get_current_user dependency uses OAuth2PasswordBearer which checks headers.
        # We have to manually verify here.
        from jose import jwt, JWTError
        from .core.config import settings
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                await websocket.close(code=1008)
                return
        except JWTError:
            await websocket.close(code=1008)
            return

        user = await auth_service.user_service.get_user_by_email(email)
        if not user:
            await websocket.close(code=1008)
            return

        # Connect with ID and Role
        await manager.connect(websocket, user_id=user.id, role=user.role)
        
        try:
            while True:
                # Keep alive / listen for client messages if needed
                await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket)
            
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to WildHeads HRM API"}

# --- Admin Panel ---
from sqladmin import Admin
from .admin_interface import setup_admin

# Initialize Admin
# authentication_backend = ... (Optional: Add auth backend later if needed for security)
admin_panel = Admin(app, engine, title="WildHeads Admin", base_url="/db-admin")
setup_admin(admin_panel)
