from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class ReportFilters(BaseModel):
    date_from: date | None = None
    date_to: date | None = None

    lorry_id: int | None = Field(
        default=None,
        gt=0,
    )

    search: str | None = None


class TripReportRow(BaseModel):
    trip_id: int
    loading_date: date
    lorry_id: int
    loading_location: str
    unloading_location: str
    freight_amount: Decimal
    total_expenses: Decimal
    gross_profit: Decimal


class MonthlyExpenseReportRow(BaseModel):
    monthly_expense_id: int
    expense_date: date
    lorry_id: int
    category_id: int
    description: str | None
    amount: Decimal


class TripsReportResponse(BaseModel):
    rows: list[TripReportRow]
    total_freight: Decimal
    total_expenses: Decimal
    total_gross_profit: Decimal


class MonthlyExpensesReportResponse(BaseModel):
    rows: list[MonthlyExpenseReportRow]
    total_expenses: Decimal
