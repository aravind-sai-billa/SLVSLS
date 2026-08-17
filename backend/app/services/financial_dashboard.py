from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.financial_dashboard import (
    get_financial_lorries,
    get_lorry_freight,
    get_lorry_monthly_expenses,
    get_lorry_trip_expenses,
)
from app.schemas.financial_dashboard import (
    FinancialDashboardResponse,
    FinancialSummary,
    LorryFinancialSummary,
)


def calculate_financial_summary(
    net_freight: Decimal,
    trip_expenses: Decimal,
    monthly_expenses: Decimal,
) -> FinancialSummary:
    net_cost = (
        trip_expenses
        + monthly_expenses
    )

    gross_profit = (
        net_freight
        - trip_expenses
    )

    net_profit = (
        gross_profit
        - monthly_expenses
    )

    return FinancialSummary(
        net_freight=net_freight,
        trip_expenses=trip_expenses,
        monthly_expenses=monthly_expenses,
        net_cost=net_cost,
        gross_profit=gross_profit,
        net_profit=net_profit,
    )


def get_financial_dashboard_service(
    db: Session,
    date_from: date,
    date_to: date,
    lorry_id: int | None = None,
) -> FinancialDashboardResponse:

    if date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date From cannot be after Date To",
        )

    lorries = get_financial_lorries(
        db=db,
        lorry_id=lorry_id,
    )

    if lorry_id is not None and not lorries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lorry not found",
        )

    lorry_rows: list[LorryFinancialSummary] = []

    overall_net_freight = Decimal("0.00")
    overall_trip_expenses = Decimal("0.00")
    overall_monthly_expenses = Decimal("0.00")

    for lorry in lorries:

        net_freight = get_lorry_freight(
            db=db,
            lorry_id=lorry.lorry_id,
            date_from=date_from,
            date_to=date_to,
        )

        trip_expenses = get_lorry_trip_expenses(
            db=db,
            lorry_id=lorry.lorry_id,
            date_from=date_from,
            date_to=date_to,
        )

        monthly_expenses = (
            get_lorry_monthly_expenses(
                db=db,
                lorry_id=lorry.lorry_id,
                date_from=date_from,
                date_to=date_to,
            )
        )

        summary = calculate_financial_summary(
            net_freight=net_freight,
            trip_expenses=trip_expenses,
            monthly_expenses=monthly_expenses,
        )

        lorry_rows.append(
            LorryFinancialSummary(
                lorry_id=lorry.lorry_id,
                registration_number=(
                    lorry.registration_number
                ),
                nickname=lorry.nickname,
                net_freight=summary.net_freight,
                trip_expenses=summary.trip_expenses,
                monthly_expenses=(
                    summary.monthly_expenses
                ),
                net_cost=summary.net_cost,
                gross_profit=summary.gross_profit,
                net_profit=summary.net_profit,
            )
        )

        overall_net_freight += net_freight
        overall_trip_expenses += trip_expenses
        overall_monthly_expenses += (
            monthly_expenses
        )

    overall = calculate_financial_summary(
        net_freight=overall_net_freight,
        trip_expenses=overall_trip_expenses,
        monthly_expenses=overall_monthly_expenses,
    )

    return FinancialDashboardResponse(
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        lorry_id=lorry_id,
        overall=overall,
        lorries=lorry_rows,
    )
