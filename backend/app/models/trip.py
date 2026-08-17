from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Trip(Base):
    __tablename__ = "trips"

    trip_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    loading_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    lorry_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "lorries.lorry_id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    loading_location: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    unloading_location: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    freight_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "users.user_id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    updated_by: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            "users.user_id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
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
