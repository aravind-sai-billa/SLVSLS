function Dashboard() {
  const summary = {
    netFreight: 0,
    netCost: 0,
    netProfit: 0,
  };

  const lorries = [
    {
      registrationNumber: "No data",
      netFreight: 0,
      netCost: 0,
      netProfit: 0,
    },
  ];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Current month business overview
        </p>
      </div>

      {/* Overall Business Summary */}
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
              {formatCurrency(summary.netFreight)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total freight earned
            </p>
          </div>

          {/* Net Cost */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Net Cost
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(summary.netCost)}
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
              {formatCurrency(summary.netProfit)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Overall business profit
            </p>
          </div>
        </div>
      </section>

      {/* Lorry Performance */}
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
                {lorries.map((lorry) => (
                  <tr
                    key={lorry.registrationNumber}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {lorry.registrationNumber}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-slate-700">
                      {formatCurrency(lorry.netFreight)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-slate-700">
                      {formatCurrency(lorry.netCost)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(lorry.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;