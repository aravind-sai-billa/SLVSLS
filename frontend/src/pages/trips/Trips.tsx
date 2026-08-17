import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  createTrip,
  deleteTrip,
  getLorries,
  getTripExpenseCategories,
  getTrips,
} from "../../lib/slvslsApi";

import type {
  ExpenseCategory,
  Lorry,
  Trip,
  TripCreateResponse,
  TripExpenseInput,
} from "../../lib/slvslsApi";

interface OtherExpense {
  id: number;
  amount: string;
  description: string;
}

function Trips() {
  const navigate = useNavigate();

  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ----------------------------------------------------------
  // Filters
  // ----------------------------------------------------------

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterLorry, setFilterLorry] = useState("");
  const [search, setSearch] = useState("");

  // ----------------------------------------------------------
  // Create form
  // ----------------------------------------------------------

  const [loadingDate, setLoadingDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [lorryId, setLorryId] = useState("");
  const [loadingLocation, setLoadingLocation] = useState("");
  const [unloadingLocation, setUnloadingLocation] = useState("");
  const [freightAmount, setFreightAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [expenseAmounts, setExpenseAmounts] = useState<
    Record<number, string>
  >({});

  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);

  const [lastCreatedTrip, setLastCreatedTrip] =
    useState<TripCreateResponse | null>(null);

  // ----------------------------------------------------------
  // Load data
  // ----------------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [lorryData, categoryData, tripData] = await Promise.all([
        getLorries(),
        getTripExpenseCategories(),
        getTrips(),
      ]);

      setLorries(lorryData);
      setCategories(categoryData);
      setTrips(tripData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load trip data.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------
  // Categories
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Create form calculations
  // ----------------------------------------------------------

  const totalExpenses = useMemo(() => {
    const normal = Object.values(expenseAmounts).reduce(
      (total, value) => {
        const amount = Number(value);
        return total + (Number.isFinite(amount) ? amount : 0);
      },
      0,
    );

    const other = otherExpenses.reduce((total, expense) => {
      const amount = Number(expense.amount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return normal + other;
  }, [expenseAmounts, otherExpenses]);

  const freight = Number(freightAmount) || 0;
  const grossProfit = freight - totalExpenses;

  // ----------------------------------------------------------
  // Filtered trips
  // ----------------------------------------------------------

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return trips.filter((trip) => {
      if (dateFrom && trip.loading_date < dateFrom) {
        return false;
      }

      if (dateTo && trip.loading_date > dateTo) {
        return false;
      }

      if (
        filterLorry &&
        trip.lorry_id !== Number(filterLorry)
      ) {
        return false;
      }

      if (query) {
        const lorry = lorries.find(
          (item) => item.lorry_id === trip.lorry_id,
        );

        const searchable = [
          String(trip.trip_id),
          trip.loading_date,
          trip.loading_location,
          trip.unloading_location,
          lorry?.registration_number ?? "",
          lorry?.nickname ?? "",
          lorry?.owner_name ?? "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    trips,
    lorries,
    dateFrom,
    dateTo,
    filterLorry,
    search,
  ]);

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setFilterLorry("");
    setSearch("");
  }

  // ----------------------------------------------------------
  // Form helpers
  // ----------------------------------------------------------

  function resetForm() {
    setLoadingDate(new Date().toISOString().slice(0, 10));
    setLorryId("");
    setLoadingLocation("");
    setUnloadingLocation("");
    setFreightAmount("");
    setNotes("");
    setExpenseAmounts({});
    setOtherExpenses([]);
  }

  function openCreateForm() {
    resetForm();
    setError("");
    setSuccess("");
    setLastCreatedTrip(null);
    setShowForm(true);
  }

  function closeCreateForm() {
    setShowForm(false);
    setError("");
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
      current.map((expense) =>
        expense.id === id
          ? { ...expense, [field]: value }
          : expense,
      ),
    );
  }

  function removeOtherExpense(id: number) {
    setOtherExpenses((current) =>
      current.filter((expense) => expense.id !== id),
    );
  }

  // ----------------------------------------------------------
  // Create Trip
  // ----------------------------------------------------------

  async function handleCreateTrip(
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

    if (freight <= 0) {
      setError("Freight amount must be greater than zero.");
      return;
    }

    if (otherExpenses.length > 0 && !otherCategory) {
      setError("The Other expense category is unavailable.");
      return;
    }

    const expenses: TripExpenseInput[] = [];

    for (const category of tripCategories) {
      const rawAmount =
        expenseAmounts[category.category_id] ?? "";

      if (!rawAmount) {
        continue;
      }

      const amount = Number(rawAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        setError(`Invalid amount for ${category.name}.`);
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
      const result = await createTrip({
        loading_date: loadingDate,
        lorry_id: Number(lorryId),
        loading_location: loadingLocation.trim(),
        unloading_location: unloadingLocation.trim(),
        freight_amount: freight,
        notes: notes.trim() || null,
        expenses,
      });

      setLastCreatedTrip(result);
      setTrips((current) => [result, ...current]);

      setSuccess(
        `Trip #${result.trip_id} created successfully.`,
      );

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create trip.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  async function handleDeleteTrip(trip: Trip) {
    const confirmed = window.confirm(
      `Delete Trip #${trip.trip_id}?\n\n` +
        "This will permanently delete the trip and its associated expenses.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(trip.trip_id);
    setError("");
    setSuccess("");

    try {
      await deleteTrip(trip.trip_id);

      setTrips((current) =>
        current.filter(
          (item) => item.trip_id !== trip.trip_id,
        ),
      );

      setSuccess(
        `Trip #${trip.trip_id} deleted successfully.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete trip.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatMoney(value: number) {
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading trip management...
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Trips
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage trips, expenses and profitability.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            + Add Trip
          </button>
        )}
      </div>

      {/* Messages */}
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

      {/* Last created */}
      {lastCreatedTrip && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Last Created Trip
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Trip #{lastCreatedTrip.trip_id}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">
                Gross Profit
              </p>

              <p
                className={`text-xl font-bold ${
                  Number(lastCreatedTrip.gross_profit) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹
                {formatMoney(
                  Number(lastCreatedTrip.gross_profit),
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreateTrip}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Create New Trip
            </h2>

            <button
              type="button"
              onClick={closeCreateForm}
              className="text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Lorry</option>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loading Location
              </label>

              <input
                type="text"
                value={loadingLocation}
                onChange={(event) =>
                  setLoadingLocation(event.target.value)
                }
                placeholder="Loading location"
                maxLength={150}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unloading Location
              </label>

              <input
                type="text"
                value={unloadingLocation}
                onChange={(event) =>
                  setUnloadingLocation(event.target.value)
                }
                placeholder="Unloading location"
                maxLength={150}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="0.00"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">
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
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Other */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Other Expenses
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Add custom expenses without creating new categories.
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

            {otherExpenses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 text-center">
                No Other expenses added.
              </div>
            ) : (
              <div className="space-y-3">
                {otherExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Description
                      </label>

                      <input
                        type="text"
                        value={expense.description}
                        onChange={(event) =>
                          updateOtherExpense(
                            expense.id,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. Parking"
                        maxLength={150}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Amount
                      </label>

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
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeOtherExpense(expense.id)
                      }
                      className="px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
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
              placeholder="Optional notes"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-slate-500">
                  Freight
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  ₹{formatMoney(freight)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Expenses
                </p>
                <p className="mt-1 text-xl font-bold text-orange-600">
                  ₹{formatMoney(totalExpenses)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Gross Profit
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    grossProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{formatMoney(grossProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateForm}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium"
            >
              {saving ? "Creating Trip..." : "Create Trip"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      {!showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Filters
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Filter trips by date, lorry or trip information.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date From
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(event.target.value)
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date To
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(event.target.value)
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Lorry
              </label>

              <select
                value={filterLorry}
                onChange={(event) =>
                  setFilterLorry(event.target.value)
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All Lorries</option>

                {lorries.map((lorry) => (
                  <option
                    key={lorry.lorry_id}
                    value={lorry.lorry_id}
                  >
                    {lorry.registration_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Trip, lorry, location..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trips table */}
      {!showForm && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">
                Trips
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Showing {filteredTrips.length} of{" "}
                {trips.length} trips
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                No trips found
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Try changing the filters or create a new trip.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Date
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Lorry
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Route
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Freight
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Expenses
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Gross Profit
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.map((trip) => {
                    const lorry = lorries.find(
                      (item) =>
                        item.lorry_id === trip.lorry_id,
                    );

                    const profit =
                      Number(trip.gross_profit) || 0;

                    return (
                      <tr
                        key={trip.trip_id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {trip.loading_date}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-900">
                          {lorry?.registration_number ??
                            `Lorry #${trip.lorry_id}`}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          <div>
                            {trip.loading_location}
                          </div>
                          <div className="text-xs text-slate-400">
                            → {trip.unloading_location}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-right font-medium text-slate-900">
                          ₹
                          {formatMoney(
                            Number(trip.freight_amount),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-right font-medium text-orange-600">
                          ₹
                          {formatMoney(
                            Number(trip.total_expenses),
                          )}
                        </td>

                        <td
                          className={`px-5 py-4 text-sm text-right font-bold ${
                            profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{formatMoney(profit)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/trips/${trip.trip_id}`,
                                )
                              }
                              className="px-3 py-1.5 rounded-md text-sm text-blue-700 hover:bg-blue-50"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/trips/${trip.trip_id}?edit=1`,
                                )
                              }
                              className="px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteTrip(trip)
                              }
                              disabled={
                                deletingId === trip.trip_id
                              }
                              className="px-3 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === trip.trip_id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Trips;