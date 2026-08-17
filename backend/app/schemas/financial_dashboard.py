from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class FinancialSummary(BaseModel):
    net_freight: Decimal
    trip_expenses: Decimal
    monthly_expenses: Decimal
    net_cost: Decimal
    gross_profit: Decimal
    net_profit: Decimal


class LorryFinancialSummary(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    lorry_id: int
    registration_number: str
    nickname: str | None

    net_freight: Decimal
    trip_expenses: Decimal
    monthly_expenses: Decimal
    net_cost: Decimal
    gross_profit: Decimal
    net_profit: Decimal


class FinancialDashboardResponse(BaseModel):
    date_from: str
    date_to: str

    lorry_id: int | None

    overall: FinancialSummary

    lorries: list[LorryFinancialSummary]
