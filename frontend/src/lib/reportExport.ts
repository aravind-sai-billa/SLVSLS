import * as XLSX from "xlsx";

export interface TripExportRow {
  trip_id: number;
  loading_date: string;
  lorry: string;
  loading_location: string;
  unloading_location: string;
  freight_amount: number;
  total_expenses: number;
  gross_profit: number;
}

export interface MonthlyExpenseExportRow {
  monthly_expense_id: number;
  expense_date: string;
  lorry: string;
  category: string;
  description: string;
  amount: number;
}

function downloadCsv(
  rows: Record<string, string | number>[],
  filename: string,
) {
  if (rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (
    value: string | number,
  ) => {
    const text = String(value ?? "");

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) =>
          escapeCsvValue(row[header]),
        )
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function downloadExcel(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName: string,
) {
  if (rows.length === 0) {
    return;
  }

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName,
  );

  XLSX.writeFile(
    workbook,
    filename,
  );
}


export function exportTripsCsv(
  rows: TripExportRow[],
  totals: {
    freight: number;
    expenses: number;
    grossProfit: number;
  },
) {
  const exportRows:
    Record<string, string | number>[] =
    rows.map((row) => ({
      "Trip ID": row.trip_id,
      "Loading Date": row.loading_date,
      "Lorry": row.lorry,
      "Loading Location":
        row.loading_location,
      "Unloading Location":
        row.unloading_location,
      "Freight Amount":
        row.freight_amount,
      "Total Expenses":
        row.total_expenses,
      "Gross Profit":
        row.gross_profit,
    }));

  exportRows.push(
    {
      "Trip ID": "",
      "Loading Date": "",
      "Lorry": "",
      "Loading Location": "",
      "Unloading Location": "",
      "Freight Amount": "",
      "Total Expenses": "",
      "Gross Profit": "",
    },
    {
      "Trip ID": "",
      "Loading Date": "",
      "Lorry": "",
      "Loading Location": "",
      "Unloading Location": "",
      "Freight Amount": totals.freight,
      "Total Expenses": totals.expenses,
      "Gross Profit": totals.grossProfit,
    },
  );

  downloadCsv(
    exportRows,
    "SLVSLS-Trips-Report.csv",
  );
}


export function exportTripsExcel(
  rows: TripExportRow[],
  totals: {
    freight: number;
    expenses: number;
    grossProfit: number;
  },
) {
  const exportRows:
    Record<string, string | number>[] =
    rows.map((row) => ({
      "Trip ID": row.trip_id,
      "Loading Date": row.loading_date,
      "Lorry": row.lorry,
      "Loading Location":
        row.loading_location,
      "Unloading Location":
        row.unloading_location,
      "Freight Amount":
        row.freight_amount,
      "Total Expenses":
        row.total_expenses,
      "Gross Profit":
        row.gross_profit,
    }));

  exportRows.push(
    {
      "Trip ID": "",
      "Loading Date": "",
      "Lorry": "",
      "Loading Location": "",
      "Unloading Location": "",
      "Freight Amount": "",
      "Total Expenses": "",
      "Gross Profit": "",
    },
    {
      "Trip ID": "",
      "Loading Date": "",
      "Lorry": "",
      "Loading Location": "",
      "Unloading Location": "",
      "Freight Amount": totals.freight,
      "Total Expenses": totals.expenses,
      "Gross Profit": totals.grossProfit,
    },
  );

  downloadExcel(
    exportRows,
    "SLVSLS-Trips-Report.xlsx",
    "Trips Report",
  );
}


export function exportMonthlyExpensesCsv(
  rows: MonthlyExpenseExportRow[],
  totalExpenses: number,
) {
  const exportRows:
    Record<string, string | number>[] =
    rows.map((row) => ({
      "Expense ID":
        row.monthly_expense_id,
      "Expense Date":
        row.expense_date,
      "Lorry": row.lorry,
      "Category": row.category,
      "Description":
        row.description,
      "Amount": row.amount,
    }));

  exportRows.push(
    {
      "Expense ID": "",
      "Expense Date": "",
      "Lorry": "",
      "Category": "",
      "Description": "",
      "Amount": "",
    },
    {
      "Expense ID": "",
      "Expense Date": "",
      "Lorry": "",
      "Category": "",
      "Description": "Total Expenses",
      "Amount": totalExpenses,
    },
  );

  downloadCsv(
    exportRows,
    "SLVSLS-Monthly-Expenses-Report.csv",
  );
}


export function exportMonthlyExpensesExcel(
  rows: MonthlyExpenseExportRow[],
  totalExpenses: number,
) {
  const exportRows:
    Record<string, string | number>[] =
    rows.map((row) => ({
      "Expense ID":
        row.monthly_expense_id,
      "Expense Date":
        row.expense_date,
      "Lorry": row.lorry,
      "Category": row.category,
      "Description":
        row.description,
      "Amount": row.amount,
    }));

  exportRows.push(
    {
      "Expense ID": "",
      "Expense Date": "",
      "Lorry": "",
      "Category": "",
      "Description": "",
      "Amount": "",
    },
    {
      "Expense ID": "",
      "Expense Date": "",
      "Lorry": "",
      "Category": "",
      "Description": "Total Expenses",
      "Amount": totalExpenses,
    },
  );

  downloadExcel(
    exportRows,
    "SLVSLS-Monthly-Expenses-Report.xlsx",
    "Monthly Expenses",
  );
}
