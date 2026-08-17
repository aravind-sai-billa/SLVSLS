"""seed initial monthly expense categories

Revision adds the initial system-level Monthly Expense categories.
These are default selectable categories only; users are not required
to enter all categories for every expense.

Custom Monthly categories remain supported through the application.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7a91c4e2f6b1"
down_revision: Union[str, Sequence[str], None] = "6ebfa6929e99"
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
                seed.name,
                'MONTHLY',
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
                        ('Finance EMI', 1),
                        ('Maintenance', 2),
                        ('Insurance', 3),
                        ('Permit', 4),
                        ('Road Tax', 5),
                        ('Tyres', 6),
                        ('Service', 7),
                        ('Miscellaneous', 8)
                ) AS seed(name, sort_order)
            WHERE EXISTS (
                SELECT 1
                FROM users
            )
            AND NOT EXISTS (
                SELECT 1
                FROM expense_categories ec
                WHERE ec.name = seed.name
                  AND ec.category_type = 'MONTHLY'
            )
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            DELETE FROM expense_categories
            WHERE category_type = 'MONTHLY'
              AND name IN (
                  'Finance EMI',
                  'Maintenance',
                  'Insurance',
                  'Permit',
                  'Road Tax',
                  'Tyres',
                  'Service',
                  'Miscellaneous'
              )
            """
        )
    )
