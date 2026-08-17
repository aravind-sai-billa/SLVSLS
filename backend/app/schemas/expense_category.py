from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


VALID_CATEGORY_TYPES = {"TRIP", "MONTHLY"}


class ExpenseCategoryCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    category_type: str = Field(
        ...,
        min_length=1,
        max_length=20,
    )

    sort_order: int = Field(
        default=0,
        ge=0,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Category name cannot be empty")

        return value

    @field_validator("category_type")
    @classmethod
    def validate_category_type(cls, value: str) -> str:
        value = value.strip().upper()

        if value not in VALID_CATEGORY_TYPES:
            raise ValueError(
                "Category type must be TRIP or MONTHLY"
            )

        return value


class ExpenseCategoryUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    sort_order: int | None = Field(
        default=None,
        ge=0,
    )

    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Category name cannot be empty")

        return value


class ExpenseCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    name: str
    category_type: str
    is_active: bool
    sort_order: int
    created_by: int
    updated_by: int | None
    created_at: datetime
    updated_at: datetime
