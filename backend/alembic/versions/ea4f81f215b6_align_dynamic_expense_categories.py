"""align dynamic expense categories

Revision ID: ea4f81f215b6
Revises: 1698088aefd3
Create Date: 2026-08-16 11:45:03.151570

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ea4f81f215b6"
down_revision: Union[str, Sequence[str], None] = "1698088aefd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply dynamic expense category constraints and seed initial categories."""

    # --------------------------------------------------------
    # Constraints and indexes
    # --------------------------------------------------------

    op.create_index(
        "ix_expense_categories_type_active_sort",
        "expense_categories",
        ["category_type", "is_active", "sort_order"],
        unique=False,
    )

    op.create_index(
        "uq_expense_categories_active_name_type",
        "expense_categories",
        ["category_type", "name"],
        unique=True,
        postgresql_where=sa.text("is_active = true"),
    )

    op.create_check_constraint(
        "ck_expense_categories_category_type",
        "expense_categories",
        "category_type IN ('TRIP', 'MONTHLY')",
    )

    # --------------------------------------------------------
    # Seed initial Trip expense categories
    #
    # The existing admin/user table is used to determine
    # created_by. No hard-coded user ID is introduced.
    # --------------------------------------------------------

    op.execute(
        sa.text(
            """
            INSERT INTO expense_categories
                (
                    name,
                    category_type,
                    is_active,
                    sort_order,
                    created_by,
                    created_at,
                    updated_at
                )
            SELECT
                seed.name,
                'TRIP',
                TRUE,
                seed.sort_order,
                (
                    SELECT user_id
                    FROM users
                    ORDER BY user_id
                    LIMIT 1
                ),
                NOW(),
                NOW()
            FROM
                (
                    VALUES
                        ('Diesel', 1),
                        ('Driver Bata', 2),
                        ('Toll', 3),
                        ('Loading', 4),
                        ('Unloading', 5),
                        ('Brokerage', 6)
                ) AS seed(name, sort_order)
            WHERE EXISTS (
                SELECT 1
                FROM users
            )
            AND NOT EXISTS (
                SELECT 1
                FROM expense_categories ec
                WHERE ec.name = seed.name
                  AND ec.category_type = 'TRIP'
            )
            """
        )
    )


def downgrade() -> None:
    """Reverse dynamic expense category constraints and seed data."""

    # --------------------------------------------------------
    # Remove only the categories seeded by this migration.
    # Do not remove categories that may have been created
    # later by application users.
    # --------------------------------------------------------

    op.execute(
        sa.text(
            """
            DELETE FROM expense_categories
            WHERE category_type = 'TRIP'
              AND name IN (
                  'Diesel',
                  'Driver Bata',
                  'Toll',
                  'Loading',
                  'Unloading',
                  'Brokerage'
              )
            """
        )
    )

    op.drop_constraint(
        "ck_expense_categories_category_type",
        "expense_categories",
        type_="check",
    )

    op.drop_index(
        "uq_expense_categories_active_name_type",
        table_name="expense_categories",
    )

    op.drop_index(
        "ix_expense_categories_type_active_sort",
        table_name="expense_categories",
    )
