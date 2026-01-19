from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, users, patients, departments, doctors
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

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to WildHeads HRM API"}
