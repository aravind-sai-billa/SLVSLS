import { useEffect, useState } from "react";

import {
  getFinancialDashboard,
  type FinancialDashboardResponse,
} from "../../lib/slvslsApi";


function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getCurrentMonthStart() {
  const date = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  return getLocalDateString(date);
}


function getToday() {
  return getLocalDateString(
    new Date(),
  );
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}


function Dashboard() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<FinancialDashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getFinancialDashboard({
            date_from:
              getCurrentMonthStart(),
            date_to: getToday(),
          });

        setDashboard(result);
      } catch (err) {
        setDashboard(null);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Current month business overview
        </p>
      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      )}


      {/* =====================================================
          DASHBOARD DATA
      ===================================================== */}

      {!loading && dashboard && (
        <>

          {/* =================================================
              OVERALL BUSINESS SUMMARY
          ================================================= */}

          <section>

            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Overall Business Summary
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Net Freight */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Net Freight
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_freight,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total freight earned this month
                </p>

              </div>


              {/* Net Cost */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Net Cost
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_cost,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Trip expenses + monthly expenses
                </p>

              </div>


              {/* Net Profit */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Net Profit
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Number(
                      dashboard.overall.net_profit,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Overall business profit
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              INDIVIDUAL LORRY SUMMARY
          ================================================= */}

          <section>

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Lorry Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current month performance of all registered lorries
              </p>

            </div>


            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {dashboard.lorries.length === 0 ? (

                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No lorry data available for the current month.
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="border-b border-slate-200 bg-slate-50">

                      <tr>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Lorry
                        </th>

                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                          Net Freight
                        </th>

                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                          Net Cost
                        </th>

                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                          Net Profit
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {dashboard.lorries.map(
                        (lorry) => (
                          <tr
                            key={lorry.lorry_id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                          >

                            <td className="px-6 py-4">

                              <div className="text-sm font-medium text-slate-900">
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
                                  lorry.net_cost,
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

          </section>

        </>
      )}

    </div>
  );
}


export default Dashboard;
