import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  deleteMonthlyExpense,
  getLorries,
  getMonthlyExpense,
  getMonthlyExpenseCategories,
  updateMonthlyExpense,
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

  if (!year || !month || !day) {
    return value;
  }

  return `${day}-${month}-${year}`;
}

function MonthlyExpenseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const expenseId = Number(id);

  const [expense, setExpense] =
    useState<MonthlyExpense | null>(null);

  const [lorries, setLorries] =
    useState<Lorry[]>([]);

  const [categories, setCategories] =
    useState<ExpenseCategory[]>([]);

  /*
   * IMPORTANT:
   * If the URL contains ?edit=1,
   * open this page directly in Edit Mode.
   *
   * View:
   * /expenses/1
   *
   * Edit:
   * /expenses/1?edit=1
   */
  const [editing, setEditing] = useState(
    searchParams.get("edit") === "1",
  );

  const [expenseDate, setExpenseDate] =
    useState("");

  const [lorryId, setLorryId] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

  useEffect(() => {
    if (
      !Number.isInteger(expenseId) ||
      expenseId <= 0
    ) {
      setError("Invalid monthly expense ID.");
      setLoading(false);
      return;
    }

    loadExpense();
  }, [expenseId]);

  async function loadExpense() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [
        expenseData,
        lorryData,
        categoryData,
      ] = await Promise.all([
        getMonthlyExpense(expenseId),
        getLorries(),
        getMonthlyExpenseCategories(),
      ]);

      setExpense(expenseData);
      setLorries(lorryData);
      setCategories(categoryData);

      populateForm(expenseData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load monthly expense.",
      );
    } finally {
      setLoading(false);
    }
  }

  function populateForm(
    expenseData: MonthlyExpense,
  ) {
    setExpenseDate(
      expenseData.expense_date,
    );

    setLorryId(
      String(expenseData.lorry_id),
    );

    setCategoryId(
      String(expenseData.category_id),
    );

    setDescription(
      expenseData.description || "",
    );

    setAmount(
      String(expenseData.amount),
    );
  }

  function startEditing() {
    setError("");
    setSuccess("");
    setEditing(true);
  }

  function cancelEditing() {
    if (expense) {
      populateForm(expense);
    }

    setEditing(false);
    setError("");
  }

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!expenseDate) {
      setError(
        "Please select an expense date.",
      );
      return;
    }

    if (!lorryId) {
      setError("Please select a lorry.");
      return;
    }

    if (!categoryId) {
      setError(
        "Please select an expense category.",
      );
      return;
    }

    if (!amount || Number(amount) < 0) {
      setError(
        "Please enter a valid amount.",
      );
      return;
    }

    try {
      setSaving(true);

      const updatedExpense =
        await updateMonthlyExpense(
          expenseId,
          {
            expense_date: expenseDate,
            lorry_id: Number(lorryId),
            category_id: Number(categoryId),
            description:
              description.trim() || null,
            amount: Number(amount),
          },
        );

      setExpense(updatedExpense);
      populateForm(updatedExpense);

      setEditing(false);

      setSuccess(
        "Monthly expense updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update monthly expense.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;

    const categoryName =
      categoryMap.get(
        expense.category_id,
      ) || "Unknown category";

    const lorryName =
      lorryMap.get(expense.lorry_id) ||
      "Unknown lorry";

    const confirmed = window.confirm(
      `Delete this monthly expense?\n\n` +
        `Date: ${formatDate(
          expense.expense_date,
        )}\n` +
        `Lorry: ${lorryName}\n` +
        `Category: ${categoryName}\n` +
        `Total Expense: ${formatCurrency(
          Number(expense.amount),
        )}`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteMonthlyExpense(expenseId);

      navigate("/expenses");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete monthly expense.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          Loading monthly expense...
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6 space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "Monthly expense not found."}
        </div>

        <button
          type="button"
          onClick={() => navigate("/expenses")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          ← Back to Monthly Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Monthly Expense Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Expense #{expense.monthly_expense_id}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/expenses")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Monthly Expenses
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          VIEW MODE
      ===================================================== */}

      {!editing && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Expense Date */}
            <div>
              <p className="text-sm text-slate-500">
                Expense Date
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  expense.expense_date,
                )}
              </p>
            </div>

            {/* Lorry */}
            <div>
              <p className="text-sm text-slate-500">
                Lorry
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {lorryMap.get(
                  expense.lorry_id,
                ) ||
                  `Lorry #${expense.lorry_id}`}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {categoryMap.get(
                  expense.category_id,
                ) ||
                  `Category #${expense.category_id}`}
              </p>
            </div>

            {/* Total Expense */}
            <div>
              <p className="text-sm text-slate-500">
                Total Expense
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(
                  Number(expense.amount),
                )}
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">
                Description
              </p>

              <p className="mt-1 text-slate-900">
                {expense.description ||
                  "No description provided."}
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap justify-end gap-3">

            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Edit Expense
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-300 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Expense"}
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODE
      ===================================================== */}

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >

          {/* Form Header */}
          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold text-slate-900">
              Edit Monthly Expense
            </h2>

            <button
              type="button"
              onClick={cancelEditing}
              className="text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>

          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Expense Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expense Date
              </label>

              <input
                type="date"
                value={expenseDate}
                onChange={(event) =>
                  setExpenseDate(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Lorry */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lorry
              </label>

              <select
                value={lorryId}
                onChange={(event) =>
                  setLorryId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Lorry
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
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.category_id
                      }
                      value={
                        category.category_id
                      }
                    >
                      {category.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Total Expense */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Expense
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>

            <input
              type="text"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Optional description"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      )}

    </div>
  );
}

export default MonthlyExpenseDetails;