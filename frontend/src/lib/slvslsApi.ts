import { apiFetch } from "./api";

/* ============================================================
   COMMON
============================================================ */

export interface Lorry {
  lorry_id: number;
  registration_number: string;
  nickname: string | null;
  owner_name: string;
}

export interface ExpenseCategory {
  category_id: number;
  name: string;
  category_type: string;
  is_active: boolean;
  sort_order: number;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

/* ============================================================
   TRIP EXPENSES
============================================================ */

export interface TripExpenseInput {
  category_id: number;
  amount: number;
  description?: string | null;
}

export interface TripExpense {
  trip_expense_id: number;
  trip_id: number;
  category_id: number;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  trip_id: number;
  loading_date: string;
  lorry_id: number;
  loading_location: string;
  unloading_location: string;
  freight_amount: number;
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  total_expenses: number;
  gross_profit: number;
}

export interface TripCreateRequest {
  loading_date: string;
  lorry_id: number;
  loading_location: string;
  unloading_location: string;
  freight_amount: number;
  notes?: string | null;
  expenses: TripExpenseInput[];
}

export interface TripUpdateRequest {
  loading_date?: string;
  lorry_id?: number;
  loading_location?: string;
  unloading_location?: string;
  freight_amount?: number;
  notes?: string | null;
  expenses?: TripExpenseInput[];
}

export interface TripCreateResponse extends Trip {
  expenses: TripExpense[];
}

export interface TripDetailsResponse extends Trip {
  expenses: TripExpense[];
}

/* ============================================================
   MONTHLY EXPENSES
============================================================ */

export interface MonthlyExpense {
  monthly_expense_id: number;
  expense_date: string;
  lorry_id: number;
  category_id: number;
  description: string | null;
  amount: number;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyExpenseCreateRequest {
  expense_date: string;
  lorry_id: number;
  category_id: number;
  description?: string | null;
  amount: number;
}

export interface MonthlyExpenseUpdateRequest {
  expense_date?: string;
  lorry_id?: number;
  category_id?: number;
  description?: string | null;
  amount?: number;
}

export interface MonthlyExpenseFilters {
  date_from?: string;
  date_to?: string;
  lorry_id?: number;
  category_id?: number;
}

/* ============================================================
   LORRIES
============================================================ */

export async function getLorries(): Promise<Lorry[]> {
  return apiFetch<Lorry[]>("/lorries");
}

export interface LorryCreateRequest {
  registration_number: string;
  nickname?: string | null;
  owner_name: string;
}

export interface LorryUpdateRequest {
  registration_number?: string;
  nickname?: string | null;
  owner_name?: string;
}

export async function getLorry(
  lorryId: number,
): Promise<Lorry> {
  return apiFetch<Lorry>(
    `/lorries/${lorryId}`,
  );
}

export async function createLorry(
  data: LorryCreateRequest,
): Promise<Lorry> {
  return apiFetch<Lorry>("/lorries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLorry(
  lorryId: number,
  data: LorryUpdateRequest,
): Promise<Lorry> {
  return apiFetch<Lorry>(
    `/lorries/${lorryId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteLorry(
  lorryId: number,
): Promise<void> {
  return apiFetch<void>(
    `/lorries/${lorryId}`,
    {
      method: "DELETE",
    },
  );
}

/* ============================================================
   EXPENSE CATEGORIES
============================================================ */

export async function getTripExpenseCategories(): Promise<
  ExpenseCategory[]
> {
  return apiFetch<ExpenseCategory[]>(
    "/expense-categories?category_type=TRIP&active_only=true",
  );
}

export async function getMonthlyExpenseCategories(): Promise<
  ExpenseCategory[]
> {
  return apiFetch<ExpenseCategory[]>(
    "/expense-categories?category_type=MONTHLY&active_only=true",
  );
}

export async function createExpenseCategory(
  name: string,
  categoryType: "TRIP" | "MONTHLY",
  sortOrder = 0,
): Promise<ExpenseCategory> {
  return apiFetch<ExpenseCategory>("/expense-categories", {
    method: "POST",
    body: JSON.stringify({
      name,
      category_type: categoryType,
      sort_order: sortOrder,
    }),
  });
}

export async function updateExpenseCategory(
  categoryId: number,
  data: {
    name?: string;
    sort_order?: number;
    is_active?: boolean;
  },
): Promise<ExpenseCategory> {
  return apiFetch<ExpenseCategory>(
    `/expense-categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/* ============================================================
   TRIPS
============================================================ */

export async function getTrips(): Promise<Trip[]> {
  return apiFetch<Trip[]>("/trips");
}

export async function getTripsByLorry(
  lorryId: number,
): Promise<Trip[]> {
  return apiFetch<Trip[]>(`/trips/lorry/${lorryId}`);
}

export async function getTrip(
  tripId: number,
): Promise<TripDetailsResponse> {
  return apiFetch<TripDetailsResponse>(`/trips/${tripId}`);
}

export async function createTrip(
  data: TripCreateRequest,
): Promise<TripCreateResponse> {
  return apiFetch<TripCreateResponse>("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrip(
  tripId: number,
  data: TripUpdateRequest,
): Promise<TripDetailsResponse> {
  return apiFetch<TripDetailsResponse>(
    `/trips/${tripId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteTrip(
  tripId: number,
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}`, {
    method: "DELETE",
  });
}

/* ============================================================
   MONTHLY EXPENSE CRUD
============================================================ */

export async function getMonthlyExpenses(
  filters: MonthlyExpenseFilters = {},
): Promise<MonthlyExpense[]> {
  const params = new URLSearchParams();

  if (filters.date_from) {
    params.set("date_from", filters.date_from);
  }

  if (filters.date_to) {
    params.set("date_to", filters.date_to);
  }

  if (filters.lorry_id) {
    params.set("lorry_id", String(filters.lorry_id));
  }

  if (filters.category_id) {
    params.set("category_id", String(filters.category_id));
  }

  const query = params.toString();

  return apiFetch<MonthlyExpense[]>(
    `/monthly-expenses${query ? `?${query}` : ""}`,
  );
}

export async function getMonthlyExpense(
  monthlyExpenseId: number,
): Promise<MonthlyExpense> {
  return apiFetch<MonthlyExpense>(
    `/monthly-expenses/${monthlyExpenseId}`,
  );
}

export async function createMonthlyExpense(
  data: MonthlyExpenseCreateRequest,
): Promise<MonthlyExpense> {
  return apiFetch<MonthlyExpense>("/monthly-expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMonthlyExpense(
  monthlyExpenseId: number,
  data: MonthlyExpenseUpdateRequest,
): Promise<MonthlyExpense> {
  return apiFetch<MonthlyExpense>(
    `/monthly-expenses/${monthlyExpenseId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteMonthlyExpense(
  monthlyExpenseId: number,
): Promise<void> {
  return apiFetch<void>(
    `/monthly-expenses/${monthlyExpenseId}`,
    {
      method: "DELETE",
    },
  );
}
/* ============================================================
   REPORTS
============================================================ */

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  lorry_id?: number;
  category_id?: number;
  search?: string;
}

export interface TripReportRow {
  trip_id: number;
  loading_date: string;
  lorry_id: number;
  loading_location: string;
  unloading_location: string;
  freight_amount: number;
  total_expenses: number;
  gross_profit: number;
}

export interface MonthlyExpenseReportRow {
  monthly_expense_id: number;
  expense_date: string;
  lorry_id: number;
  category_id: number;
  description: string | null;
  amount: number;
}

export interface TripsReportResponse {
  rows: TripReportRow[];
  total_freight: number;
  total_expenses: number;
  total_gross_profit: number;
}

export interface MonthlyExpensesReportResponse {
  rows: MonthlyExpenseReportRow[];
  total_expenses: number;
}

export async function getTripsReport(
  filters: ReportFilters = {},
): Promise<TripsReportResponse> {
  const params = new URLSearchParams();

  if (filters.date_from) {
    params.set("date_from", filters.date_from);
  }

  if (filters.date_to) {
    params.set("date_to", filters.date_to);
  }

  if (filters.lorry_id) {
    params.set(
      "lorry_id",
      String(filters.lorry_id),
    );
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return apiFetch<TripsReportResponse>(
    `/reports/trips${query ? `?${query}` : ""}`,
  );
}

export async function getMonthlyExpensesReport(
  filters: ReportFilters = {},
): Promise<MonthlyExpensesReportResponse> {
  const params = new URLSearchParams();

  if (filters.date_from) {
    params.set("date_from", filters.date_from);
  }

  if (filters.date_to) {
    params.set("date_to", filters.date_to);
  }

  if (filters.lorry_id) {
    params.set(
      "lorry_id",
      String(filters.lorry_id),
    );
  }

  if (filters.category_id) {
    params.set(
      "category_id",
      String(filters.category_id),
    );
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return apiFetch<MonthlyExpensesReportResponse>(
    `/reports/monthly-expenses${query ? `?${query}` : ""}`,
  );
}
/* ============================================================
   USER MANAGEMENT
============================================================ */

export interface User {
  user_id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  role: string;
  status: string;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  role?: string;
  status?: string;
}

export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users");
}

export async function getUser(
  userId: number,
): Promise<User> {
  return apiFetch<User>(
    `/users/${userId}`,
  );
}

export async function createUser(
  data: UserCreateRequest,
): Promise<User> {
  return apiFetch<User>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  userId: number,
  data: UserUpdateRequest,
): Promise<User> {
  return apiFetch<User>(
    `/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteUser(
  userId: number,
): Promise<void> {
  return apiFetch<void>(
    `/users/${userId}`,
    {
      method: "DELETE",
    },
  );
}

/* ============================================================
   FINANCIAL DASHBOARD
============================================================ */

export interface FinancialSummary {
  net_freight: number;
  trip_expenses: number;
  monthly_expenses: number;
  net_cost: number;
  gross_profit: number;
  net_profit: number;
}

export interface LorryFinancialSummary {
  lorry_id: number;
  registration_number: string;
  nickname: string | null;
  net_freight: number;
  trip_expenses: number;
  monthly_expenses: number;
  net_cost: number;
  gross_profit: number;
  net_profit: number;
}

export interface FinancialDashboardResponse {
  date_from: string;
  date_to: string;
  lorry_id: number | null;
  overall: FinancialSummary;
  lorries: LorryFinancialSummary[];
}

export interface FinancialDashboardFilters {
  date_from: string;
  date_to: string;
  lorry_id?: number;
}

export async function getFinancialDashboard(
  filters: FinancialDashboardFilters,
): Promise<FinancialDashboardResponse> {
  const params = new URLSearchParams();

  params.set(
    "date_from",
    filters.date_from,
  );

  params.set(
    "date_to",
    filters.date_to,
  );

  if (filters.lorry_id) {
    params.set(
      "lorry_id",
      String(filters.lorry_id),
    );
  }

  return apiFetch<FinancialDashboardResponse>(
    `/financial-dashboard?${params.toString()}`,
  );
}
