from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TripExpenseInput(BaseModel):
    category_id: int = Field(
        ...,
        gt=0,
    )

    amount: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
    )

    description: str | None = Field(
        default=None,
        max_length=150,
    )


class TripCreate(BaseModel):
    loading_date: date

    lorry_id: int = Field(
        ...,
        gt=0,
    )

    loading_location: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    unloading_location: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    freight_amount: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
    )

    notes: str | None = None

    expenses: list[TripExpenseInput] = Field(
        default_factory=list,
    )


class TripUpdate(BaseModel):
    loading_date: date | None = None

    lorry_id: int | None = Field(
        default=None,
        gt=0,
    )

    loading_location: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    unloading_location: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    freight_amount: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
    )

    notes: str | None = None

    expenses: list[TripExpenseInput] | None = None


class TripExpenseResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    trip_expense_id: int
    trip_id: int
    category_id: int
    amount: Decimal
    description: str | None
    created_at: datetime
    updated_at: datetime


class TripResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    trip_id: int
    loading_date: date
    lorry_id: int
    loading_location: str
    unloading_location: str
    freight_amount: Decimal
    notes: str | None
    created_by: int
    updated_by: int | None
    created_at: datetime
    updated_at: datetime

    total_expenses: Decimal
    gross_profit: Decimal


class TripDetailResponse(TripResponse):
    expenses: list[TripExpenseResponse]


class TripCreateResponse(TripDetailResponse):
    pass
