import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

// Eager loaded for faster LCP on main routes
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

// Lazy loaded routes
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Sales = lazy(() => import("./pages/Sales"));
const Leads = lazy(() => import("./pages/Leads"));
const LeadDetail = lazy(() => import("./pages/LeadDetail"));
const Kanban = lazy(() => import("./pages/Kanban"));
const Users = lazy(() => import("./pages/Users"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Tasks = lazy(() => import("./pages/Tasks"));
const BulkImport = lazy(() => import("./pages/BulkImport"));
const WhatsApp = lazy(() => import("./pages/WhatsApp"));
const GamificationLive = lazy(() => import("./pages/GamificationLive"));
const Help = lazy(() => import("./pages/Help"));
const Settings = lazy(() => import("./pages/Settings"));
const ReportSettings = lazy(() => import("./pages/ReportSettings"));
const Goals = lazy(() => import("./pages/Goals"));
const KPI = lazy(() => import("./pages/KPI"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Prospecting = lazy(() => import("./pages/Prospecting"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});



const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RealtimeProvider /> {/* Adicionado Provider Global */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lead/:id"
                element={
                  <ProtectedRoute>
                    <LeadDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kanban"
                element={
                  <ProtectedRoute>
                    <Kanban />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <ProtectedRoute>
                    <Integrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agenda"
                element={
                  <ProtectedRoute>
                    <Agenda />
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
              <Route
                path="/bulk-import"
                element={
                  <ProtectedRoute>
                    <BulkImport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whatsapp"
                element={
                  <ProtectedRoute>
                    <WhatsApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gamification"
                element={
                  <ProtectedRoute>
                    <GamificationLive />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/reports"
                element={
                  <ProtectedRoute>
                    <ReportSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kpi"
                element={
                  <ProtectedRoute>
                    <KPI />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prospecting"
                element={
                  <ProtectedRoute>
                    <Prospecting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              {/* Public routes */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/admwf360" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
