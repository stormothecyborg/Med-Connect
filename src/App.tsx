import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES } from "@/config/routes";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

// Main pages
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientListPage } from "@/pages/patients/PatientListPage";
import { PatientRegistrationPage } from "@/pages/patients/PatientRegistrationPage";
import { UserManagementPage } from "@/pages/admin/UserManagementPage";
import { RoleManagementPage } from "@/pages/admin/RoleManagementPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

            {/* Protected routes */}
            <Route path={ROUTES.DASHBOARD} element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            
            {/* Patient routes */}
            <Route path={ROUTES.PATIENTS} element={
              <ProtectedRoute allowedRoles={['doctor', 'nurse', 'admin', 'receptionist']}><PatientListPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.PATIENT_NEW} element={
              <ProtectedRoute allowedRoles={['receptionist', 'admin']}><PatientRegistrationPage /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path={ROUTES.USER_MANAGEMENT} element={
              <ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.ROLE_MANAGEMENT} element={
              <ProtectedRoute allowedRoles={['admin']}><RoleManagementPage /></ProtectedRoute>
            } />

            {/* Placeholder routes */}
            <Route path={ROUTES.APPOINTMENTS} element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.DOCTOR_SCHEDULE} element={
              <ProtectedRoute allowedRoles={['doctor']}><DashboardPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.DOCTOR_AVAILABILITY} element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}><DashboardPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.MEDICAL_RECORDS} element={
              <ProtectedRoute allowedRoles={['doctor', 'nurse']}><DashboardPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.PATIENT_PORTAL} element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
