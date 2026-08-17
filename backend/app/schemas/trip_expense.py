from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TripExpenseCreate(BaseModel):
    category_id: int = Field(..., gt=0)

    amount: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
    )

    description: str | None = Field(
        default=None,
        max_length=150,
    )

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value if value else None


class TripExpenseUpdate(BaseModel):
    category_id: int | None = Field(
        default=None,
        gt=0,
    )

    amount: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
    )

    description: str | None = Field(
        default=None,
        max_length=150,
    )

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value if value else None


class TripExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_expense_id: int
    trip_id: int
    category_id: int
    amount: Decimal
    description: str | None
    created_at: datetime
    updated_at: datetime


class TripExpenseTotalResponse(BaseModel):
    trip_id: int
    total_expenses: Decimal
