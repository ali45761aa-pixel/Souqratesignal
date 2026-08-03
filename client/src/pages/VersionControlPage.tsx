import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GitBranch, Clock, RotateCcw, Eye, Download, Plus, ArrowRight,
  CheckCircle2, GitCommit, Diff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock version data for demo
const MOCK_VERSIONS = [
  { id: 1, versionNumber: 5, label: "Added payment system", createdAt: new Date(Date.now() - 1000 * 60 * 30), isLatest: true },
  { id: 2, versionNumber: 4, label: "Fixed mobile layout", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isLatest: false },
  { id: 3, versionNumber: 3, label: "Added product gallery", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), isLatest: false },
  { id: 4, versionNumber: 2, label: "Initial design", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), isLatest: false },
  { id: 5, versionNumber: 1, label: "Project created", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), isLatest: false },
];

export default function VersionControlPage() {
  const { lang, isRTL } = useLang();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return lang === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
    if (hours > 0) return lang === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return lang === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            {lang === "ar" ? "التحكم في الإصدارات" : "Version Control"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "ar" ? "تتبع التغييرات والتراجع عن أي تعديل" : "Track changes and undo any modification"}
          </p>
        </div>
        <Button className="gradient-primary text-white gap-2" size="sm" onClick={() => toast.success(lang === "ar" ? "تم حفظ نسخة جديدة" : "New version saved")}>
          <Plus className="w-4 h-4" />
          {lang === "ar" ? "حفظ نسخة" : "Save Version"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version Timeline */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-primary" />
                {lang === "ar" ? "سجل الإصدارات" : "Version History"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute start-[27px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-0">
                  {MOCK_VERSIONS.map((version, i) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 hover:bg-muted/30 transition-all text-start relative",
                        selectedVersion === version.id && "bg-primary/5 border-e-2 border-primary"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5",
                        version.isLatest ? "bg-primary text-white" : "bg-muted border-2 border-border text-muted-foreground"
                      )}>
                        {version.isLatest
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <span className="text-xs font-bold">{version.versionNumber}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">v{version.versionNumber}</span>
                          {version.isLatest && (
                            <Badge className="text-xs h-4 px-1.5 gradient-primary text-white">
                              {lang === "ar" ? "الأحدث" : "Latest"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{version.label}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(version.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version Details + Actions */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVersion ? (
            <>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {lang === "ar" ? "تفاصيل الإصدار" : "Version Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const v = MOCK_VERSIONS.find(v => v.id === selectedVersion);
                    if (!v) return null;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{lang === "ar" ? "رقم الإصدار" : "Version"}</span>
                          <Badge variant="outline">v{v.versionNumber}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{lang === "ar" ? "الوصف" : "Label"}</span>
                          <span className="text-sm">{v.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{lang === "ar" ? "التاريخ" : "Date"}</span>
                          <span className="text-sm">{v.createdAt.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Preview version coming soon")}>
                            <Eye className="w-3.5 h-3.5" />
                            {lang === "ar" ? "معاينة" : "Preview"}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success(lang === "ar" ? "تم التراجع للإصدار " + v.versionNumber : "Rolled back to v" + v.versionNumber)}>
                            <RotateCcw className="w-3.5 h-3.5" />
                            {lang === "ar" ? "التراجع لهذا الإصدار" : "Rollback to this version"}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Download coming soon")}>
                            <Download className="w-3.5 h-3.5" />
                            {lang === "ar" ? "تحميل" : "Download"}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Diff Viewer */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Diff className="w-4 h-4 text-primary" />
                    {lang === "ar" ? "مقارنة الإصدارات" : "Version Diff"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
                    <div className="text-green-400">+ &lt;section class="payment-section"&gt;</div>
                    <div className="text-green-400">+   &lt;h2&gt;نظام الدفع&lt;/h2&gt;</div>
                    <div className="text-green-400">+   &lt;div class="payment-methods"&gt;...&lt;/div&gt;</div>
                    <div className="text-green-400">+ &lt;/section&gt;</div>
                    <div className="text-muted-foreground">  &lt;footer&gt;...&lt;/footer&gt;</div>
                    <div className="text-red-400">- &lt;div class="old-footer"&gt;&lt;/div&gt;</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "ar" ? "4 إضافات، 1 حذف" : "4 additions, 1 deletion"}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{lang === "ar" ? "اختر إصداراً لعرض تفاصيله" : "Select a version to view details"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

