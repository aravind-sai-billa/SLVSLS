import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import FinancialDashboard from "../pages/financial-dashboard/FinancialDashboard";
import Lorries from "../pages/lorry-management/Lorries";
import LorryDetails from "../pages/lorry-management/LorryDetails";

import MonthlyExpenses from "../pages/monthly-expenses/MonthlyExpenses";
import MonthlyExpenseForm from "../pages/monthly-expenses/MonthlyExpenseForm";
import MonthlyExpenseDetails from "../pages/monthly-expenses/MonthlyExpenseDetails";

import Reports from "../pages/reports/Reports";
import Trips from "../pages/trips/Trips";
import TripDetails from "../pages/trips/TripDetails";
import Users from "../pages/user-management/Users";

import PageLayout from "../components/layout/PageLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Main Application */}
        <Route element={<PageLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Financial Dashboard */}
          <Route
            path="/financial"
            element={<FinancialDashboard />}
          />

          {/* Lorries */}
          <Route
            path="/lorries"
            element={<Lorries />}
          />

          <Route
            path="/lorries/:id"
            element={<LorryDetails />}
          />

          {/* ==================================================
              TRIPS
          ================================================== */}

          <Route
            path="/trips"
            element={<Trips />}
          />

          <Route
            path="/trips/:id"
            element={<TripDetails />}
          />

          {/* ==================================================
              MONTHLY EXPENSES
          ================================================== */}

          {/* Expense list / filters */}
          <Route
            path="/expenses"
            element={<MonthlyExpenses />}
          />

          {/* Add expense */}
          <Route
            path="/expenses/new"
            element={<MonthlyExpenseForm />}
          />

          {/* View / Edit / Delete expense */}
          <Route
            path="/expenses/:id"
            element={<MonthlyExpenseDetails />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Users */}
          <Route
            path="/users"
            element={<Users />}
          />

        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;