import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Moon, Sun, Download, Upload, Bell, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { lang, changeLang, isRTL } = useLang();
  const tr = t(lang);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(true);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          {tr.settings.title}
        </h1>
      </div>

      {/* Language */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            {tr.settings.language}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <button
            onClick={() => changeLang("ar")}
            className={cn(
              "flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all",
              lang === "ar" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
            )}
          >
            🇸🇦 العربية (RTL)
          </button>
          <button
            onClick={() => changeLang("en")}
            className={cn(
              "flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all",
              lang === "en" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
            )}
          >
            🇺🇸 English (LTR)
          </button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            {tr.settings.theme}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <button
            onClick={() => { setTheme("dark"); document.documentElement.classList.remove("light"); }}
            className={cn(
              "flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
              theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
            )}
          >
            <Moon className="w-4 h-4" /> {tr.settings.dark}
          </button>
          <button
            onClick={() => { setTheme("light"); document.documentElement.classList.add("light"); }}
            className={cn(
              "flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
              theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
            )}
          >
            <Sun className="w-4 h-4" /> {tr.settings.light}
          </button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {lang === "ar" ? "الإشعارات" : "Notifications"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: lang === "ar" ? "إشعارات اكتمال المشاريع" : "Project completion notifications", key: "project" },
            { label: lang === "ar" ? "إشعارات الدفع" : "Payment notifications", key: "payment" },
            { label: lang === "ar" ? "إشعارات الأخطاء" : "Error notifications", key: "error" },
            { label: lang === "ar" ? "التقارير الأسبوعية" : "Weekly reports", key: "report" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label className="text-sm">{item.label}</Label>
              <Switch defaultChecked={true} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {lang === "ar" ? "البيانات والنسخ الاحتياطي" : "Data & Backup"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4" />
            {lang === "ar" ? "تصدير جميع البيانات" : "Export All Data"}
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Import coming soon")}>
            <Upload className="w-4 h-4" />
            {lang === "ar" ? "استيراد البيانات" : "Import Data"}
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full gap-2" onClick={() => toast.error("This action cannot be undone")}>
            <Trash2 className="w-4 h-4" />
            {lang === "ar" ? "حذف جميع البيانات" : "Delete All Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

