import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  deleteTrip,
  getLorries,
  getTrip,
  getTripExpenseCategories,
  updateTrip,
} from "../../lib/slvslsApi";

import type {
  ExpenseCategory,
  Lorry,
  TripDetailsResponse,
  TripExpenseInput,
} from "../../lib/slvslsApi";

interface OtherExpense {
  id: number;
  amount: string;
  description: string;
}

function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = Number(id);

  const [trip, setTrip] =
    useState<TripDetailsResponse | null>(null);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [categories, setCategories] = useState<
    ExpenseCategory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(
    searchParams.get("edit") === "1",
  );

  const [loadingDate, setLoadingDate] = useState("");
  const [lorryId, setLorryId] = useState("");
  const [loadingLocation, setLoadingLocation] = useState("");
  const [unloadingLocation, setUnloadingLocation] =
    useState("");
  const [freightAmount, setFreightAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [expenseAmounts, setExpenseAmounts] = useState<
    Record<number, string>
  >({});

  const [otherExpenses, setOtherExpenses] = useState<
    OtherExpense[]
  >([]);

  useEffect(() => {
    if (!Number.isInteger(tripId) || tripId <= 0) {
      setError("Invalid trip ID.");
      setLoading(false);
      return;
    }

    loadTrip();
  }, [tripId]);

  async function loadTrip() {
    setLoading(true);
    setError("");

    try {
      const [tripData, lorryData, categoryData] =
        await Promise.all([
          getTrip(tripId),
          getLorries(),
          getTripExpenseCategories(),
        ]);

      setTrip(tripData);
      setLorries(lorryData);
      setCategories(categoryData);

      populateForm(
        tripData,
        categoryData,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load trip.",
      );
    } finally {
      setLoading(false);
    }
  }

  function populateForm(
    tripData: TripDetailsResponse,
    categoryData: ExpenseCategory[],
  ) {
    setLoadingDate(tripData.loading_date);
    setLorryId(String(tripData.lorry_id));
    setLoadingLocation(tripData.loading_location);
    setUnloadingLocation(
      tripData.unloading_location,
    );
    setFreightAmount(
      String(tripData.freight_amount),
    );
    setNotes(tripData.notes ?? "");

    const otherCategory = categoryData.find(
      (category) =>
        category.category_type === "TRIP" &&
        category.name === "Other",
    );

    const amounts: Record<number, string> = {};
    const others: OtherExpense[] = [];

    tripData.expenses.forEach((expense) => {
      if (
        otherCategory &&
        expense.category_id ===
          otherCategory.category_id
      ) {
        others.push({
          id: expense.trip_expense_id,
          amount: String(expense.amount),
          description: expense.description ?? "",
        });
      } else {
        amounts[expense.category_id] =
          String(expense.amount);
      }
    });

    setExpenseAmounts(amounts);
    setOtherExpenses(others);
  }

  const tripCategories = useMemo(
    () =>
      categories
        .filter(
          (category) =>
            category.category_type === "TRIP" &&
            category.name !== "Other",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  const otherCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          category.category_type === "TRIP" &&
          category.name === "Other",
      ),
    [categories],
  );

  const editTotalExpenses = useMemo(() => {
    const normal = Object.values(expenseAmounts).reduce(
      (total, value) => {
        const amount = Number(value);
        return total + (Number.isFinite(amount) ? amount : 0);
      },
      0,
    );

    const other = otherExpenses.reduce((total, item) => {
      const amount = Number(item.amount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return normal + other;
  }, [expenseAmounts, otherExpenses]);

  const editFreight = Number(freightAmount) || 0;
  const editGrossProfit =
    editFreight - editTotalExpenses;

  function formatMoney(value: number) {
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function addOtherExpense() {
    setOtherExpenses((current) => [
      ...current,
      {
        id: Date.now(),
        amount: "",
        description: "",
      },
    ]);
  }

  function updateOtherExpense(
    id: number,
    field: "amount" | "description",
    value: string,
  ) {
    setOtherExpenses((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item,
      ),
    );
  }

  function removeOtherExpense(id: number) {
    setOtherExpenses((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function cancelEdit() {
    if (trip) {
      populateForm(trip, categories);
    }

    setEditing(false);
    setError("");
    setSuccess("");
    navigate(`/trips/${tripId}`, {
      replace: true,
    });
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!lorryId) {
      setError("Please select a lorry.");
      return;
    }

    if (!loadingLocation.trim()) {
      setError("Please enter the loading location.");
      return;
    }

    if (!unloadingLocation.trim()) {
      setError("Please enter the unloading location.");
      return;
    }

    if (!loadingDate) {
      setError("Please select the loading date.");
      return;
    }

    if (editFreight <= 0) {
      setError(
        "Freight amount must be greater than zero.",
      );
      return;
    }

    if (otherExpenses.length > 0 && !otherCategory) {
      setError(
        "The Other expense category is unavailable.",
      );
      return;
    }

    const expenses: TripExpenseInput[] = [];

    for (const category of tripCategories) {
      const raw =
        expenseAmounts[category.category_id] ?? "";

      if (!raw) {
        continue;
      }

      const amount = Number(raw);

      if (!Number.isFinite(amount) || amount < 0) {
        setError(
          `Invalid amount for ${category.name}.`,
        );
        return;
      }

      if (amount > 0) {
        expenses.push({
          category_id: category.category_id,
          amount,
        });
      }
    }

    for (const expense of otherExpenses) {
      const amount = Number(expense.amount);

      if (
        !expense.description.trim() ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        setError(
          "Every Other expense needs a description and a positive amount.",
        );
        return;
      }

      expenses.push({
        category_id: otherCategory!.category_id,
        amount,
        description: expense.description.trim(),
      });
    }

    setSaving(true);

    try {
      const updated = await updateTrip(tripId, {
        loading_date: loadingDate,
        lorry_id: Number(lorryId),
        loading_location:
          loadingLocation.trim(),
        unloading_location:
          unloadingLocation.trim(),
        freight_amount: editFreight,
        notes: notes.trim() || null,
        expenses,
      });

      setTrip(updated);
      populateForm(updated, categories);

      setEditing(false);
      setSuccess(
        `Trip #${tripId} updated successfully.`,
      );

      navigate(`/trips/${tripId}`, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update trip.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete Trip #${tripId}?\n\n` +
        "This will permanently delete the trip and its associated expenses.",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteTrip(tripId);

      navigate("/trips", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete trip.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading Trip #{tripId}...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error || "Trip not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="mt-4 text-sm text-blue-600 font-medium"
          >
            ← Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const lorry = lorries.find(
    (item) => item.lorry_id === trip.lorry_id,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Trips
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Trip #{trip.trip_id}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {trip.loading_location}
            {" → "}
            {trip.unloading_location}
          </p>
        </div>

        {!editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                navigate(
                  `/trips/${tripId}?edit=1`,
                  { replace: true },
                );
              }}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Edit Trip
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

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

      {/* EDIT */}
      {editing ? (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Trip
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update trip information and expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loading Date
              </label>

              <input
                type="date"
                value={loadingDate}
                onChange={(event) =>
                  setLoadingDate(event.target.value)
                }
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lorry
              </label>

              <select
                value={lorryId}
                onChange={(event) =>
                  setLorryId(event.target.value)
                }
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Select Lorry</option>

                {lorries.map((item) => (
                  <option
                    key={item.lorry_id}
                    value={item.lorry_id}
                  >
                    {item.registration_number}
                    {item.nickname
                      ? ` — ${item.nickname}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loading Location
              </label>

              <input
                value={loadingLocation}
                onChange={(event) =>
                  setLoadingLocation(event.target.value)
                }
                required
                maxLength={150}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unloading Location
              </label>

              <input
                value={unloadingLocation}
                onChange={(event) =>
                  setUnloadingLocation(event.target.value)
                }
                required
                maxLength={150}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Freight Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={freightAmount}
                onChange={(event) =>
                  setFreightAmount(event.target.value)
                }
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">
              Trip Expenses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tripCategories.map((category) => (
                <div key={category.category_id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {category.name}
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      expenseAmounts[
                        category.category_id
                      ] ?? ""
                    }
                    onChange={(event) =>
                      setExpenseAmounts((current) => ({
                        ...current,
                        [category.category_id]:
                          event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Other Expenses
                </h3>

                <p className="text-xs text-slate-500">
                  Custom expenses require description.
                </p>
              </div>

              <button
                type="button"
                onClick={addOtherExpense}
                disabled={!otherCategory}
                className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                + Add Other
              </button>
            </div>

            <div className="space-y-3">
              {otherExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3"
                >
                  <input
                    value={expense.description}
                    onChange={(event) =>
                      updateOtherExpense(
                        expense.id,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Description"
                    maxLength={150}
                    className="px-3 py-2.5 border border-slate-300 rounded-lg"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expense.amount}
                    onChange={(event) =>
                      updateOtherExpense(
                        expense.id,
                        "amount",
                        event.target.value,
                      )
                    }
                    placeholder="Amount"
                    className="px-3 py-2.5 border border-slate-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeOtherExpense(expense.id)
                    }
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-slate-500">
                  Freight
                </p>
                <p className="mt-1 text-xl font-bold">
                  ₹{formatMoney(editFreight)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Expenses
                </p>
                <p className="mt-1 text-xl font-bold text-orange-600">
                  ₹
                  {formatMoney(editTotalExpenses)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Gross Profit
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    editGrossProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹
                  {formatMoney(editGrossProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Trip information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-5">
              Trip Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <p className="text-xs text-slate-500">
                  Loading Date
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {trip.loading_date}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Lorry
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {lorry?.registration_number ??
                    `Lorry #${trip.lorry_id}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Loading Location
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {trip.loading_location}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Unloading Location
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {trip.unloading_location}
                </p>
              </div>
            </div>

            {trip.notes && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Notes
                </p>

                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                  {trip.notes}
                </p>
              </div>
            )}
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Freight
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹
                {formatMoney(
                  Number(trip.freight_amount),
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Expenses
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                ₹
                {formatMoney(
                  Number(trip.total_expenses),
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Gross Profit
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  Number(trip.gross_profit) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹
                {formatMoney(
                  Number(trip.gross_profit),
                )}
              </p>
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">
                Expense Breakdown
              </h2>
            </div>

            {trip.expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No expenses recorded for this trip.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {trip.expenses.map((expense) => {
                  const category = categories.find(
                    (item) =>
                      item.category_id ===
                      expense.category_id,
                  );

                  return (
                    <div
                      key={expense.trip_expense_id}
                      className="px-5 py-4 flex items-center justify-between gap-5"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {category?.name ??
                            `Category #${expense.category_id}`}
                        </p>

                        {expense.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>

                      <p className="font-semibold text-slate-900">
                        ₹
                        {formatMoney(
                          Number(expense.amount),
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">
                  Created:
                </span>{" "}
                <span className="text-slate-700">
                  {new Date(
                    trip.created_at,
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span className="text-slate-500">
                  Last Updated:
                </span>{" "}
                <span className="text-slate-700">
                  {new Date(
                    trip.updated_at,
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TripDetails;