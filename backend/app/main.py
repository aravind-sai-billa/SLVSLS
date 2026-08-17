from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth
from app.api.routes import lorry
from app.api.routes import trip
from app.api.routes import expense_category
from app.api.routes import monthly_expense
from app.api.routes import report
from app.api.routes import financial_dashboard
from app.api.routes import user
from app.core.config import settings


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(lorry.router)
app.include_router(trip.router)
app.include_router(expense_category.router)
app.include_router(monthly_expense.router)
app.include_router(report.router)
app.include_router(financial_dashboard.router)
app.include_router(user.router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
    }

