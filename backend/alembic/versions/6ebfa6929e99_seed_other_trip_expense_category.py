"""seed other trip expense category

Revision adds the system-level Other Trip Expense category.
Custom Other expense descriptions remain ordinary text and
do not create permanent categories.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6ebfa6929e99"
down_revision: Union[str, Sequence[str], None] = "ea4f81f215b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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
                'Other',
                'TRIP',
                TRUE,
                7,
                (
                    SELECT user_id
                    FROM users
                    ORDER BY user_id
                    LIMIT 1
                ),
                NOW(),
                NOW()
            WHERE EXISTS (
                SELECT 1
                FROM users
            )
            AND NOT EXISTS (
                SELECT 1
                FROM expense_categories
                WHERE name = 'Other'
                  AND category_type = 'TRIP'
            )
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            DELETE FROM expense_categories
            WHERE name = 'Other'
              AND category_type = 'TRIP'
            """
        )
    )

