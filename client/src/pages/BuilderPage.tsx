import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "@/contexts/LangContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  Wand2, Send, Loader2, Download, Eye, Code2,
  Monitor, Tablet, Smartphone, Copy, Check,
  X, Zap, ChevronRight, CheckCircle2, AlertCircle,
  FileCode2, FileText, Database, Package, RefreshCw,
  Sparkles, Plus, ArrowUp, MessageSquare, FolderOpen
} from "lucide-react";
import { Streamdown } from "streamdown";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BuildStep {
  label: string;
  labelAr: string;
  status: "pending" | "active" | "done" | "error";
}

type ViewMode = "preview" | "code";
type Device = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const fileIcons: Record<string, React.ReactNode> = {
  html: <FileCode2 className="w-3.5 h-3.5 text-orange-400" />,
  css: <FileCode2 className="w-3.5 h-3.5 text-blue-400" />,
  javascript: <FileCode2 className="w-3.5 h-3.5 text-yellow-400" />,
  typescript: <FileCode2 className="w-3.5 h-3.5 text-blue-500" />,
  python: <FileCode2 className="w-3.5 h-3.5 text-green-400" />,
  sql: <Database className="w-3.5 h-3.5 text-purple-400" />,
  json: <FileCode2 className="w-3.5 h-3.5 text-yellow-300" />,
  markdown: <FileText className="w-3.5 h-3.5 text-gray-400" />,
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { lang, isRTL } = useLang();
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [copied, setCopied] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [improveInput, setImproveInput] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const improveRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [prompt]);

  // Load prompt from Home page
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPrompt");
    if (pending) {
      sessionStorage.removeItem("pendingPrompt");
      setPrompt(pending);
    }
  }, []);

  // ── Build Steps ──────────────────────────────────────────────────────────────
  const initBuildSteps = (type: string): BuildStep[] => {
    const base: BuildStep[] = [
      { label: "Analyzing requirements", labelAr: "تحليل المتطلبات", status: "active" },
      { label: "Planning architecture", labelAr: "تخطيط البنية", status: "pending" },
      { label: "Designing UI/UX", labelAr: "تصميم الواجهة", status: "pending" },
      { label: "Writing code", labelAr: "كتابة الكود", status: "pending" },
    ];
    if (type === "fullstack" || type === "ecommerce") {
      base.push({ label: "Building backend", labelAr: "بناء الـ Backend", status: "pending" });
      base.push({ label: "Setting up database", labelAr: "إعداد قاعدة البيانات", status: "pending" });
    }
    if (type === "bot") {
      base.push({ label: "Building bot handlers", labelAr: "بناء معالجات البوت", status: "pending" });
    }
    base.push({ label: "Adding content & SEO", labelAr: "إضافة المحتوى والـ SEO", status: "pending" });
    base.push({ label: "Final review", labelAr: "المراجعة النهائية", status: "pending" });
    return base;
  };

  // ── Main Build Function ──────────────────────────────────────────────────────
  const handleBuild = useCallback(async (userPrompt: string, isImprove = false) => {
    if (!userPrompt.trim() || isBuilding) return;

    abortRef.current = new AbortController();
    setIsBuilding(true);
    setStreamingContent("");

    if (!isImprove) {
      setFiles([]);
      setActiveFile(0);
    }

    // Build conversation history
    const history: Message[] = isImprove
      ? [
          ...conversationHistory,
          { role: "assistant", content: files[activeFile]?.content || "" },
        ]
      : [];

    const steps = initBuildSteps("website");
    setBuildSteps(steps);

    // Animate steps
    steps.forEach((_, i) => {
      setTimeout(() => {
        setBuildSteps(prev => prev.map((s, j) => ({
          ...s,
          status: j < i ? "done" : j === i ? "active" : "pending",
        })));
      }, i * 1800);
    });

    try {
      const response = await fetch("/api/stream-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          lang,
          conversationHistory: history,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "meta") {
              setProjectType(parsed.projectType);
              setBuildSteps(initBuildSteps(parsed.projectType));
            } else if (parsed.type === "chunk") {
              accumulated += parsed.content;
              setStreamingContent(accumulated);
            } else if (parsed.type === "done") {
              // All steps done
              setBuildSteps(prev => prev.map(s => ({ ...s, status: "done" as const })));
              setFiles(parsed.files || []);
              setActiveFile(0);
              setStreamingContent("");
              setViewMode("preview");

              // Update conversation history
              setConversationHistory(prev => [
                ...prev,
                { role: "user", content: userPrompt },
              ]);

              toast.success(lang === "ar" ? "✅ تم بناء المشروع!" : "✅ Project built!");
            } else if (parsed.type === "error") {
              throw new Error(parsed.message);
            }
          } catch (e: any) {
            if (e.message && !e.message.includes("JSON")) {
              throw e;
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Build failed");
        setBuildSteps(prev => prev.map(s =>
          s.status === "active" ? { ...s, status: "error" as const } : s
        ));
      }
    } finally {
      setIsBuilding(false);
      setImproveInput("");
    }
  }, [isBuilding, lang, conversationHistory, files, activeFile]);

  // ── Download ZIP ─────────────────────────────────────────────────────────────
  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم تحميل المشروع كـ ZIP!" : "Project downloaded as ZIP!");
  };

  // ── Copy Code ────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    const content = files[activeFile]?.content || streamingContent;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(lang === "ar" ? "تم النسخ!" : "Copied!");
  };

  const hasResult = files.length > 0;
  const isStreaming = isBuilding && streamingContent.length > 0;
  const currentFile = files[activeFile];
  const previewContent = currentFile?.language === "html" ? currentFile.content : null;

  return (
    <div className="flex flex-col h-full bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Top Input Bar ── */}
      <div className="shrink-0 border-b border-border bg-card/30 px-3 py-2.5">
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <div className={cn(
            "flex-1 bg-background border-2 rounded-xl transition-all",
            isBuilding ? "border-primary/40" : "border-border focus-within:border-primary/50"
          )}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
                  e.preventDefault();
                  handleBuild(prompt);
                }
              }}
              placeholder={lang === "ar"
                ? "صف مشروعك... مثال: ابني متجر عطور فاخر مع سلة تسوق وصفحة دفع"
                : "Describe your project... e.g. Build a luxury perfume store with cart and checkout"}
              className="w-full bg-transparent px-3 pt-2.5 pb-1 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
              style={{ minHeight: "44px", maxHeight: "120px", direction: isRTL ? "rtl" : "ltr" }}
              rows={1}
              disabled={isBuilding}
            />
            <div className="flex items-center gap-1 px-2 pb-1.5">
              <span className="text-xs text-muted-foreground/40">
                {lang === "ar" ? "موقع • متجر • لعبة • بوت • لوحة تحكم • full-stack" : "website • store • game • bot • dashboard • full-stack"}
              </span>
            </div>
          </div>
          <button
            onClick={() => isBuilding ? abortRef.current?.abort() : handleBuild(prompt)}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
              isBuilding
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : prompt.trim()
                  ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                  : "bg-muted text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            {isBuilding
              ? <X className="w-5 h-5" />
              : <Wand2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Build Steps (while building) ── */}
        {isBuilding && (
          <div className="w-56 shrink-0 border-e border-border bg-card/20 flex flex-col overflow-y-auto hidden md:flex">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary">
                  {lang === "ar" ? "جاري البناء..." : "Building..."}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-1">
              {buildSteps.map((step, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-lg transition-all",
                  step.status === "active" && "bg-primary/10 border border-primary/20",
                )}>
                  <div className="shrink-0">
                    {step.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />}
                    {step.status === "active" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {step.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {step.status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <span className={cn(
                    "text-xs",
                    step.status === "active" ? "text-primary font-medium" :
                    step.status === "done" ? "text-green-400/80" :
                    step.status === "error" ? "text-red-400" : "text-muted-foreground/60"
                  )}>
                    {lang === "ar" ? step.labelAr : step.label}
                  </span>
                </div>
              ))}
            </div>
            {streamingContent && (
              <div className="p-3 border-t border-border mt-auto">
                <div className="text-xs text-muted-foreground/60 text-center">
                  {streamingContent.length.toLocaleString()} {lang === "ar" ? "حرف" : "chars"}
                </div>
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Right: Preview / Code / Streaming ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Empty state */}
          {!hasResult && !isBuilding && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-5 glow-primary">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {lang === "ar" ? "ابنِ مشروعك الاحترافي" : "Build Your Professional Project"}
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mb-8 leading-relaxed">
                {lang === "ar"
                  ? "اكتب وصف مشروعك أعلاه. الذكاء الاصطناعي سيبني كوداً احترافياً كاملاً مع معاينة مباشرة وإمكانية التحميل."
                  : "Describe your project above. AI will build complete professional code with live preview and download."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {[
                  { icon: "🌐", label: lang === "ar" ? "موقع شركة" : "Company Site", p: lang === "ar" ? "ابني موقع شركة تقنية عصري مع Hero section وقسم خدمات وتواصل" : "Build a modern tech company website with hero, services and contact" },
                  { icon: "🛒", label: lang === "ar" ? "متجر فاخر" : "Luxury Store", p: lang === "ar" ? "ابني متجر عطور فاخر بتصميم أسود ذهبي مع سلة تسوق تفاعلية" : "Build a luxury perfume store with black gold design and interactive cart" },
                  { icon: "🎮", label: lang === "ar" ? "لعبة ويب" : "Web Game", p: lang === "ar" ? "اصنع لعبة Snake احترافية بـ HTML5 Canvas مع نقاط ومستويات" : "Make a professional Snake game with HTML5 Canvas, score and levels" },
                  { icon: "📊", label: lang === "ar" ? "لوحة تحكم" : "Dashboard", p: lang === "ar" ? "ابني لوحة تحكم احترافية مع رسوم بيانية وإحصائيات وجداول" : "Build a professional dashboard with charts, stats and tables" },
                  { icon: "🤖", label: lang === "ar" ? "بوت تليغرام" : "Telegram Bot", p: lang === "ar" ? "اصنع بوت تليغرام لإدارة الحجوزات مع قوائم تفاعلية" : "Create a Telegram booking bot with interactive menus" },
                  { icon: "⚡", label: lang === "ar" ? "Full-stack" : "Full-stack", p: lang === "ar" ? "ابني تطبيق full-stack كامل مع Frontend وBackend وقاعدة بيانات" : "Build a complete full-stack app with frontend, backend and database" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(item.p)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Streaming state */}
          {isBuilding && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="shrink-0 border-b border-border bg-card/30 px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-primary font-medium">
                  {lang === "ar" ? "جاري البناء..." : "Building..."}
                </span>
                <span className="text-xs text-muted-foreground ms-auto">
                  {streamingContent.length > 0 && `${streamingContent.length.toLocaleString()} chars`}
                </span>
              </div>
              {/* Live streaming code */}
              <div className="flex-1 overflow-auto bg-gray-950 p-4">
                <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {streamingContent}
                  <span className="animate-pulse">▌</span>
                </pre>
              </div>
            </div>
          )}

          {/* Result state */}
          {hasResult && !isBuilding && (
            <>
              {/* Toolbar */}
              <div className="shrink-0 border-b border-border bg-card/30 px-3 py-2 flex items-center gap-2 flex-wrap">
                {/* View Toggle */}
                <div className="flex bg-background rounded-lg p-0.5 border border-border">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all", viewMode === "preview" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Eye className="w-3 h-3" />
                    {lang === "ar" ? "معاينة" : "Preview"}
                  </button>
                  <button
                    onClick={() => setViewMode("code")}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all", viewMode === "code" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Code2 className="w-3 h-3" />
                    {lang === "ar" ? "الكود" : "Code"}
                  </button>
                </div>

                {/* Device Toggle */}
                {viewMode === "preview" && previewContent && (
                  <div className="flex bg-background rounded-lg p-0.5 border border-border">
                    {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
                      <button key={d} onClick={() => setDevice(d)} className={cn("p-1 rounded-md transition-all", device === d ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                        {d === "desktop" && <Monitor className="w-3 h-3" />}
                        {d === "tablet" && <Tablet className="w-3 h-3" />}
                        {d === "mobile" && <Smartphone className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* File tabs */}
                {files.length > 1 && (
                  <div className="flex gap-1 overflow-x-auto">
                    {files.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFile(i)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all",
                          activeFile === i ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {fileIcons[f.language] || <FileCode2 className="w-3 h-3" />}
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-all">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {lang === "ar" ? "نسخ" : "Copy"}
                </button>
                <button onClick={handleDownloadZip} className="flex items-center gap-1 px-2.5 py-1 rounded-lg gradient-primary text-white text-xs transition-all hover:opacity-90">
                  <Download className="w-3 h-3" />
                  ZIP
                </button>
              </div>

              {/* Preview / Code */}
              <div className="flex-1 overflow-hidden">
                {viewMode === "preview" && previewContent ? (
                  <div className="h-full flex items-start justify-center bg-muted/20 p-3 overflow-auto">
                    <div
                      className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
                      style={{ width: deviceWidths[device], maxWidth: "100%", minHeight: "500px" }}
                    >
                      <iframe
                        srcDoc={previewContent}
                        className="w-full border-0"
                        style={{ height: "600px" }}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        title="Live Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-auto bg-gray-950">
                    <pre className="p-4 text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed min-h-full">
                      {currentFile?.content || ""}
                    </pre>
                  </div>
                )}
              </div>

              {/* ── Improve Bar (Multi-turn) ── */}
              <div className="shrink-0 border-t border-border bg-card/30 p-2.5">
                <div className="flex gap-2 max-w-4xl mx-auto">
                  <input
                    value={improveInput}
                    onChange={e => setImproveInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleBuild(improveInput, true); }}
                    placeholder={lang === "ar"
                      ? "اطلب تعديلاً... مثال: غيّر اللون الرئيسي للأزرق، أضف قسم شهادات"
                      : "Request a change... e.g. Change primary color to blue, add testimonials section"}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
                    disabled={isBuilding}
                  />
                  <button
                    onClick={() => handleBuild(improveInput, true)}
                    disabled={!improveInput.trim() || isBuilding}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
                      improveInput.trim() && !isBuilding
                        ? "gradient-primary text-white hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Wand2 className="w-4 h-4" />
                    {lang === "ar" ? "تعديل" : "Improve"}
                  </button>
                </div>
                {conversationHistory.length > 0 && (
                  <p className="text-xs text-muted-foreground/40 text-center mt-1.5">
                    {lang === "ar"
                      ? `${conversationHistory.length} تعديل سابق • المشروع يتذكر السياق`
                      : `${conversationHistory.length} previous edit • Project remembers context`}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
