import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, LayoutDashboard, FolderOpen, Users, CreditCard,
  FileText, Ticket, Settings, Key, Brain, Layers, Puzzle,
  BookOpen, Bell, ChevronLeft, ChevronRight, Globe, Moon, Sun,
  Menu, X, LogOut, BarChart3, MessageSquare, Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NavItem {
  icon: React.ReactNode;
  labelKey: string;
  href: string;
  badge?: string | number;
  section?: string;
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { lang, changeLang, isRTL } = useLang();
  const tr = t(lang);
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.href = "/",
  });

  const navItems: NavItem[] = [
    // Main
    { icon: <Sparkles className="w-4 h-4" />, labelKey: "newProject", href: "/chat", section: "main" },
    { icon: <LayoutDashboard className="w-4 h-4" />, labelKey: "dashboard", href: "/dashboard", section: "main" },
    { icon: <FolderOpen className="w-4 h-4" />, labelKey: "projects", href: "/projects", section: "main" },
    // Build
    { icon: <Layers className="w-4 h-4" />, labelKey: "templates", href: "/templates", section: "build" },
    { icon: <Puzzle className="w-4 h-4" />, labelKey: "plugins", href: "/plugins", section: "build" },
    { icon: <BookOpen className="w-4 h-4" />, labelKey: "prompts", href: "/prompts", section: "build" },
    // Business
    { icon: <Users className="w-4 h-4" />, labelKey: "clients", href: "/crm", section: "business" },
    { icon: <CreditCard className="w-4 h-4" />, labelKey: "payments", href: "/payments", section: "business" },
    { icon: <FileText className="w-4 h-4" />, labelKey: "invoices", href: "/invoices", section: "business" },
    { icon: <Ticket className="w-4 h-4" />, labelKey: "tickets", href: "/tickets", section: "business" },
    // Admin
    { icon: <Key className="w-4 h-4" />, labelKey: "apiKeys", href: "/admin", section: "admin" },
    { icon: <Brain className="w-4 h-4" />, labelKey: "aiSettings", href: "/admin?tab=ai", section: "admin" },
    { icon: <BarChart3 className="w-4 h-4" />, labelKey: "statistics", href: "/stats", section: "admin" },
    { icon: <Settings className="w-4 h-4" />, labelKey: "settings", href: "/settings", section: "admin" },
  ];

  const sections = [
    { id: "main", label: lang === "ar" ? "الرئيسية" : "Main" },
    { id: "build", label: lang === "ar" ? "البناء" : "Build" },
    { id: "business", label: lang === "ar" ? "الأعمال" : "Business" },
    { id: "admin", label: lang === "ar" ? "الإدارة" : "Admin" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-4 border-b border-border", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">
              {lang === "ar" ? "الوكيل الذكي" : "AI Agent"}
            </p>
            <p className="text-xs text-muted-foreground">Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section.id);
          return (
            <div key={section.id} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-4 mb-1.5">
                  {section.label}
                </p>
              )}
              {items.map(item => {
                const isActive = location === item.href || location.startsWith(item.href + "?");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "sidebar-item mx-2 mb-0.5",
                        isActive && "active",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span className="flex-1 truncate">
                          {tr.nav[item.labelKey as keyof typeof tr.nav]}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge className="text-xs h-4 px-1.5">{item.badge}</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
              {!collapsed && <Separator className="mx-4 mt-3 opacity-30" />}
            </div>
          );
        })}
      </ScrollArea>

      {/* Bottom: User + Lang + Collapse */}
      <div className="border-t border-border p-3 space-y-2">
        {/* Language Toggle */}
        {!collapsed && (
          <div className="flex gap-1">
            <button
              onClick={() => changeLang("ar")}
              className={cn("flex-1 text-xs py-1 rounded-lg transition-all", lang === "ar" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}
            >
              🇸🇦 AR
            </button>
            <button
              onClick={() => changeLang("en")}
              className={cn("flex-1 text-xs py-1 rounded-lg transition-all", lang === "en" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}
            >
              🇺🇸 EN
            </button>
          </div>
        )}
        {/* User */}
        {user && (
          <div className={cn("flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer", collapsed && "justify-center")}>
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {(user.name ?? "U").charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                </div>
                <button onClick={() => logout.mutate()} className="text-muted-foreground hover:text-destructive transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {isRTL
            ? (collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
            : (collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-e border-border bg-card/50 transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-[var(--sidebar-width)]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute start-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-card border-e border-border flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-[var(--header-height)] border-b border-border flex items-center justify-between px-4 bg-card/50 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">
                {lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 end-1 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            {/* New Project CTA */}
            <Link href="/chat">
              <Button size="sm" className="gradient-primary text-white gap-1.5 text-xs hidden sm:flex">
                <Sparkles className="w-3.5 h-3.5" />
                {tr.nav.newProject}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
