import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import FinancialDashboard from "../pages/financial-dashboard/FinancialDashboard";
import Lorries from "../pages/lorry-management/Lorries";
import LorryDetails from "../pages/lorry-management/LorryDetails";
import MonthlyExpenses from "../pages/monthly-expenses/MonthlyExpenses";
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
        <Route path="/login" element={<Login />} />

        {/* Main Application */}
        <Route element={<PageLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/financial"
            element={<FinancialDashboard />}
          />

          <Route
            path="/lorries"
            element={<Lorries />}
          />

          <Route
            path="/lorries/:id"
            element={<LorryDetails />}
          />

          <Route
            path="/trips"
            element={<Trips />}
          />

          <Route
            path="/trips/:id"
            element={<TripDetails />}
          />

          <Route
            path="/expenses"
            element={<MonthlyExpenses />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/users"
            element={<Users />}
          />
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;