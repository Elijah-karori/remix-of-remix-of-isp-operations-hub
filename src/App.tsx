import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import Finance from "./pages/Finance"; // This is the consolidated Finance page
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordlessLogin from "./pages/PasswordlessLogin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VerifyMagicLink from "./pages/VerifyMagicLink";
import Workflows from "./pages/system/workflows";
import Permissions from "./pages/system/permissions";
import Analytics from "./pages/system/analytics";
import Audit from "./pages/system/audit";
import SystemSettings from "./pages/system/settings";
import TesterCoverage from "./pages/system/TesterCoverage";
import AuditorHeatmap from "./pages/system/AuditorHeatmap";
import Marketing from "./pages/Marketing";
import Leads from "./pages/CRM/Leads";
import Deals from "./pages/CRM/Deals"; // New import for Deals page
import Activities from "./pages/CRM/Activities";
import CRMIndex from "./pages/CRM/Index";
import HRIndex from "./pages/HR/Index";
import Employees from "./pages/HR/Employees";
import Payroll from "./pages/HR/Payroll";
import HRComplaints from "./pages/HR/Complaints";
import TechniciansIndex from "./pages/Technicians/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/passwordless" element={<PasswordlessLogin />} />
            <Route path="/auth/verify" element={<VerifyMagicLink />} />

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
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              }
            />
            <Route // New route for CRM Deals
              path="/crm/deals"
              element={
                <ProtectedRoute>
                  <Deals />
                </ProtectedRoute>
              }
            />
            <Route // New route for CRM Activities
              path="/crm/activities"
              element={
                <ProtectedRoute>
                  <Activities />
                </ProtectedRoute>
              }
            />
            <Route // New route for CRM Index
              path="/crm"
              element={
                <ProtectedRoute>
                  <CRMIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
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
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route // Consolidated Finance page with tabs
              path="/finance"
              element={
                <ProtectedRoute>
                  <Finance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute>
                  <HRIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees"
              element={
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/complaints"
              element={
                <ProtectedRoute>
                  <HRComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technicians"
              element={
                <ProtectedRoute>
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

export default App;
