from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories.report import (
    get_monthly_expense_report_rows,
    get_trip_report_rows,
)
from app.repositories.trip_expense import (
    get_trip_expense_total,
)
from app.schemas.report import (
    MonthlyExpenseReportRow,
    MonthlyExpensesReportResponse,
    TripReportRow,
    TripsReportResponse,
)


def get_trips_report_service(
    db: Session,
    date_from=None,
    date_to=None,
    lorry_id: int | None = None,
    search: str | None = None,
) -> TripsReportResponse:
    trips = get_trip_report_rows(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        search=search,
    )

    rows: list[TripReportRow] = []

    total_freight = Decimal("0.00")
    total_expenses = Decimal("0.00")
    total_gross_profit = Decimal("0.00")

    for trip in trips:
        freight = Decimal(trip.freight_amount)

        expenses = Decimal(
            get_trip_expense_total(
                db=db,
                trip_id=trip.trip_id,
            )
        )

        gross_profit = freight - expenses

        rows.append(
            TripReportRow(
                trip_id=trip.trip_id,
                loading_date=trip.loading_date,
                lorry_id=trip.lorry_id,
                loading_location=trip.loading_location,
                unloading_location=trip.unloading_location,
                freight_amount=freight,
                total_expenses=expenses,
                gross_profit=gross_profit,
            )
        )

        total_freight += freight
        total_expenses += expenses
        total_gross_profit += gross_profit

    return TripsReportResponse(
        rows=rows,
        total_freight=total_freight,
        total_expenses=total_expenses,
        total_gross_profit=total_gross_profit,
    )


def get_monthly_expenses_report_service(
    db: Session,
    date_from=None,
    date_to=None,
    lorry_id: int | None = None,
    category_id: int | None = None,
    search: str | None = None,
) -> MonthlyExpensesReportResponse:
    expenses = get_monthly_expense_report_rows(
        db=db,
        date_from=date_from,
        date_to=date_to,
        lorry_id=lorry_id,
        category_id=category_id,
        search=search,
    )

    rows: list[MonthlyExpenseReportRow] = []

    total_expenses = Decimal("0.00")

    for expense in expenses:
        amount = Decimal(expense.amount)

        rows.append(
            MonthlyExpenseReportRow(
                monthly_expense_id=expense.monthly_expense_id,
                expense_date=expense.expense_date,
                lorry_id=expense.lorry_id,
                category_id=expense.category_id,
                description=expense.description,
                amount=amount,
            )
        )

        total_expenses += amount

    return MonthlyExpensesReportResponse(
        rows=rows,
        total_expenses=total_expenses,
    )
