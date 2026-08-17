from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    __table_args__ = (
        CheckConstraint(
            "category_type IN ('TRIP', 'MONTHLY')",
            name="ck_expense_categories_category_type",
        ),
        Index(
            "uq_expense_categories_active_name_type",
            "category_type",
            "name",
            unique=True,
            postgresql_where="is_active = true",
        ),
        Index(
            "ix_expense_categories_type_active_sort",
            "category_type",
            "is_active",
            "sort_order",
        ),
    )

    category_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    sort_order: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
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
