import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LangProvider } from "./contexts/LangContext";
import PlatformLayout from "./components/PlatformLayout";
import ChatPage from "./pages/ChatPage";
import BuilderPage from "./pages/BuilderPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AdminPage from "./pages/AdminPage";
import TemplatesPage from "./pages/TemplatesPage";
import CRMPage from "./pages/CRMPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import LivePreviewPage from "./pages/LivePreviewPage";
import VersionControlPage from "./pages/VersionControlPage";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";

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
      <PlatformLayout>
        <Switch>
          <Route path="/chat" component={() => <ChatPage />} />
          <Route path="/builder" component={() => <BuilderPage />} />
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
      </PlatformLayout>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
import AgentBuilderPage from "./pages/AgentBuilderPage";
          <Route path="/agent-builder" component={() => <AgentBuilderPage />} />
