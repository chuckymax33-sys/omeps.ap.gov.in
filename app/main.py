import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database.connection import engine, Base
from app.models.user import AdminUser
from app.database.connection import SessionLocal
from app.auth.jwt import get_password_hash
from app.api import auth, permits

# Create database tables automatically
# Note: SQLAlchemy's create_all will not overwrite existing tables.
Base.metadata.create_all(bind=engine)

# Seed default admin user on startup
db = SessionLocal()
try:
    admin_count = db.query(AdminUser).count()
    if admin_count == 0:
        default_user = os.getenv("ADMIN_USERNAME", "admin")
        default_pass = os.getenv("ADMIN_PASSWORD", "admin123")
        hashed_password = get_password_hash(default_pass)
        
        db_admin = AdminUser(
            username=default_user,
            hashed_password=hashed_password
        )
        db.add(db_admin)
        db.commit()
        print(f"[*] Default admin user seeded successfully: username='{default_user}' (password set from env)")
finally:
    db.close()

# Initialize FastAPI App
app = FastAPI(
    title="Transit Permit Portal Backend",
    description="Enterprise-grade FastAPI backend for Transport Transit Permit Management",
    version="1.0.0"
)

# CORS configurations
# FRONTEND_URL = Vercel frontend URL in production
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Mount Routers
app.include_router(auth.router)
app.include_router(permits.router)

# Mount static file directory for local PDF/QR fallback
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static_files")

# API root — frontend is served from Vercel
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Transport Transit Permit Management API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
