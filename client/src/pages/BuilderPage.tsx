import { useState, useRef } from "react";
import { useLang } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Send, Loader2, Download, Eye, Code2, Sparkles,
  RefreshCw, Copy, Check, Maximize2, Smartphone,
  Tablet, Monitor, Zap, ChevronRight, CheckCircle2,
  AlertCircle, Clock, X, Wand2
} from "lucide-react";
import { Streamdown } from "streamdown";

type ViewMode = "preview" | "code";
type Device = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const agentColors: Record<string, string> = {
  planning: "text-violet-400",
  programming: "text-blue-400",
  design: "text-pink-400",
  content: "text-amber-400",
  bots: "text-cyan-400",
  writing: "text-emerald-400",
  qa: "text-green-400",
  research: "text-orange-400",
  marketing: "text-red-400",
  games: "text-purple-400",
  payments: "text-yellow-400",
};

export default function BuilderPage() {
  const { lang, isRTL } = useLang();
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [plan, setPlan] = useState("");
  const [filename, setFilename] = useState("project.html");
  const [language, setLanguage] = useState("html");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSteps, setBuildSteps] = useState<{ label: string; labelAr: string; status: "pending"|"active"|"done" }[]>([]);
  const [copied, setCopied] = useState(false);
  const [improveInput, setImproveInput] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const buildMutation = trpc.builder.build.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      setPlan(data.plan);
      setFilename(data.filename);
      setLanguage(data.language);
      setViewMode("preview");
      // Mark all steps done
      setBuildSteps(prev => prev.map(s => ({ ...s, status: "done" as const })));
      setIsBuilding(false);
      toast.success(lang === "ar" ? "✅ تم بناء المشروع بنجاح!" : "✅ Project built successfully!");
    },
    onError: (err) => {
      setIsBuilding(false);
      setBuildSteps([]);
      toast.error(err.message);
    },
  });

  const improveMutation = trpc.builder.improve.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      setIsImproving(false);
      setImproveInput("");
      toast.success(lang === "ar" ? "✅ تم تحديث الكود!" : "✅ Code updated!");
    },
    onError: (err) => {
      setIsImproving(false);
      toast.error(err.message);
    },
  });

  const handleBuild = () => {
    if (!prompt.trim() || isBuilding) return;
    setIsBuilding(true);
    setGeneratedCode("");
    setPlan("");

    // Simulate step-by-step progress
    const steps = [
      { label: "Analyzing requirements", labelAr: "تحليل المتطلبات", status: "active" as const },
      { label: "Planning architecture", labelAr: "تخطيط البنية", status: "pending" as const },
      { label: "Designing UI", labelAr: "تصميم الواجهة", status: "pending" as const },
      { label: "Writing code", labelAr: "كتابة الكود", status: "pending" as const },
      { label: "Adding content", labelAr: "إضافة المحتوى", status: "pending" as const },
      { label: "Final review", labelAr: "المراجعة النهائية", status: "pending" as const },
    ];
    setBuildSteps(steps);

    // Animate steps
    steps.forEach((_, i) => {
      setTimeout(() => {
        setBuildSteps(prev => prev.map((s, j) => ({
          ...s,
          status: j < i ? "done" : j === i ? "active" : "pending",
        })));
      }, i * 1500);
    });

    buildMutation.mutate({ prompt: prompt.trim(), lang });
  };

  const handleImprove = () => {
    if (!improveInput.trim() || !generatedCode || isImproving) return;
    setIsImproving(true);
    improveMutation.mutate({ code: generatedCode, instruction: improveInput.trim(), lang });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم تحميل الملف!" : "File downloaded!");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(lang === "ar" ? "تم نسخ الكود!" : "Code copied!");
  };

  const hasResult = !!generatedCode;

  return (
    <div className="flex flex-col h-full bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Top: Prompt Input ── */}
      <div className="shrink-0 border-b border-border bg-card/50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-background border-2 border-border focus-within:border-primary/60 rounded-2xl transition-all overflow-hidden">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleBuild(); } }}
                placeholder={lang === "ar"
                  ? "صف مشروعك... مثال: ابني لي متجر عطور بتصميم أسود ذهبي مع سلة تسوق"
                  : "Describe your project... e.g. Build me a perfume store with black gold design and shopping cart"}
                className="w-full bg-transparent px-4 pt-3.5 pb-2 text-base text-foreground placeholder:text-muted-foreground/60 resize-none outline-none leading-relaxed"
                style={{ minHeight: "56px", maxHeight: "120px", direction: isRTL ? "rtl" : "ltr" }}
                rows={1}
                disabled={isBuilding}
              />
              <div className="px-3 pb-2 flex items-center justify-between">
                <div className="flex gap-2 text-xs text-muted-foreground/50">
                  <span>🌐 {lang === "ar" ? "موقع" : "Website"}</span>
                  <span>🛒 {lang === "ar" ? "متجر" : "Store"}</span>
                  <span>🎮 {lang === "ar" ? "لعبة" : "Game"}</span>
                  <span>🤖 {lang === "ar" ? "بوت" : "Bot"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleBuild}
              disabled={!prompt.trim() || isBuilding}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200",
                prompt.trim() && !isBuilding
                  ? "gradient-primary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
                  : "bg-muted cursor-not-allowed opacity-50"
              )}
            >
              {isBuilding
                ? <Loader2 className="w-6 h-6 animate-spin text-white" />
                : <Wand2 className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Build Steps (shown while building) ── */}
        {isBuilding && buildSteps.length > 0 && (
          <div className="w-64 shrink-0 border-e border-border bg-card/30 p-4 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold">
                {lang === "ar" ? "جاري البناء..." : "Building..."}
              </span>
            </div>
            {buildSteps.map((step, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                step.status === "active" && "bg-primary/10 border border-primary/30",
                step.status === "done" && "opacity-60",
              )}>
                <div className="shrink-0">
                  {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />}
                  {step.status === "active" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                  {step.status === "done" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
                <span className={cn(
                  "text-sm",
                  step.status === "active" ? "text-primary font-medium" :
                  step.status === "done" ? "text-green-400" : "text-muted-foreground"
                )}>
                  {lang === "ar" ? step.labelAr : step.label}
                </span>
              </div>
            ))}
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs text-muted-foreground text-center">
                {lang === "ar" ? "⏳ قد يستغرق 30-60 ثانية..." : "⏳ May take 30-60 seconds..."}
              </p>
            </div>
          </div>
        )}

        {/* ── Right: Preview / Code ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasResult && !isBuilding ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-4 glow-primary">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {lang === "ar" ? "ابنِ مشروعك الآن" : "Build Your Project Now"}
              </h2>
              <p className="text-muted-foreground text-base max-w-md mb-6">
                {lang === "ar"
                  ? "اكتب وصف مشروعك في الأعلى واضغط على زر البناء. سيقوم الذكاء الاصطناعي ببناء الكود الكامل في ثوانٍ."
                  : "Describe your project above and press Build. AI will generate complete code in seconds."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                {[
                  { icon: "🌐", label: lang === "ar" ? "موقع شركة" : "Company Site", prompt: lang === "ar" ? "ابني موقع شركة تقنية عصري مع لوحة تحكم" : "Build a modern tech company website with dashboard" },
                  { icon: "🛒", label: lang === "ar" ? "متجر إلكتروني" : "Online Store", prompt: lang === "ar" ? "ابني متجر عطور فاخر بتصميم أسود ذهبي" : "Build a luxury perfume store with black gold design" },
                  { icon: "🎮", label: lang === "ar" ? "لعبة ويب" : "Web Game", prompt: lang === "ar" ? "اصنع لعبة Snake بسيطة بـ HTML5" : "Make a simple Snake game with HTML5" },
                  { icon: "📊", label: lang === "ar" ? "لوحة تحكم" : "Dashboard", prompt: lang === "ar" ? "ابني لوحة تحكم احترافية مع رسوم بيانية" : "Build a professional dashboard with charts" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(item.prompt)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : hasResult ? (
            <>
              {/* Toolbar */}
              <div className="shrink-0 border-b border-border bg-card/50 px-3 py-2 flex items-center gap-2 flex-wrap">
                {/* View Toggle */}
                <div className="flex bg-background rounded-lg p-0.5 border border-border">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all", viewMode === "preview" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {lang === "ar" ? "معاينة" : "Preview"}
                  </button>
                  <button
                    onClick={() => setViewMode("code")}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all", viewMode === "code" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {lang === "ar" ? "الكود" : "Code"}
                  </button>
                </div>

                {/* Device Toggle (preview only) */}
                {viewMode === "preview" && (
                  <div className="flex bg-background rounded-lg p-0.5 border border-border">
                    {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setDevice(d)}
                        className={cn("p-1.5 rounded-md transition-all", device === d ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
                      >
                        {d === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                        {d === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                        {d === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {lang === "ar" ? "نسخ" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-white text-sm transition-all hover:opacity-90"
                >
                  <Download className="w-3.5 h-3.5" />
                  {lang === "ar" ? "تحميل" : "Download"}
                </button>
              </div>

              {/* Preview / Code Area */}
              <div className="flex-1 overflow-hidden bg-muted/20">
                {viewMode === "preview" ? (
                  <div className="h-full flex items-start justify-center p-4 overflow-auto">
                    <div
                      className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
                      style={{ width: deviceSizes[device], maxWidth: "100%", minHeight: "400px" }}
                    >
                      {language === "html" ? (
                        <iframe
                          srcDoc={generatedCode}
                          className="w-full border-0"
                          style={{ height: "600px" }}
                          sandbox="allow-scripts allow-same-origin"
                          title="preview"
                        />
                      ) : (
                        <div className="p-6 bg-gray-900 h-full">
                          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap overflow-auto">
                            {generatedCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <pre className="p-4 text-sm font-mono text-green-300 bg-gray-950 min-h-full whitespace-pre-wrap leading-relaxed">
                      {generatedCode}
                    </pre>
                  </div>
                )}
              </div>

              {/* Improve Bar */}
              <div className="shrink-0 border-t border-border bg-card/50 p-3">
                <div className="flex gap-2 max-w-4xl mx-auto">
                  <input
                    value={improveInput}
                    onChange={e => setImproveInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleImprove(); }}
                    placeholder={lang === "ar" ? "اطلب تعديلاً... مثال: غيّر اللون الرئيسي إلى الأزرق" : "Request a change... e.g. Change primary color to blue"}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60"
                    disabled={isImproving}
                  />
                  <button
                    onClick={handleImprove}
                    disabled={!improveInput.trim() || isImproving}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
                      improveInput.trim() && !isImproving
                        ? "gradient-primary text-white hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isImproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {lang === "ar" ? "تعديل" : "Improve"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
