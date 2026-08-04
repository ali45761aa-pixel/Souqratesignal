import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Sparkles, FolderOpen,
  BarChart3, Users, CreditCard, FileText, Settings, Key,
  BrainCircuit, MessageSquare, Layers, Ticket, Code2
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: Sparkles,       label: "مشروع جديد",      labelEn: "New Project",    path: "/agent-builder", group: "main" },
  { icon: Code2,          label: "بناء المشاريع",    labelEn: "Builder",        path: "/builder",       group: "main" },
  { icon: LayoutDashboard,label: "لوحة التحكم",     labelEn: "Dashboard",      path: "/dashboard",     group: "main" },
  { icon: FolderOpen,     label: "المشاريع",         labelEn: "Projects",       path: "/projects",      group: "main" },
  { icon: Layers,         label: "القوالب",          labelEn: "Templates",      path: "/templates",     group: "build" },
  { icon: BrainCircuit,   label: "مكتبة البرومبتات", labelEn: "Prompt Library", path: "/prompts",       group: "build" },
  { icon: MessageSquare,  label: "معاينة مباشرة",    labelEn: "Live Preview",   path: "/preview",       group: "build" },
  { icon: Users,          label: "العملاء",          labelEn: "Clients",        path: "/crm",           group: "business" },
  { icon: CreditCard,     label: "المدفوعات",        labelEn: "Payments",       path: "/payments",      group: "business" },
  { icon: FileText,       label: "الفواتير",         labelEn: "Invoices",       path: "/invoices",      group: "business" },
  { icon: Ticket,         label: "التذاكر",          labelEn: "Tickets",        path: "/tickets",       group: "business" },
  { icon: Key,            label: "مفاتيح API",       labelEn: "API Keys",       path: "/admin",         group: "admin" },
  { icon: BarChart3,      label: "الإحصائيات",       labelEn: "Statistics",     path: "/stats",         group: "admin" },
  { icon: Settings,       label: "الإعدادات",        labelEn: "Settings",       path: "/settings",      group: "admin" },
];

const groupLabels: Record<string, { ar: string; en: string }> = {
  main:     { ar: "الرئيسية", en: "Main" },
  build:    { ar: "البناء",   en: "Build" },
  business: { ar: "الأعمال", en: "Business" },
  admin:    { ar: "الإدارة",  en: "Admin" },
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-center">تسجيل الدخول مطلوب</h1>
          <p className="text-sm text-muted-foreground text-center">يتطلب الوصول إلى لوحة التحكم تسجيل الدخول.</p>
          <Button onClick={() => startLogin()} size="lg" className="w-full gradient-primary text-white">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (w: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const lang = typeof window !== "undefined" ? (localStorage.getItem("lang") || "ar") : "ar";
  const activeMenuItem = menuItems.find(item => location === item.path || location.startsWith(item.path + "/"));

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-14 justify-center border-b border-border/30">
            <div className="flex items-center gap-2.5 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && (
                <span className="font-bold tracking-tight truncate text-sm gradient-text">
                  {lang === "ar" ? "الوكيل الذكي" : "AI Agent"}
                </span>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 overflow-y-auto py-2">
            {(["main", "build", "business", "admin"] as const).map(group => {
              const groupItems = menuItems.filter(i => i.group === group);
              return (
                <div key={group} className="mb-1">
                  {!isCollapsed && (
                    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                      {lang === "ar" ? groupLabels[group].ar : groupLabels[group].en}
                    </p>
                  )}
                  <SidebarMenu className="px-2">
                    {groupItems.map(item => {
                      const isActive = location === item.path || location.startsWith(item.path + "/");
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setLocation(item.path)}
                            tooltip={lang === "ar" ? item.label : item.labelEn}
                            className="h-9 transition-all font-normal"
                          >
                            <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                            <span className="truncate text-sm">{lang === "ar" ? item.label : item.labelEn}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              );
            })}
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate leading-none">{user?.name || "-"}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">{user?.email || "-"}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{lang === "ar" ? "تسجيل الخروج" : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-12 items-center justify-between bg-background/95 px-2 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 rounded-lg bg-background" />
              <span className="text-sm font-medium">
                {activeMenuItem ? (lang === "ar" ? activeMenuItem.label : activeMenuItem.labelEn) : "Menu"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
