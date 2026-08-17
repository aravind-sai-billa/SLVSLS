from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MonthlyExpenseCreate(BaseModel):
    expense_date: date

    lorry_id: int = Field(
        ...,
        gt=0,
    )

    category_id: int = Field(
        ...,
        gt=0,
    )

    description: str | None = Field(
        default=None,
        max_length=150,
    )

    amount: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
    )


class MonthlyExpenseUpdate(BaseModel):
    expense_date: date | None = None

    lorry_id: int | None = Field(
        default=None,
        gt=0,
    )

    category_id: int | None = Field(
        default=None,
        gt=0,
    )

    description: str | None = Field(
        default=None,
        max_length=150,
    )

    amount: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
    )


class MonthlyExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    monthly_expense_id: int
    expense_date: date
    lorry_id: int
    category_id: int
    description: str | None
    amount: Decimal
    created_by: int
    updated_by: int | None
    created_at: datetime
    updated_at: datetime
