import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import {
  FolderOpen, CheckCircle2, TrendingUp, Zap, Plus, ArrowRight,
  Clock, DollarSign, Activity, Star, Sparkles, Code2, Globe,
  ShoppingCart, MessageSquare, Gamepad2, BookOpen, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Mock chart data (will be replaced with real data)
const weeklyData = [
  { day: "Mon", projects: 2, cost: 1.2 },
  { day: "Tue", projects: 4, cost: 2.8 },
  { day: "Wed", projects: 1, cost: 0.9 },
  { day: "Thu", projects: 6, cost: 4.1 },
  { day: "Fri", projects: 3, cost: 2.3 },
  { day: "Sat", projects: 5, cost: 3.7 },
  { day: "Sun", projects: 2, cost: 1.5 },
];

const projectTypeData = [
  { name: "Websites", value: 35, color: "oklch(0.65 0.22 260)" },
  { name: "E-commerce", value: 25, color: "oklch(0.65 0.22 310)" },
  { name: "Bots", value: 20, color: "oklch(0.65 0.20 200)" },
  { name: "Games", value: 10, color: "oklch(0.65 0.20 100)" },
  { name: "Books", value: 10, color: "oklch(0.65 0.20 60)" },
];

const projectTypeIcons: Record<string, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  bot: <MessageSquare className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            color ?? "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const { data: stats } = trpc.projects.stats.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const total = stats?.total ?? 0;
  const successRate = total > 0
    ? Math.round(((stats?.completed ?? 0) / total) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr.dashboard.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "ar" ? "مرحباً بك في منصة الوكيل الذكي" : "Welcome to AI Agent Platform"}
          </p>
        </div>
        <Link href="/chat">
          <Button className="gradient-primary text-white gap-2">
            <Plus className="w-4 h-4" />
            {tr.nav.newProject}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderOpen className="w-5 h-5" />}
          label={tr.dashboard.activeProjects}
          value={stats?.active ?? 0}
          sub={lang === "ar" ? "مشروع نشط" : "active projects"}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label={tr.dashboard.completedProjects}
          value={stats?.completed ?? 0}
          sub={lang === "ar" ? "مكتمل" : "completed"}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label={tr.dashboard.totalCost}
          value={`$${(stats?.totalCost ?? 0).toFixed(2)}`}
          sub={lang === "ar" ? "إجمالي التكلفة" : "total spent"}
          color="bg-yellow-500/10 text-yellow-400"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label={tr.dashboard.tokensUsed}
          value={((stats?.tokensUsed ?? 0) / 1000).toFixed(1) + "K"}
          sub={lang === "ar" ? "رمز مستخدم" : "tokens used"}
          color="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {lang === "ar" ? "النشاط الأسبوعي" : "Weekly Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.22 260)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.22 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.010 260)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "oklch(0.55 0.010 260)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.010 260)" }} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.14 0.008 260)", border: "1px solid oklch(0.22 0.010 260)", borderRadius: "8px" }}
                  labelStyle={{ color: "oklch(0.95 0.005 260)" }}
                />
                <Area type="monotone" dataKey="projects" stroke="oklch(0.65 0.22 260)" fill="url(#colorProjects)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Types */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {lang === "ar" ? "أنواع المشاريع" : "Project Types"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={projectTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {projectTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.14 0.008 260)", border: "1px solid oklch(0.22 0.010 260)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {projectTypeData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate + Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Rate */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {tr.dashboard.successRate}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gradient">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "ar" ? "نسبة نجاح المشاريع" : "Project success rate"}
              </p>
            </div>
            <Progress value={successRate} className="h-2" />
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-green-500/10 rounded-lg p-2">
                <div className="text-lg font-bold text-green-400">{stats?.completed ?? 0}</div>
                <div className="text-xs text-muted-foreground">{tr.status.completed}</div>
              </div>
              <div className="bg-destructive/10 rounded-lg p-2">
                <div className="text-lg font-bold text-destructive">{stats?.failed ?? 0}</div>
                <div className="text-xs text-muted-foreground">{tr.status.failed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              {tr.dashboard.recentProjects}
            </CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                {tr.common.view} <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">{tr.dashboard.noProjects}</p>
                <Link href="/chat">
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    {tr.dashboard.startFirst}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {projectTypeIcons[project.projectType ?? "website"] ?? <Globe className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.prompt.slice(0, 60)}...</p>
                      </div>
                      <Badge variant={
                        project.status === "completed" ? "default" :
                        project.status === "failed" ? "destructive" : "secondary"
                      } className="text-xs shrink-0">
                        {tr.status[project.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {lang === "ar" ? "إجراءات سريعة" : "Quick Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Globe className="w-5 h-5" />, label: lang === "ar" ? "موقع شركة" : "Company Site", href: "/chat" },
              { icon: <ShoppingCart className="w-5 h-5" />, label: lang === "ar" ? "متجر إلكتروني" : "E-commerce", href: "/chat" },
              { icon: <MessageSquare className="w-5 h-5" />, label: lang === "ar" ? "بوت تليغرام" : "Telegram Bot", href: "/chat" },
              { icon: <Gamepad2 className="w-5 h-5" />, label: lang === "ar" ? "لعبة ويب" : "Web Game", href: "/chat" },
            ].map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all cursor-pointer text-center">
                  <div className="text-primary">{action.icon}</div>
                  <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
