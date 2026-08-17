from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import (
    MonthlyExpensesReportResponse,
    TripsReportResponse,
)
from app.services.report import (
    get_monthly_expenses_report_service,
    get_trips_report_service,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/trips",
    response_model=TripsReportResponse,
)
def get_trips_report(
    date_from: date | None = Query(
        default=None,
    ),
    date_to: date | None = Query(
        default=None,
    ),
    lorry_id: int | None = Query(
        default=None,
        gt=0,
    ),
    search: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_trips_report_service(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        search=search,
    )


@router.get(
    "/monthly-expenses",
    response_model=MonthlyExpensesReportResponse,
)
def get_monthly_expenses_report(
    date_from: date | None = Query(
        default=None,
    ),
    date_to: date | None = Query(
        default=None,
    ),
    lorry_id: int | None = Query(
        default=None,
        gt=0,
    ),
    category_id: int | None = Query(
        default=None,
        gt=0,
    ),
    search: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_monthly_expenses_report_service(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        category_id=category_id,
        search=search,
    )
