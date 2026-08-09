function Trips() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Trips
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage loading trips and trip-related expenses
        </p>
      </div>

      {/* Add Trip Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Trip
        </button>
      </div>

      {/* Trips Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Loading Date
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Lorry
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Loading Location
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Unloading Location
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                  Freight
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  No trips recorded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Trips;