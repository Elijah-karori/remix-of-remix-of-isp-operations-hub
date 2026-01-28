import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthProvider";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { initializeSecurity } from "@/lib/security/csp";

// New Authentication Pages
import {
  LoginPage,
  PasswordlessRequestPage,
  PasswordlessVerifyOtpPage,
  RegisterRequestPage,
  RegisterVerifyPage,
  SetPasswordPage,
  MagicLinkVerify,
} from "@/pages/auth";

// App Pages
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import Finance from "./pages/Finance";
import Inventory from "./pages/Inventory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// System Pages
import Workflows from "./pages/system/workflows";
import Permissions from "./pages/system/permissions";
import Analytics from "./pages/system/analytics";
import Audit from "./pages/system/audit";
import SystemSettings from "./pages/system/settings";
import TesterCoverage from "./pages/system/TesterCoverage";
import AuditorHeatmap from "./pages/system/AuditorHeatmap";

// Business Pages
import Marketing from "./pages/Marketing";
import Leads from "./pages/CRM/Leads";
import Deals from "./pages/CRM/Deals";
import Activities from "./pages/CRM/Activities";
import CRMIndex from "./pages/CRM/Index";
import HRIndex from "./pages/HR/Index";
import Employees from "./pages/HR/Employees";
import Payroll from "./pages/HR/Payroll";
import HRComplaints from "./pages/HR/Complaints";
import TechniciansIndex from "./pages/Technicians/Index";

const queryClient = new QueryClient();

const App = () => {
  // Initialize security features on app load
  useEffect(() => {
    initializeSecurity();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SessionTimeoutWarning />

            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterRequestPage />} />
              <Route path="/auth/register/verify" element={<RegisterVerifyPage />} />
              <Route path="/auth/passwordless/request" element={<PasswordlessRequestPage />} />
              <Route path="/auth/passwordless/verify-otp" element={<PasswordlessVerifyOtpPage />} />
              <Route path="/auth/passwordless/verify" element={<MagicLinkVerify />} />
              <Route path="/auth/set-password" element={<SetPasswordPage />} />

              {/* Redirect /dashboard to / */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route // New route for CRM Leads
                path="/crm/leads"
                element={
                  <ProtectedRoute requiredPermission="crm:leads:read">
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route // New route for CRM Deals
                path="/crm/deals"
                element={
                  <ProtectedRoute requiredPermission="crm:deals:read">
                    <Deals />
                  </ProtectedRoute>
                }
              />
              <Route // New route for CRM Activities
                path="/crm/activities"
                element={
                  <ProtectedRoute requiredPermission="crm:activities:read">
                    <Activities />
                  </ProtectedRoute>
                }
              />
              <Route // New route for CRM Index
                path="/crm"
                element={
                  <ProtectedRoute requiredPermission="crm:read">
                    <CRMIndex />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute requiredPermission="projects:read">
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute requiredPermission="tasks:read">
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route // Consolidated Finance page with tabs
                path="/finance"
                element={
                  <ProtectedRoute requiredPermission="finance:read">
                    <Finance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredPermission="inventory:read">
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr"
                element={
                  <ProtectedRoute requiredPermission="hr:read">
                    <HRIndex />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/employees"
                element={
                  <ProtectedRoute requiredPermission="hr:employees:read">
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll"
                element={
                  <ProtectedRoute requiredPermission="hr:payroll:read">
                    <Payroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/complaints"
                element={
                  <ProtectedRoute requiredPermission="hr:complaints:read">
                    <HRComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technicians"
                element={
                  <ProtectedRoute requiredPermission="technicians:read">
                    <TechniciansIndex />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketing"
                element={
                  <ProtectedRoute>
                    <Marketing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/workflows"
                element={
                  <ProtectedRoute requiredPermission="system:workflows:manage">
                    <Workflows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/permissions"
                element={
                  <ProtectedRoute requiredPermission="system:permissions:manage">
                    <Permissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/analytics"
                element={
                  <ProtectedRoute requiredPermission="system:analytics:view">
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/audit"
                element={
                  <ProtectedRoute requiredPermission="system:audit:view">
                    <Audit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/settings"
                element={
                  <ProtectedRoute requiredPermission="system:settings:manage">
                    <SystemSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/tester-coverage"
                element={
                  <ProtectedRoute requiredPermission="system:testing:view">
                    <TesterCoverage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system/auditor-heatmap"
                element={
                  <ProtectedRoute requiredPermission="system:auditing:view">
                    <AuditorHeatmap />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
