import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteMonthlyExpense,
  getLorries,
  getMonthlyExpenseCategories,
  getMonthlyExpenses,
  type ExpenseCategory,
  type Lorry,
  type MonthlyExpense,
} from "../../lib/slvslsApi";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}-${month}-${year}`;
}

function MonthlyExpenses() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lorryFilter, setLorryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const [
        expenseRows,
        lorryRows,
        categoryRows,
      ] = await Promise.all([
        getMonthlyExpenses({
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          lorry_id: lorryFilter
            ? Number(lorryFilter)
            : undefined,
          category_id: categoryFilter
            ? Number(categoryFilter)
            : undefined,
        }),
        getLorries(),
        getMonthlyExpenseCategories(),
      ]);

      setExpenses(expenseRows);
      setLorries(lorryRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load monthly expenses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [
    dateFrom,
    dateTo,
    lorryFilter,
    categoryFilter,
  ]);

  const lorryMap = useMemo(
    () =>
      new Map(
        lorries.map((lorry) => [
          lorry.lorry_id,
          lorry.registration_number,
        ]),
      ),
    [lorries],
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.category_id,
          category.name,
        ]),
      ),
    [categories],
  );

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setLorryFilter("");
    setCategoryFilter("");
  }

  async function handleDelete(
    expense: MonthlyExpense,
  ) {
    const category =
      categoryMap.get(expense.category_id) ||
      "Unknown category";

    const confirmed = window.confirm(
      `Delete this monthly expense?\n\n` +
        `Date: ${formatDate(expense.expense_date)}\n` +
        `Category: ${category}\n` +
        `Amount: ${formatCurrency(Number(expense.amount))}`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteMonthlyExpense(
        expense.monthly_expense_id,
      );

      setSuccess(
        "Monthly expense deleted successfully.",
      );

      await loadPage();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete monthly expense.",
      );
    }
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 28px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          gap: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              color: "#08060d",
            }}
          >
            Monthly Expenses
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "#6b6375",
            }}
          >
            Manage recurring and vehicle-related
            monthly expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/expenses/new")}
          style={primaryButton}
        >
          + Add Expense
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {success && (
        <div style={successBox}>
          {success}
        </div>
      )}

      {/* FILTERS */}
      <section style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={sectionTitle}>
              Filters
            </h2>

            <p style={sectionSubtitle}>
              Filter monthly expenses by date,
              lorry or category.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            style={linkButton}
          >
            Clear Filters
          </button>
        </div>

        <div style={grid4}>
          <label style={label}>
            Date From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) =>
                setDateFrom(e.target.value)
              }
              style={input}
            />
          </label>

          <label style={label}>
            Date To
            <input
              type="date"
              value={dateTo}
              onChange={(e) =>
                setDateTo(e.target.value)
              }
              style={input}
            />
          </label>

          <label style={label}>
            Lorry
            <select
              value={lorryFilter}
              onChange={(e) =>
                setLorryFilter(e.target.value)
              }
              style={input}
            >
              <option value="">
                All Lorries
              </option>

              {lorries.map((lorry) => (
                <option
                  key={lorry.lorry_id}
                  value={lorry.lorry_id}
                >
                  {lorry.registration_number}
                  {lorry.nickname
                    ? ` — ${lorry.nickname}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label style={label}>
            Category
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              style={input}
            >
              <option value="">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.category_id}
                  value={category.category_id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* TABLE */}
      <section style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={sectionTitle}>
              Monthly Expenses
            </h2>

            <p style={sectionSubtitle}>
              {loading
                ? "Loading..."
                : `Showing ${expenses.length} expense${
                    expenses.length === 1
                      ? ""
                      : "s"
                  }`}
            </p>
          </div>

          <button
            type="button"
            onClick={loadPage}
            style={linkButton}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={emptyState}>
            Loading monthly expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div style={emptyState}>
            No monthly expenses found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 850,
              }}
            >
              <thead>
                <tr>
                  <th style={th}>DATE</th>
                  <th style={th}>LORRY</th>
                  <th style={th}>CATEGORY</th>
                  <th style={th}>DESCRIPTION</th>

                  <th
                    style={{
                      ...th,
                      textAlign: "right",
                    }}
                  >
                    TOTAL EXPENSE
                  </th>

                  <th
                    style={{
                      ...th,
                      textAlign: "right",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.monthly_expense_id}
                  >
                    <td style={td}>
                      {formatDate(
                        expense.expense_date,
                      )}
                    </td>

                    <td style={td}>
                      <strong>
                        {lorryMap.get(
                          expense.lorry_id,
                        ) ||
                          `Lorry #${expense.lorry_id}`}
                      </strong>
                    </td>

                    <td style={td}>
                      {categoryMap.get(
                        expense.category_id,
                      ) ||
                        `Category #${expense.category_id}`}
                    </td>

                    <td
                      style={{
                        ...td,
                        color: "#6b6375",
                      }}
                    >
                      {expense.description || "—"}
                    </td>

                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(
                        Number(expense.amount),
                      )}
                    </td>

                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/expenses/${expense.monthly_expense_id}`,
                          )
                        }
                        style={actionButton}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/expenses/${expense.monthly_expense_id}?edit=1`,
                          )
                        }
                        style={actionButton}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(expense)
                        }
                        style={{
                          ...actionButton,
                          color: "#dc2626",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e4e7",
  borderRadius: 14,
  padding: 26,
  marginBottom: 24,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  color: "#08060d",
};

const sectionSubtitle: React.CSSProperties = {
  marginTop: 6,
  color: "#6b6375",
  fontSize: 14,
};

const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#08060d",
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #d8d5dd",
  borderRadius: 8,
  fontSize: 14,
  background: "#ffffff",
};

const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: 18,
};

const th: React.CSSProperties = {
  padding: "13px 12px",
  borderBottom: "1px solid #e5e4e7",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b6375",
};

const td: React.CSSProperties = {
  padding: "15px 12px",
  borderBottom: "1px solid #eeeef1",
  fontSize: 14,
  color: "#08060d",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "12px 18px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};



const linkButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  fontWeight: 600,
  cursor: "pointer",
};

const actionButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  fontWeight: 600,
  cursor: "pointer",
  marginLeft: 12,
};

const emptyState: React.CSSProperties = {
  padding: "50px 20px",
  textAlign: "center",
  color: "#6b6375",
};

const errorBox: React.CSSProperties = {
  padding: "12px 16px",
  marginBottom: 20,
  borderRadius: 8,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
};

const successBox: React.CSSProperties = {
  padding: "12px 16px",
  marginBottom: 20,
  borderRadius: 8,
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
};

export default MonthlyExpenses;