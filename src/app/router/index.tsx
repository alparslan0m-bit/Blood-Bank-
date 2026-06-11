import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { LoginPage } from "@/features/auth/login-page";
import { UnauthorizedPage } from "@/features/auth/unauthorized-page";
import { DashboardPage } from "@/features/dashboard";
import { ChecksPage, CheckDetailPage } from "@/features/checks";
import { DonorsPage, DonorDetailPage } from "@/features/donors";
import { PatientsPage, PatientDetailPage } from "@/features/patients";
import { UsersPage } from "@/features/users";
import { ReceiversPerformancePage } from "@/features/receivers";
import { DistributorsPerformancePage } from "@/features/distributors";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="checks" element={<ChecksPage />} />
        <Route path="checks/:id" element={<CheckDetailPage />} />
        <Route path="donors" element={<DonorsPage />} />
        <Route path="donors/:id" element={<DonorDetailPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route
          path="receivers-performance"
          element={<ReceiversPerformancePage />}
        />
        <Route
          path="distributors-performance"
          element={<DistributorsPerformancePage />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
