from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LorryCreate(BaseModel):
    registration_number: str = Field(
        ...,
        min_length=1,
        max_length=20,
    )
    nickname: str | None = Field(
        default=None,
        max_length=50,
    )
    owner_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )


class LorryUpdate(BaseModel):
    registration_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )
    nickname: str | None = Field(
        default=None,
        max_length=50,
    )
    owner_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )


class LorryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lorry_id: int
    registration_number: str
    nickname: str | None
    owner_name: str
    created_at: datetime
    updated_at: datetime