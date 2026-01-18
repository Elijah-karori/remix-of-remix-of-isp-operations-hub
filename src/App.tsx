import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Finance from "./pages/Finance";
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
import Leads from "./pages/CRM/Leads";
import Deals from "./pages/CRM/Deals"; // New import for Deals page
import Activities from "./pages/CRM/Activities";
import CRMIndex from "./pages/CRM/Index";
import FinanceIndex from "./pages/Finance/Index"; // New import
import Budgets from "./pages/Finance/Budgets";     // New import
import Invoices from "./pages/Finance/Invoices";   // New import
import Accounts from "./pages/Finance/Accounts";   // New import
import Reports from "./pages/Finance/Reports";
import Mpesa from "./pages/Finance/Mpesa";     // New import
import Ncba from "./pages/Finance/Ncba";       // New import
import HRIndex from "./pages/HR/Index";
import Employees from "./pages/HR/Employees";
import Payroll from "./pages/HR/Payroll";
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
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route // New route for Finance Index
              path="/finance"
              element={
                <ProtectedRoute>
                  <FinanceIndex />
                </ProtectedRoute>
              }
            />
            <Route // New route for Finance Budgets
              path="/finance/budgets"
              element={
                <ProtectedRoute>
                  <Budgets />
                </ProtectedRoute>
              }
            />
            <Route // New route for Finance Invoices
              path="/finance/invoices"
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route // New route for Finance Accounts
              path="/finance/accounts"
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route // New route for Finance Reports
              path="/finance/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route // New route for Mpesa
              path="/finance/mpesa"
              element={
                <ProtectedRoute>
                  <Mpesa />
                </ProtectedRoute>
              }
            />
            <Route // New route for NCBA Bank
              path="/finance/ncba"
              element={
                <ProtectedRoute>
                  <Ncba />
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
              path="/system/workflows"
              element={
                <ProtectedRoute>
                  <Workflows />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/permissions"
              element={
                <ProtectedRoute>
                  <Permissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/audit"
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/settings"
              element={
                <ProtectedRoute>
                  <SystemSettings />
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
