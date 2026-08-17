from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.financial_dashboard import (
    FinancialDashboardResponse,
)
from app.services.financial_dashboard import (
    get_financial_dashboard_service,
)


router = APIRouter(
    prefix="/financial-dashboard",
    tags=["Financial Dashboard"],
)


@router.get(
    "",
    response_model=FinancialDashboardResponse,
)
def get_financial_dashboard(
    date_from: date = Query(...),
    date_to: date = Query(...),
    lorry_id: int | None = Query(
        default=None,
        gt=0,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_financial_dashboard_service(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
    )
