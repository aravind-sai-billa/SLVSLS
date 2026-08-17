import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createExpenseCategory,
  createMonthlyExpense,
  getLorries,
  getMonthlyExpenseCategories,
  type ExpenseCategory,
  type Lorry,
} from "../../lib/slvslsApi";

function MonthlyExpenseForm() {
  const navigate = useNavigate();

  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [lorryId, setLorryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    try {
      setLoading(true);
      setError("");

      const [lorryRows, categoryRows] =
        await Promise.all([
          getLorries(),
          getMonthlyExpenseCategories(),
        ]);

      setLorries(lorryRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load expense form.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const category = await createExpenseCategory(
        name,
        "MONTHLY",
        categories.length + 1,
      );

      setCategories((current) => [
        ...current,
        category,
      ]);

      setCategoryId(
        String(category.category_id),
      );

      setNewCategoryName("");
      setShowCategoryForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create category.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!expenseDate) {
      setError("Please select an expense date.");
      return;
    }

    if (!lorryId) {
      setError("Please select a lorry.");
      return;
    }

    if (!categoryId) {
      setError("Please select an expense category.");
      return;
    }

    if (!amount || Number(amount) < 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      await createMonthlyExpense({
        expense_date: expenseDate,
        lorry_id: Number(lorryId),
        category_id: Number(categoryId),
        description:
          description.trim() || null,
        amount: Number(amount),
      });

      navigate("/expenses");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create monthly expense.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          Loading expense form...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Add Monthly Expense
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a recurring or vehicle-related monthly expense.
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

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Create New Monthly Expense
          </h2>

          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>

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
                setExpenseDate(event.target.value)
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
                setLorryId(event.target.value)
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
                setCategoryId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">
                Select Category
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

            <button
              type="button"
              onClick={() => {
                setShowCategoryForm(
                  (current) => !current,
                );
                setError("");
              }}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              {showCategoryForm
                ? "Cancel Add Category"
                : "+ Add New Category"}
            </button>

            {/* Category creation */}
            {showCategoryForm && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-medium text-slate-900">
                  Create Monthly Category
                </h3>

                <div className="mt-3 flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(event) =>
                      setNewCategoryName(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Parking"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
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
                setAmount(event.target.value)
              }
              placeholder="0.00"
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
              setDescription(event.target.value)
            }
            placeholder="Optional description"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/expenses")}
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
              : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MonthlyExpenseForm;