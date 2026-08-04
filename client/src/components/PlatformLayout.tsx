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
  BookOpen, Bell, ChevronLeft, ChevronRight,
  Menu, X, LogOut, BarChart3, Zap, Code2, GitBranch, Wand2
} from "lucide-react";
import { trpc } from "@/lib/trpc";

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

  const { data: user } = trpc.auth.meLocal.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logout = trpc.auth.logoutLocal.useMutation({
    onSuccess: () => { window.location.href = "/login"; },
  });

  const navItems: NavItem[] = [
    // Main
    { icon: <Sparkles className="w-4 h-4" />, labelKey: "newProject", href: "/chat", section: "main" },
    { icon: <Wand2 className="w-4 h-4" />, labelKey: "builder", href: "/builder", section: "main" },
    { icon: <LayoutDashboard className="w-4 h-4" />, labelKey: "dashboard", href: "/dashboard", section: "main" },
    { icon: <FolderOpen className="w-4 h-4" />, labelKey: "projects", href: "/projects", section: "main" },
    // Build
    { icon: <Layers className="w-4 h-4" />, labelKey: "templates", href: "/templates", section: "build" },
    { icon: <Puzzle className="w-4 h-4" />, labelKey: "plugins", href: "/plugins", section: "build" },
  { icon: <BookOpen className="w-4 h-4" />, labelKey: "prompts", href: "/prompts", section: "build" },
    { icon: <Code2 className="w-4 h-4" />, labelKey: "preview", href: "/preview", section: "build" },
    { icon: <GitBranch className="w-4 h-4" />, labelKey: "versions", href: "/versions", section: "build" },
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
    <div
      className="flex bg-background"
      style={{ height: '100dvh', flexDirection: isRTL ? 'row-reverse' : 'row' }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className={cn(
        "hidden md:flex flex-col border-e border-border bg-card/50 transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-[var(--sidebar-width)]"
      )}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Full-Screen Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute top-0 bottom-0 w-72 bg-card border-e border-border flex flex-col overflow-hidden"
            style={{ [isRTL ? 'right' : 'left']: 0 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm">{lang === "ar" ? "الوكيل الذكي" : "AI Agent"}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-12 border-b border-border flex items-center justify-between px-3 bg-card/50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline text-xs">
                {lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 end-1 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            <Link href="/chat">
              <Button size="sm" className="gradient-primary text-white gap-1 text-xs h-7 px-2 hidden sm:flex">
                <Sparkles className="w-3 h-3" />
                {tr.nav.newProject}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content - scrollable */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
        >
          {children}
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around"
          style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <Link href="/chat">
            <button className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors", location.startsWith("/chat") ? "text-primary" : "text-muted-foreground")}>
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">{lang === "ar" ? "جديد" : "New"}</span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors", location.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground")}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">{lang === "ar" ? "لوحة" : "Dash"}</span>
            </button>
          </Link>
          <Link href="/projects">
            <button className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors", location.startsWith("/projects") ? "text-primary" : "text-muted-foreground")}>
              <FolderOpen className="w-5 h-5" />
              <span className="text-[10px]">{lang === "ar" ? "مشاريع" : "Projects"}</span>
            </button>
          </Link>
          <Link href="/payments">
            <button className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors", location.startsWith("/payments") ? "text-primary" : "text-muted-foreground")}>
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px]">{lang === "ar" ? "دفع" : "Pay"}</span>
            </button>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">{lang === "ar" ? "المزيد" : "More"}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
