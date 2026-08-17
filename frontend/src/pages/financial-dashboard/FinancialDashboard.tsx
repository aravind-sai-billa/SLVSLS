import { useEffect, useMemo, useState } from "react";

import {
  getFinancialDashboard,
  getLorries,
  type FinancialDashboardResponse,
  type Lorry,
} from "../../lib/slvslsApi";


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}


function getToday() {
  return new Date().toISOString().slice(0, 10);
}


function getMonthStart() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);
}


function getYesterday() {
  const date = new Date();

  date.setDate(date.getDate() - 1);

  return date.toISOString().slice(0, 10);
}


function getWeekStart() {
  const date = new Date();

  const day = date.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  date.setDate(
    date.getDate() - difference,
  );

  return date.toISOString().slice(0, 10);
}


function getLastWeekStart() {
  const date = new Date();

  const day = date.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  date.setDate(
    date.getDate() - difference - 7,
  );

  return date.toISOString().slice(0, 10);
}


function getLastWeekEnd() {
  const date = new Date();

  const day = date.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  date.setDate(
    date.getDate() - difference - 1,
  );

  return date.toISOString().slice(0, 10);
}


function getLastMonthStart() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1,
  )
    .toISOString()
    .slice(0, 10);
}


function getLastMonthEnd() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    0,
  )
    .toISOString()
    .slice(0, 10);
}


function getYearStart() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    0,
    1,
  )
    .toISOString()
    .slice(0, 10);
}


function getLastYearStart() {
  const date = new Date();

  return new Date(
    date.getFullYear() - 1,
    0,
    1,
  )
    .toISOString()
    .slice(0, 10);
}


function getLastYearEnd() {
  const date = new Date();

  return new Date(
    date.getFullYear() - 1,
    11,
    31,
  )
    .toISOString()
    .slice(0, 10);
}


function FinancialDashboard() {
  /* ==========================================================
     LOOKUPS
  ========================================================== */

  const [lorries, setLorries] =
    useState<Lorry[]>([]);

  /* ==========================================================
     FILTERS
  ========================================================== */

  const [dateFrom, setDateFrom] =
    useState(getMonthStart());

  const [dateTo, setDateTo] =
    useState(getToday());

  const [lorryFilter, setLorryFilter] =
    useState("");

  const [quickFilter, setQuickFilter] =
    useState("THIS_MONTH");

  /* ==========================================================
     DATA
  ========================================================== */

  const [
    dashboard,
    setDashboard,
  ] =
    useState<FinancialDashboardResponse | null>(
      null,
    );

  /* ==========================================================
     STATUS
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     LOAD LOOKUPS
  ========================================================== */

  useEffect(() => {
    async function loadLorries() {
      try {
        const rows = await getLorries();

        setLorries(rows);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load lorries.",
        );
      }
    }

    loadLorries();
  }, []);

  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  useEffect(() => {
    async function loadDashboard() {
      if (!dateFrom || !dateTo) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await getFinancialDashboard({
            date_from: dateFrom,
            date_to: dateTo,
            lorry_id: lorryFilter
              ? Number(lorryFilter)
              : undefined,
          });

        setDashboard(result);
      } catch (err) {
        setDashboard(null);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load financial dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [
    dateFrom,
    dateTo,
    lorryFilter,
  ]);

  /* ==========================================================
     QUICK FILTERS
  ========================================================== */

  function applyQuickFilter(
    filter: string,
  ) {
    const today = getToday();

    setQuickFilter(filter);

    switch (filter) {
      case "TODAY":
        setDateFrom(today);
        setDateTo(today);
        break;

      case "YESTERDAY": {
        const yesterday =
          getYesterday();

        setDateFrom(yesterday);
        setDateTo(yesterday);
        break;
      }

      case "THIS_WEEK":
        setDateFrom(getWeekStart());
        setDateTo(today);
        break;

      case "LAST_WEEK":
        setDateFrom(getLastWeekStart());
        setDateTo(getLastWeekEnd());
        break;

      case "THIS_MONTH":
        setDateFrom(getMonthStart());
        setDateTo(today);
        break;

      case "LAST_MONTH":
        setDateFrom(getLastMonthStart());
        setDateTo(getLastMonthEnd());
        break;

      case "THIS_YEAR":
        setDateFrom(getYearStart());
        setDateTo(today);
        break;

      case "LAST_YEAR":
        setDateFrom(getLastYearStart());
        setDateTo(getLastYearEnd());
        break;

      default:
        break;
    }
  }

  /* ==========================================================
     FILTER VALIDATION
  ========================================================== */

  const dateError = useMemo(() => {
    if (!dateFrom || !dateTo) {
      return "";
    }

    if (dateFrom > dateTo) {
      return "Date From cannot be after Date To.";
    }

    return "";
  }, [dateFrom, dateTo]);

  /* ==========================================================
     STYLES
  ========================================================== */

  const cardClass =
    "rounded-xl border border-slate-200 bg-white p-5";

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const quickButtonClass =
    "rounded-lg border px-3 py-2 text-sm font-medium transition";

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="p-6 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-900">
          Financial Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Analyse freight, expenses, costs and profitability.
        </p>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">

        <div className="mb-4">

          <h2 className="font-semibold text-slate-900">
            Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Financial values update automatically based on the selected filters.
          </p>

        </div>


        {/* Quick Filters */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quick Date Range
          </label>

          <div className="flex flex-wrap gap-2">

            {[
              ["TODAY", "Today"],
              ["YESTERDAY", "Yesterday"],
              ["THIS_WEEK", "This Week"],
              ["LAST_WEEK", "Last Week"],
              ["THIS_MONTH", "This Month"],
              ["LAST_MONTH", "Last Month"],
              ["THIS_YEAR", "This Year"],
              ["LAST_YEAR", "Last Year"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  applyQuickFilter(value)
                }
                className={`${quickButtonClass} ${
                  quickFilter === value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}

          </div>

        </div>


        {/* Custom Filters */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date From
            </label>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(
                  event.target.value,
                );
                setQuickFilter("");
              }}
              className={inputClass}
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date To
            </label>

            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(
                  event.target.value,
                );
                setQuickFilter("");
              }}
              className={inputClass}
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Lorry
            </label>

            <select
              value={lorryFilter}
              onChange={(event) =>
                setLorryFilter(
                  event.target.value,
                )
              }
              className={inputClass}
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

          </div>

        </div>


        {dateError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dateError}
          </div>
        )}

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !dateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Loading financial dashboard...
        </div>
      )}


      {/* =====================================================
          FINANCIAL SUMMARY
      ===================================================== */}

      {!loading && dashboard && !dateError && (

        <>

          <div>

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Overall Financial Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {dashboard.date_from}
                {" "}to{" "}
                {dashboard.date_to}
              </p>

            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Net Freight
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_freight,
                    ),
                  )}
                </p>
              </div>


              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Trip Expenses
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.trip_expenses,
                    ),
                  )}
                </p>
              </div>


              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Monthly Expenses
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.monthly_expenses,
                    ),
                  )}
                </p>
              </div>


              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Net Cost
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_cost,
                    ),
                  )}
                </p>
              </div>


              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Gross Profit
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.gross_profit,
                    ),
                  )}
                </p>
              </div>


              <div className={cardClass}>
                <p className="text-sm text-slate-500">
                  Net Profit
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_profit,
                    ),
                  )}
                </p>
              </div>

            </div>

          </div>


          {/* =================================================
              LORRY COMPARISON
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

            <div className="border-b border-slate-200 px-6 py-4">

              <h2 className="font-semibold text-slate-900">
                Lorry Financial Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Financial performance for each lorry in the selected period.
              </p>

            </div>


            {dashboard.lorries.length === 0 ? (

              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No financial data found for the selected filters.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Lorry
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Net Freight
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Trip Expenses
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Monthly Expenses
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Net Cost
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Gross Profit
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Net Profit
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-200">

                    {dashboard.lorries.map(
                      (lorry) => (
                        <tr
                          key={lorry.lorry_id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <div className="font-medium text-slate-900">
                              {lorry.registration_number}
                            </div>

                            {lorry.nickname && (
                              <div className="mt-1 text-xs text-slate-400">
                                {lorry.nickname}
                              </div>
                            )}

                          </td>


                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              Number(
                                lorry.net_freight,
                              ),
                            )}
                          </td>


                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              Number(
                                lorry.trip_expenses,
                              ),
                            )}
                          </td>


                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              Number(
                                lorry.monthly_expenses,
                              ),
                            )}
                          </td>


                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                            {formatCurrency(
                              Number(
                                lorry.net_cost,
                              ),
                            )}
                          </td>


                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                            {formatCurrency(
                              Number(
                                lorry.gross_profit,
                              ),
                            )}
                          </td>


                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              Number(
                                lorry.net_profit,
                              ),
                            )}
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}


export default FinancialDashboard;
