import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LangProvider } from "./contexts/LangContext";
import PlatformLayout from "./components/PlatformLayout";
import { lazy, Suspense, useEffect } from "react";
import { trpc } from "./lib/trpc";

// Lazy-load heavy pages for better initial bundle size
const ChatPage = lazy(() => import("./pages/ChatPage"));
const BuilderPage = lazy(() => import("./pages/BuilderPage"));
const AgentBuilderPage = lazy(() => import("./pages/AgentBuilderPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const CRMPage = lazy(() => import("./pages/CRMPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LivePreviewPage = lazy(() => import("./pages/LivePreviewPage"));
const VersionControlPage = lazy(() => import("./pages/VersionControlPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// ── Auth Guard ────────────────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.meLocal.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

const PLATFORM_ROUTES = [
  "/chat", "/builder", "/agent-builder", "/dashboard", "/projects", "/admin", "/templates",
  "/crm", "/payments", "/invoices", "/tickets", "/settings",
  "/plugins", "/prompts", "/stats", "/preview", "/versions",
];

function Router() {
  const [location] = useLocation();
  const isPlatformRoute = PLATFORM_ROUTES.some(r => location.startsWith(r));

  if (isPlatformRoute) {
    return (
      <AuthGuard>
        <PlatformLayout>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
          <Switch>
            <Route path="/chat" component={() => <ChatPage />} />
            <Route path="/builder" component={() => <BuilderPage />} />
            <Route path="/agent-builder" component={() => <AgentBuilderPage />} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/projects" component={ProjectsPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/templates" component={TemplatesPage} />
            <Route path="/crm" component={CRMPage} />
            <Route path="/payments" component={PaymentsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/preview" component={LivePreviewPage} />
            <Route path="/versions" component={VersionControlPage} />
            <Route path="/invoices" component={() => <CRMPage />} />
            <Route path="/tickets" component={() => <CRMPage />} />
            <Route path="/plugins" component={() => <TemplatesPage />} />
            <Route path="/prompts" component={() => <DashboardPage />} />
            <Route path="/stats" component={() => <DashboardPage />} />
            <Route component={NotFound} />
          </Switch>
          </Suspense>
        </PlatformLayout>
      </AuthGuard>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <LangProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LangProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
