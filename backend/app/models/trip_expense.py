from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TripExpense(Base):
    __tablename__ = "trip_expenses"

    trip_expense_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    trip_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "trips.trip_id",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    category_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "expense_categories.category_id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
