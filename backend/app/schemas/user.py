from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


VALID_USER_ROLES = {
    "ADMIN",
    "USER",
}

VALID_USER_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}


class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
    )

    role: str = Field(
        default="USER",
        min_length=1,
        max_length=20,
    )

    status: str = Field(
        default="ACTIVE",
        min_length=1,
        max_length=20,
    )


class UserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
    )

    password: str | None = Field(
        default=None,
        min_length=6,
        max_length=100,
    )

    role: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )


class UserResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    user_id: int
    username: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime
