import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  getLorries,
  getMonthlyExpenseCategories,
  getMonthlyExpensesReport,
  getTripsReport,
  type ExpenseCategory,
  type Lorry,
  type MonthlyExpenseReportRow,
  type TripReportRow,
} from "../../lib/slvslsApi";

import {
  exportMonthlyExpensesCsv,
  exportMonthlyExpensesExcel,
  exportTripsCsv,
  exportTripsExcel,
} from "../../lib/reportExport";


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


function Reports() {
  const navigate = useNavigate();

  /* ==========================================================
     LOOKUPS
  ========================================================== */

  const [lorries, setLorries] =
    useState<Lorry[]>([]);

  const [categories, setCategories] =
    useState<ExpenseCategory[]>([]);


  /* ==========================================================
     TRIPS REPORT
  ========================================================== */

  const [tripRows, setTripRows] =
    useState<TripReportRow[]>([]);

  const [tripDateFrom, setTripDateFrom] =
    useState("");

  const [tripDateTo, setTripDateTo] =
    useState("");

  const [tripLorryId, setTripLorryId] =
    useState("");

  const [tripSearch, setTripSearch] =
    useState("");

  const [tripLoading, setTripLoading] =
    useState(false);

  const [tripError, setTripError] =
    useState("");

  const [totalFreight, setTotalFreight] =
    useState(0);

  const [totalTripExpenses, setTotalTripExpenses] =
    useState(0);

  const [totalGrossProfit, setTotalGrossProfit] =
    useState(0);


  /* ==========================================================
     MONTHLY EXPENSE REPORT
  ========================================================== */

  const [monthlyRows, setMonthlyRows] =
    useState<MonthlyExpenseReportRow[]>([]);

  const [monthlyDateFrom, setMonthlyDateFrom] =
    useState("");

  const [monthlyDateTo, setMonthlyDateTo] =
    useState("");

  const [monthlyLorryId, setMonthlyLorryId] =
    useState("");

  const [monthlyCategoryId, setMonthlyCategoryId] =
    useState("");

  const [monthlySearch, setMonthlySearch] =
    useState("");

  const [monthlyLoading, setMonthlyLoading] =
    useState(false);

  const [monthlyError, setMonthlyError] =
    useState("");

  const [totalMonthlyExpenses, setTotalMonthlyExpenses] =
    useState(0);


  /* ==========================================================
     INITIAL LOOKUPS
  ========================================================== */

  useEffect(() => {
    loadLookups();
  }, []);


  async function loadLookups() {
    try {
      const [
        lorryData,
        categoryData,
      ] = await Promise.all([
        getLorries(),
        getMonthlyExpenseCategories(),
      ]);

      setLorries(lorryData);
      setCategories(categoryData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load report filters.";

      setTripError(message);
      setMonthlyError(message);
    }
  }


  /* ==========================================================
     LOOKUP MAPS
  ========================================================== */

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


  /* ==========================================================
     LOAD TRIPS REPORT
  ========================================================== */

  async function loadTripsReport() {
    try {
      setTripLoading(true);
      setTripError("");

      const response =
        await getTripsReport({
          date_from:
            tripDateFrom || undefined,

          date_to:
            tripDateTo || undefined,

          lorry_id: tripLorryId
            ? Number(tripLorryId)
            : undefined,

          search:
            tripSearch.trim() || undefined,
        });

      setTripRows(response.rows);

      setTotalFreight(
        Number(response.total_freight),
      );

      setTotalTripExpenses(
        Number(response.total_expenses),
      );

      setTotalGrossProfit(
        Number(response.total_gross_profit),
      );
    } catch (err) {
      setTripError(
        err instanceof Error
          ? err.message
          : "Failed to load Trips Report.",
      );
    } finally {
      setTripLoading(false);
    }
  }


  /* ==========================================================
     LOAD MONTHLY EXPENSE REPORT
  ========================================================== */

  async function loadMonthlyReport() {
    try {
      setMonthlyLoading(true);
      setMonthlyError("");

      const response =
        await getMonthlyExpensesReport({
          date_from:
            monthlyDateFrom || undefined,

          date_to:
            monthlyDateTo || undefined,

          lorry_id: monthlyLorryId
            ? Number(monthlyLorryId)
            : undefined,

          category_id:
            monthlyCategoryId
              ? Number(monthlyCategoryId)
              : undefined,

          search:
            monthlySearch.trim() || undefined,
        });

      setMonthlyRows(response.rows);

      setTotalMonthlyExpenses(
        Number(response.total_expenses),
      );
    } catch (err) {
      setMonthlyError(
        err instanceof Error
          ? err.message
          : "Failed to load Monthly Expenses Report.",
      );
    } finally {
      setMonthlyLoading(false);
    }
  }


  /* ==========================================================
     INITIAL REPORT LOAD
  ========================================================== */

  useEffect(() => {
    loadTripsReport();
    loadMonthlyReport();
  }, []);


  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  function resetTripsFilters() {
    setTripDateFrom("");
    setTripDateTo("");
    setTripLorryId("");
    setTripSearch("");
  }


  function resetMonthlyFilters() {
    setMonthlyDateFrom("");
    setMonthlyDateTo("");
    setMonthlyLorryId("");
    setMonthlyCategoryId("");
    setMonthlySearch("");
  }


  /* ==========================================================
     EXPORT
  ========================================================== */

  function handleExportTripsExcel() {
    if (tripRows.length === 0) {
      setTripError(
        "There is no Trips Report data to export.",
      );
      return;
    }

    exportTripsExcel(
      tripRows.map((trip) => ({
        trip_id: trip.trip_id,
        loading_date: formatDate(
          trip.loading_date,
        ),
        lorry:
          lorryMap.get(trip.lorry_id) ||
          `Lorry #${trip.lorry_id}`,
        loading_location:
          trip.loading_location,
        unloading_location:
          trip.unloading_location,
        freight_amount:
          Number(trip.freight_amount),
        total_expenses:
          Number(trip.total_expenses),
        gross_profit:
          Number(trip.gross_profit),
      })),
      {
        freight: totalFreight,
        expenses: totalTripExpenses,
        grossProfit: totalGrossProfit,
      },
    );
  }


  function handleExportTripsCsv() {
    if (tripRows.length === 0) {
      setTripError(
        "There is no Trips Report data to export.",
      );
      return;
    }

    exportTripsCsv(
      tripRows.map((trip) => ({
        trip_id: trip.trip_id,
        loading_date: formatDate(
          trip.loading_date,
        ),
        lorry:
          lorryMap.get(trip.lorry_id) ||
          `Lorry #${trip.lorry_id}`,
        loading_location:
          trip.loading_location,
        unloading_location:
          trip.unloading_location,
        freight_amount:
          Number(trip.freight_amount),
        total_expenses:
          Number(trip.total_expenses),
        gross_profit:
          Number(trip.gross_profit),
      })),
      {
        freight: totalFreight,
        expenses: totalTripExpenses,
        grossProfit: totalGrossProfit,
      },
    );
  }


  function handleExportMonthlyExcel() {
    if (monthlyRows.length === 0) {
      setMonthlyError(
        "There is no Monthly Expenses Report data to export.",
      );
      return;
    }

    exportMonthlyExpensesExcel(
      monthlyRows.map((expense) => ({
        monthly_expense_id:
          expense.monthly_expense_id,
        expense_date: formatDate(
          expense.expense_date,
        ),
        lorry:
          lorryMap.get(expense.lorry_id) ||
          `Lorry #${expense.lorry_id}`,
        category:
          categoryMap.get(
            expense.category_id,
          ) ||
          `Category #${expense.category_id}`,
        description:
          expense.description || "",
        amount:
          Number(expense.amount),
      })),
      totalMonthlyExpenses,
    );
  }


  function handleExportMonthlyCsv() {
    if (monthlyRows.length === 0) {
      setMonthlyError(
        "There is no Monthly Expenses Report data to export.",
      );
      return;
    }

    exportMonthlyExpensesCsv(
      monthlyRows.map((expense) => ({
        monthly_expense_id:
          expense.monthly_expense_id,
        expense_date: formatDate(
          expense.expense_date,
        ),
        lorry:
          lorryMap.get(expense.lorry_id) ||
          `Lorry #${expense.lorry_id}`,
        category:
          categoryMap.get(
            expense.category_id,
          ) ||
          `Category #${expense.category_id}`,
        description:
          expense.description || "",
        amount:
          Number(expense.amount),
      })),
      totalMonthlyExpenses,
    );
  }


  /* ==========================================================
     UI STYLES
  ========================================================== */

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";


  const primaryButton =
    "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50";


  const secondaryButton =
    "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50";


  const actionButton =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";


  const exportButton =
    "rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50";


  const exportCsvButton =
    "rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";


  return (
    <div className="p-6 space-y-8">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search, filter and manage business records.
          </p>
        </div>


        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open Trips
          </button>


          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Open Monthly Expenses
          </button>

        </div>

      </div>


      {/* =====================================================
          TRIPS REPORT
      ===================================================== */}

      <section className="space-y-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Trips Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and review trip records.
            </p>
          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={handleExportTripsExcel}
              disabled={
                tripLoading ||
                tripRows.length === 0
              }
              className={`${exportButton} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Export Excel
            </button>


            <button
              type="button"
              onClick={handleExportTripsCsv}
              disabled={
                tripLoading ||
                tripRows.length === 0
              }
              className={`${exportCsvButton} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Export CSV
            </button>

          </div>

        </div>


        {/* Filters */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Date
              </label>

              <input
                type="date"
                value={tripDateFrom}
                onChange={(event) =>
                  setTripDateFrom(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Date
              </label>

              <input
                type="date"
                value={tripDateTo}
                onChange={(event) =>
                  setTripDateTo(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lorry
              </label>

              <select
                value={tripLorryId}
                onChange={(event) =>
                  setTripLorryId(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
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
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Keyword
              </label>

              <input
                type="text"
                value={tripSearch}
                onChange={(event) =>
                  setTripSearch(
                    event.target.value,
                  )
                }
                placeholder="Location or notes"
                className={`w-full ${inputClass}`}
              />
            </div>


            <div className="flex items-end gap-2">

              <button
                type="button"
                onClick={loadTripsReport}
                disabled={tripLoading}
                className={primaryButton}
              >
                {tripLoading
                  ? "Searching..."
                  : "Search"}
              </button>


              <button
                type="button"
                onClick={() => {
                  resetTripsFilters();

                  setTimeout(
                    loadTripsReport,
                    0,
                  );
                }}
                className={secondaryButton}
              >
                Reset
              </button>

            </div>

          </div>

        </div>


        {/* Error */}

        {tripError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {tripError}
          </div>
        )}


        {/* Summary */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-sm text-slate-500">
              Total Freight
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(
                totalFreight,
              )}
            </p>

          </div>


          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-sm text-slate-500">
              Total Expenses
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(
                totalTripExpenses,
              )}
            </p>

          </div>


          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-sm text-slate-500">
              Gross Profit
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                totalGrossProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(
                totalGrossProfit,
              )}
            </p>

          </div>

        </div>


        {/* Table */}

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Lorry
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Loading Location
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Unloading Location
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Freight
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Expenses
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Gross Profit
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {tripRows.length === 0 ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {tripLoading
                        ? "Loading..."
                        : "No trips found."}
                    </td>
                  </tr>

                ) : (

                  tripRows.map((trip) => (

                    <tr
                      key={trip.trip_id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-4 py-3">
                        {formatDate(
                          trip.loading_date,
                        )}
                      </td>


                      <td className="px-4 py-3">
                        {lorryMap.get(
                          trip.lorry_id,
                        ) ||
                          `Lorry #${trip.lorry_id}`}
                      </td>


                      <td className="px-4 py-3">
                        {trip.loading_location}
                      </td>


                      <td className="px-4 py-3">
                        {trip.unloading_location}
                      </td>


                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          Number(
                            trip.freight_amount,
                          ),
                        )}
                      </td>


                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          Number(
                            trip.total_expenses,
                          ),
                        )}
                      </td>


                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          Number(
                            trip.gross_profit,
                          ) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          Number(
                            trip.gross_profit,
                          ),
                        )}
                      </td>


                      <td className="px-4 py-3 text-right">

                        <a
                          href={`/trips/${trip.trip_id}`}
                          className={actionButton}
                        >
                          View
                        </a>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>


      {/* =====================================================
          MONTHLY EXPENSES REPORT
      ===================================================== */}

      <section className="space-y-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Monthly Expenses Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and review monthly expense records.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={handleExportMonthlyExcel}
              disabled={
                monthlyLoading ||
                monthlyRows.length === 0
              }
              className={`${exportButton} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Export Excel
            </button>


            <button
              type="button"
              onClick={handleExportMonthlyCsv}
              disabled={
                monthlyLoading ||
                monthlyRows.length === 0
              }
              className={`${exportCsvButton} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Export CSV
            </button>

          </div>

        </div>


        {/* Filters */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Date
              </label>

              <input
                type="date"
                value={monthlyDateFrom}
                onChange={(event) =>
                  setMonthlyDateFrom(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
              />

            </div>


            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Date
              </label>

              <input
                type="date"
                value={monthlyDateTo}
                onChange={(event) =>
                  setMonthlyDateTo(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
              />

            </div>


            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lorry
              </label>

              <select
                value={monthlyLorryId}
                onChange={(event) =>
                  setMonthlyLorryId(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
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
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>

              <select
                value={monthlyCategoryId}
                onChange={(event) =>
                  setMonthlyCategoryId(
                    event.target.value,
                  )
                }
                className={`w-full ${inputClass}`}
              >

                <option value="">
                  All Categories
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


            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Keyword
              </label>

              <input
                type="text"
                value={monthlySearch}
                onChange={(event) =>
                  setMonthlySearch(
                    event.target.value,
                  )
                }
                placeholder="Description"
                className={`w-full ${inputClass}`}
              />

            </div>


            <div className="flex items-end gap-2">

              <button
                type="button"
                onClick={loadMonthlyReport}
                disabled={monthlyLoading}
                className={primaryButton}
              >
                {monthlyLoading
                  ? "Searching..."
                  : "Search"}
              </button>


              <button
                type="button"
                onClick={() => {

                  resetMonthlyFilters();

                  setTimeout(
                    loadMonthlyReport,
                    0,
                  );

                }}
                className={secondaryButton}
              >
                Reset
              </button>

            </div>

          </div>

        </div>


        {/* Error */}

        {monthlyError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {monthlyError}
          </div>
        )}


        {/* Summary */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <p className="text-sm text-slate-500">
            Total Expenses
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(
              totalMonthlyExpenses,
            )}
          </p>

        </div>


        {/* Table */}

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Lorry
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Total Expense
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {monthlyRows.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {monthlyLoading
                        ? "Loading..."
                        : "No monthly expenses found."}
                    </td>

                  </tr>

                ) : (

                  monthlyRows.map(
                    (expense) => (

                      <tr
                        key={
                          expense.monthly_expense_id
                        }
                        className="hover:bg-slate-50"
                      >

                        <td className="px-4 py-3">
                          {formatDate(
                            expense.expense_date,
                          )}
                        </td>


                        <td className="px-4 py-3">
                          {lorryMap.get(
                            expense.lorry_id,
                          ) ||
                            `Lorry #${expense.lorry_id}`}
                        </td>


                        <td className="px-4 py-3">
                          {categoryMap.get(
                            expense.category_id,
                          ) ||
                            `Category #${expense.category_id}`}
                        </td>


                        <td className="px-4 py-3">
                          {expense.description ||
                            "—"}
                        </td>


                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(
                            Number(
                              expense.amount,
                            ),
                          )}
                        </td>


                        <td className="px-4 py-3 text-right">

                          <a
                            href={`/expenses/${expense.monthly_expense_id}`}
                            className={actionButton}
                          >
                            View
                          </a>

                        </td>

                      </tr>

                    ),
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </div>
  );
}


export default Reports;