import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "@/contexts/LangContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  Wand2, ChevronDown, ChevronRight, CheckCircle2, Loader2,
  AlertCircle, Clock, Download, Eye, Code2, Monitor, Tablet,
  Smartphone, Copy, Check, MessageSquare, Send, X, Sparkles,
  FolderOpen, FileCode2, Database, FileText, Zap, Play,
  RefreshCw, ArrowUp, Plus, Brain, Palette, Globe, Shield,
  Bot, Gamepad2, CreditCard, BarChart3, Search, Smartphone as Mobile,
  TestTube, BookOpen, Rocket, Settings, MessageCircle
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanStep {
  id: string;
  agentId: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  estimatedTime: string;
  status: "pending" | "running" | "done" | "error";
  output?: string;
  files?: { name: string; content: string; language: string }[];
  expanded: boolean;
  streamingText?: string;
  thinkingText?: string;
  isThinking?: boolean;
  hadThinking?: boolean;
}

interface ProjectMemory {
  prompt: string;
  plan: PlanStep[];
  allFiles: { name: string; content: string; language: string }[];
  summary: string;
  createdAt: number;
}

interface QAMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

type ViewMode = "preview" | "code";
type Device = "desktop" | "tablet" | "mobile";

const AGENT_ICONS: Record<string, React.ReactNode> = {
  analyzer: <Brain className="w-4 h-4" />,
  designer: <Palette className="w-4 h-4" />,
  frontend: <Globe className="w-4 h-4" />,
  backend: <Settings className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  content: <FileText className="w-4 h-4" />,
  bot: <Bot className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  seo: <Search className="w-4 h-4" />,
  mobile: <Mobile className="w-4 h-4" />,
  tester: <TestTube className="w-4 h-4" />,
  docs: <BookOpen className="w-4 h-4" />,
  deployer: <Rocket className="w-4 h-4" />,
  optimizer: <RefreshCw className="w-4 h-4" />,
  memory: <Brain className="w-4 h-4" />,
};

const AGENT_COLORS: Record<string, string> = {
  analyzer: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  designer: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  frontend: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  backend: "text-green-400 bg-green-500/10 border-green-500/20",
  database: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  security: "text-red-400 bg-red-500/10 border-red-500/20",
  content: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  bot: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  game: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  payment: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  analytics: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  seo: "text-lime-400 bg-lime-500/10 border-lime-500/20",
  mobile: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  tester: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  docs: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  deployer: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  optimizer: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  memory: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AgentBuilderPage() {
  const { lang, isRTL } = useLang();
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [projectMemory, setProjectMemory] = useState<ProjectMemory | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "preview" | "files" | "chat">("plan");
  const [selectedFile, setSelectedFile] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [copied, setCopied] = useState(false);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const qaEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [prompt]);

  // Load prompt from Home
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPrompt");
    if (pending) { sessionStorage.removeItem("pendingPrompt"); setPrompt(pending); }
  }, []);

  // Scroll QA to bottom
  useEffect(() => { qaEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [qaMessages]);

  // ── Step 1: Generate Plan ────────────────────────────────────────────────────
  const handleGeneratePlan = useCallback(async () => {
    if (!prompt.trim() || isPlanning) return;
    setIsPlanning(true);
    setPlan([]);
    setProjectMemory(null);
    setQaMessages([]);
    setActiveTab("plan");
    try {
      const res = await fetch("/api/agents/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lang }),
      });
      const data = await res.json();
      const steps: PlanStep[] = data.plan.map((s: any) => ({ ...s, status: "pending", expanded: false }));
      setPlan(steps);
      toast.success(lang === "ar" ? `✅ خطة العمل جاهزة! ${steps.length} خطوات` : `✅ Work plan ready! ${steps.length} steps`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPlanning(false);
    }
  }, [prompt, lang, isPlanning]);

  // ── Step 2: Execute All Steps ────────────────────────────────────────────────
  const handleExecuteAll = useCallback(async () => {
    if (plan.length === 0 || isExecuting) return;
    setIsExecuting(true);
    setActiveTab("plan");
    const allFiles: { name: string; content: string; language: string }[] = [];
    let projectContext = "";

    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      setCurrentStepIndex(i);

      // Mark as running
      setPlan(prev => prev.map((s, j) => j === i ? { ...s, status: "running", expanded: true, streamingText: "" } : s));

      // Auto-scroll to active step
      document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/agents/execute-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt, stepId: step.id, agentId: step.agentId,
            lang, projectContext: projectContext.slice(0, 5000),
            previousFiles: allFiles.slice(-5).map(f => ({ name: f.name, content: f.content.slice(0, 2000) })),
          }),
          signal: abortRef.current.signal,
        });

        const reader = res.body?.getReader();
        if (!reader) continue;
        const decoder = new TextDecoder();
        let stepContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "chunk") {
                stepContent += parsed.content;
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, streamingText: stepContent } : s));
              } else if (parsed.type === "done") {
              } else if (parsed.type === "thinking_start") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, isThinking: true, thinkingText: "" } : s));
              } else if (parsed.type === "thinking") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, thinkingText: (s.thinkingText || "") + parsed.content } : s));
              } else if (parsed.type === "thinking_done") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, isThinking: false } : s));
              } else if (parsed.type === "done") {
                const stepFiles = parsed.files || [];
                allFiles.push(...stepFiles);
                projectContext += `\n\n=== ${step.agentId} output ===\n${stepContent.slice(0, 1000)}`;
                setPlan(prev => prev.map((s, j) => j === i ? {
                  ...s, status: "done", output: stepContent,
                  files: stepFiles, streamingText: undefined, expanded: false,
                } : s));
              }
            } catch {}
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setPlan(prev => prev.map((s, j) => j === i ? { ...s, status: "error", expanded: true } : s));
        }
      }

      // Small delay between steps
      await new Promise(r => setTimeout(r, 500));
    }

    // Build project memory
    const memory: ProjectMemory = {
      prompt, plan,
      allFiles: deduplicateFiles(allFiles),
      summary: `مشروع: ${prompt}\nالوكلاء المستخدمة: ${plan.map(s => s.agentId).join(", ")}\nالملفات: ${allFiles.map(f => f.name).join(", ")}`,
      createdAt: Date.now(),
    };
    setProjectMemory(memory);
    setCurrentStepIndex(-1);
    setIsExecuting(false);
    setActiveTab("preview");
    toast.success(lang === "ar" ? "🎉 المشروع مكتمل! يمكنك معاينته وتحميله" : "🎉 Project complete! You can preview and download it");
  }, [plan, prompt, lang, isExecuting]);

  // ── Execute single step manually ─────────────────────────────────────────────
  const handleExecuteStep = useCallback(async (stepIndex: number) => {
    const step = plan[stepIndex];
    if (!step || step.status === "running") return;
    setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, status: "running", streamingText: "" } : s));
    try {
      const res = await fetch("/api/agents/execute-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, stepId: step.id, agentId: step.agentId, lang }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === "thinking_start") { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, isThinking: true, thinkingText: "" } : s)); }
            else if (parsed.type === "thinking") { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, thinkingText: (s.thinkingText || "") + parsed.content } : s)); }
            else if (parsed.type === "thinking_done") { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, isThinking: false } : s)); }
            else if (parsed.type === "chunk") { content += parsed.content; setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, streamingText: content } : s)); }
            else if (parsed.type === "done") { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, status: "done", output: content, files: parsed.files, streamingText: undefined, hadThinking: parsed.hadThinking } : s)); }
          } catch {}
        }
      }
    } catch { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, status: "error" } : s)); }
  }, [plan, prompt, lang]);

  // ── Q&A about project ────────────────────────────────────────────────────────
  const handleAskProject = useCallback(async () => {
    if (!qaInput.trim() || isAsking || !projectMemory) return;
    const question = qaInput;
    setQaInput("");
    setIsAsking(true);
    setQaMessages(prev => [...prev, { role: "user", content: question }]);
    setQaMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);
    try {
      const res = await fetch("/api/agents/ask-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, projectMemory: projectMemory.summary + "\n\nالملفات:\n" + projectMemory.allFiles.map(f => `${f.name}:\n${f.content.slice(0, 500)}`).join("\n\n"), lang }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === "chunk") { answer += parsed.content; setQaMessages(prev => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: "assistant", content: answer, streaming: true }; return msgs; }); }
            else if (parsed.type === "done") { setQaMessages(prev => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: "assistant", content: answer, streaming: false }; return msgs; }); }
          } catch {}
        }
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setIsAsking(false); }
  }, [qaInput, isAsking, projectMemory, lang]);

  // ── Download ZIP ─────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!projectMemory?.allFiles.length) return;
    const zip = new JSZip();
    projectMemory.allFiles.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "project.zip"; a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم تحميل المشروع!" : "Project downloaded!");
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const allFiles = projectMemory?.allFiles || [];
  const htmlFile = allFiles.find(f => f.language === "html");
  const completedSteps = plan.filter(s => s.status === "done").length;
  const totalSteps = plan.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Top Input ── */}
      <div className="shrink-0 border-b border-border bg-card/20 px-3 py-2.5">
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <div className={cn(
            "flex-1 bg-background border-2 rounded-xl transition-all",
            isPlanning || isExecuting ? "border-primary/40" : "border-border focus-within:border-primary/50"
          )}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleGeneratePlan(); } }}
              placeholder={lang === "ar"
                ? "صف مشروعك بالتفصيل... مثال: ابني متجر عطور فاخر مع سلة تسوق وبوت تليغرام ونظام دفع"
                : "Describe your project in detail... e.g. Build a luxury perfume store with cart, Telegram bot and payment system"}
              className="w-full bg-transparent px-3 pt-2.5 pb-1 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
              style={{ minHeight: "44px", maxHeight: "120px", direction: isRTL ? "rtl" : "ltr" }}
              rows={1}
              disabled={isPlanning || isExecuting}
            />
            <div className="px-3 pb-1.5 text-xs text-muted-foreground/40">
              {lang === "ar" ? "موقع • متجر • لعبة • بوت • لوحة تحكم • full-stack" : "website • store • game • bot • dashboard • full-stack"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleGeneratePlan}
              disabled={!prompt.trim() || isPlanning || isExecuting}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                prompt.trim() && !isPlanning && !isExecuting
                  ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                  : "bg-muted text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {isPlanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {lang === "ar" ? "خطة" : "Plan"}
            </button>
            <button
              onClick={handleExecuteAll}
              disabled={plan.length === 0 || isExecuting || isPlanning}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                plan.length > 0 && !isExecuting && !isPlanning
                  ? "gradient-primary text-white shadow-md hover:opacity-90 active:scale-95"
                  : "bg-muted text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {lang === "ar" ? "تنفيذ" : "Run"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {plan.length > 0 && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {completedSteps}/{totalSteps} {lang === "ar" ? "مكتمل" : "done"}
            </span>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      {plan.length > 0 && (
        <div className="shrink-0 border-b border-border bg-card/10 px-3">
          <div className="flex gap-0 max-w-4xl mx-auto">
            {[
              { id: "plan", icon: <Zap className="w-3.5 h-3.5" />, labelAr: "خطة العمل", labelEn: "Work Plan" },
              { id: "preview", icon: <Eye className="w-3.5 h-3.5" />, labelAr: "المعاينة", labelEn: "Preview", disabled: !htmlFile },
              { id: "files", icon: <FolderOpen className="w-3.5 h-3.5" />, labelAr: "الملفات", labelEn: "Files", disabled: allFiles.length === 0 },
              { id: "chat", icon: <MessageCircle className="w-3.5 h-3.5" />, labelAr: "اسأل عن المشروع", labelEn: "Ask Project", disabled: !projectMemory },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all",
                  activeTab === tab.id
                    ? "border-primary text-primary font-medium"
                    : tab.disabled
                      ? "border-transparent text-muted-foreground/30 cursor-not-allowed"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{lang === "ar" ? tab.labelAr : tab.labelEn}</span>
                {tab.id === "files" && allFiles.length > 0 && (
                  <span className="bg-primary/20 text-primary text-xs px-1 rounded">{allFiles.length}</span>
                )}
              </button>
            ))}
            {projectMemory && (
              <button onClick={handleDownload} className="ms-auto flex items-center gap-1 px-3 py-2 text-xs gradient-primary text-white rounded-lg my-1">
                <Download className="w-3 h-3" />
                ZIP
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">

        {/* Empty state */}
        {plan.length === 0 && !isPlanning && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-5 glow-primary">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {lang === "ar" ? "18 وكيل متخصص في خدمتك" : "18 Specialized Agents at Your Service"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-8 leading-relaxed">
              {lang === "ar"
                ? "اكتب وصف مشروعك ← اضغط \"خطة\" لرؤية خطة العمل ← اضغط \"تنفيذ\" لبدء البناء الاحترافي"
                : "Describe your project ← Press \"Plan\" to see work plan ← Press \"Run\" to start professional building"}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-2xl">
              {[
                { icon: "🧠", label: lang === "ar" ? "تحليل" : "Analysis" },
                { icon: "🎨", label: lang === "ar" ? "تصميم" : "Design" },
                { icon: "💻", label: lang === "ar" ? "Frontend" : "Frontend" },
                { icon: "⚙️", label: lang === "ar" ? "Backend" : "Backend" },
                { icon: "🗄️", label: lang === "ar" ? "قاعدة بيانات" : "Database" },
                { icon: "🔐", label: lang === "ar" ? "أمان" : "Security" },
                { icon: "📝", label: lang === "ar" ? "محتوى" : "Content" },
                { icon: "🤖", label: lang === "ar" ? "بوتات" : "Bots" },
                { icon: "🎮", label: lang === "ar" ? "ألعاب" : "Games" },
                { icon: "💳", label: lang === "ar" ? "دفع" : "Payment" },
                { icon: "🔍", label: "SEO" },
                { icon: "📱", label: lang === "ar" ? "موبايل" : "Mobile" },
                { icon: "🧪", label: lang === "ar" ? "اختبار" : "Testing" },
                { icon: "📚", label: lang === "ar" ? "توثيق" : "Docs" },
                { icon: "🚀", label: lang === "ar" ? "نشر" : "Deploy" },
                { icon: "🔄", label: lang === "ar" ? "تحسين" : "Optimize" },
                { icon: "📊", label: lang === "ar" ? "تحليلات" : "Analytics" },
                { icon: "💬", label: lang === "ar" ? "ذاكرة" : "Memory" },
              ].map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border text-center">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs text-muted-foreground">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planning spinner */}
        {isPlanning && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{lang === "ar" ? "جاري إنشاء خطة العمل..." : "Generating work plan..."}</p>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "الوكيل يحلل متطلباتك ويضع الخطة المثلى" : "Agent is analyzing your requirements and creating the optimal plan"}</p>
          </div>
        )}

        {/* ── Plan Tab ── */}
        {activeTab === "plan" && plan.length > 0 && !isPlanning && (
          <div className="h-full overflow-y-auto p-3">
            <div className="max-w-3xl mx-auto space-y-2">
              {plan.map((step, i) => (
                <div
                  key={step.id}
                  id={`step-${step.id}`}
                  className={cn(
                    "rounded-xl border transition-all duration-300",
                    step.status === "running" && "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10",
                    step.status === "done" && "border-green-500/20 bg-green-500/5",
                    step.status === "error" && "border-red-500/20 bg-red-500/5",
                    step.status === "pending" && "border-border bg-card/50",
                  )}
                >
                  {/* Step Header */}
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={() => setPlan(prev => prev.map((s, j) => j === i ? { ...s, expanded: !s.expanded } : s))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setPlan(prev => prev.map((s, j) => j === i ? { ...s, expanded: !s.expanded } : s)); }}
                  >
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {step.status === "pending" && (
                        <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground/50">{i + 1}</div>
                      )}
                      {step.status === "running" && <Loader2 className="w-7 h-7 animate-spin text-primary" />}
                      {step.status === "done" && <CheckCircle2 className="w-7 h-7 text-green-400" />}
                      {step.status === "error" && <AlertCircle className="w-7 h-7 text-red-400" />}
                    </div>

                    {/* Agent Badge */}
                    <div className={cn("shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium", AGENT_COLORS[step.agentId] || "text-muted-foreground bg-muted border-border")}>
                      {AGENT_ICONS[step.agentId]}
                      <span className="hidden sm:inline">{step.agentId}</span>
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold truncate", step.status === "running" ? "text-primary" : step.status === "done" ? "text-green-400" : "text-foreground")}>
                        {lang === "ar" ? step.titleAr : step.titleEn}
                      </p>
                      <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                        {lang === "ar" ? step.descAr : step.descEn}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 flex items-center gap-2">
                      {step.status === "pending" && (
                        <button
                          onClick={e => { e.stopPropagation(); handleExecuteStep(i); }}
                          className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        >
                          {lang === "ar" ? "تنفيذ" : "Run"}
                        </button>
                      )}
                      {step.status === "done" && step.files && step.files.length > 0 && (
                        <span className="text-xs text-green-400/70">{step.files.length} {lang === "ar" ? "ملف" : "files"}</span>
                      )}
                      {step.status === "running" && step.streamingText && (
                        <span className="text-xs text-primary/70">{step.streamingText.length} chars</span>
                      )}
                      {step.status === "running" && step.isThinking && (
                        <span className="text-xs text-violet-400/80 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                          {lang === "ar" ? "يفكر..." : "thinking..."}
                        </span>
                      )}
                      {step.status === "done" && step.hadThinking && (
                        <span className="text-xs text-violet-400/50">🧠</span>
                      )}
                      {step.expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Step Content (Accordion) */}
                  {step.expanded && (
                    <div className="px-4 pb-4 border-t border-border/50 mt-0">
                      {step.status === "running" && step.streamingText && (
                        <div className="mt-3 bg-gray-950 rounded-xl p-3 max-h-64 overflow-auto">
                          <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                            {step.streamingText}<span className="animate-pulse">▌</span>
                          </pre>
                        </div>
                      )}
                      {/* Thinking phase display */}
                      {step.status === "running" && step.isThinking && (
                        <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-xs text-violet-400 font-medium">
                              {lang === "ar" ? "🧠 يفكر ويحلل..." : "🧠 Thinking & analyzing..."}
                            </span>
                          </div>
                          {step.thinkingText && (
                            <div className="max-h-32 overflow-auto">
                              <p className="text-xs text-violet-300/70 leading-relaxed font-mono whitespace-pre-wrap">
                                {step.thinkingText.slice(-500)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {step.status === "running" && !step.isThinking && step.streamingText && (
                        <div className="mt-3 bg-gray-950 rounded-xl p-3 max-h-64 overflow-auto">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-green-400/70">
                              {lang === "ar" ? "يكتب الكود..." : "Writing code..."}
                            </span>
                          </div>
                          <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                            {step.streamingText}<span className="animate-pulse">▌</span>
                          </pre>
                        </div>
                      )}
                      {step.status === "done" && step.output && (
                        <div className="mt-3 space-y-2">
                          <div className="bg-gray-950 rounded-xl p-3 max-h-48 overflow-auto">
                            <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{step.output.slice(0, 2000)}{step.output.length > 2000 ? "\n..." : ""}</pre>
                          </div>
                          {step.files && step.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {step.files.map((f, fi) => (
                                <span key={fi} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                  <FileCode2 className="w-3 h-3" />{f.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {step.status === "pending" && (
                        <div className="mt-3 text-sm text-muted-foreground/60 italic">
                          {lang === "ar" ? step.descAr : step.descEn}
                        </div>
                      )}
                      {step.status === "error" && (
                        <div className="mt-3 text-sm text-red-400">
                          {lang === "ar" ? "حدث خطأ في هذه الخطوة. اضغط \"تنفيذ\" لإعادة المحاولة." : "An error occurred. Click \"Run\" to retry."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Preview Tab ── */}
        {activeTab === "preview" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="shrink-0 border-b border-border bg-card/20 px-3 py-2 flex items-center gap-2 flex-wrap">
              <div className="flex bg-background rounded-lg p-0.5 border border-border">
                {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
                  <button key={d} onClick={() => setDevice(d)} className={cn("p-1.5 rounded-md transition-all", device === d ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                    {d === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                    {d === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                    {d === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              {!htmlFile && <span className="text-xs text-muted-foreground">{lang === "ar" ? "لا يوجد ملف HTML للمعاينة" : "No HTML file for preview"}</span>}
            </div>
            <div className="flex-1 overflow-auto bg-muted/20 flex items-start justify-center p-4">
              {htmlFile ? (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
                  style={{ width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px", maxWidth: "100%", minHeight: "500px" }}>
                  <iframe srcDoc={htmlFile.content} className="w-full border-0" style={{ height: "600px" }} sandbox="allow-scripts allow-same-origin allow-forms" title="Preview" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-20">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{lang === "ar" ? "المعاينة ستظهر بعد اكتمال البناء" : "Preview will appear after build completes"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Files Tab ── */}
        {activeTab === "files" && (
          <div className="h-full flex overflow-hidden">
            <div className="w-44 shrink-0 border-e border-border bg-card/20 overflow-y-auto">
              <div className="p-2 space-y-1">
                {allFiles.map((f, i) => (
                  <button key={i} onClick={() => setSelectedFile(i)} className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-start transition-all", selectedFile === i ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}>
                    <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-950">
              {allFiles[selectedFile] && (
                <pre className="p-4 text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
                  {allFiles[selectedFile].content}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* ── Chat / Q&A Tab ── */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {qaMessages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground/60">
                    {lang === "ar" ? "اسأل أي شيء عن مشروعك..." : "Ask anything about your project..."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {(lang === "ar" ? [
                      "ما الألوان المستخدمة؟",
                      "كيف أضيف منتجاً جديداً؟",
                      "ما الـ API endpoints؟",
                      "كيف أنشر المشروع؟",
                    ] : [
                      "What colors are used?",
                      "How to add a new product?",
                      "What are the API endpoints?",
                      "How to deploy the project?",
                    ]).map((q, i) => (
                      <button key={i} onClick={() => setQaInput(q)} className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {qaMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed", msg.role === "user" ? "gradient-primary text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm")}>
                    {msg.content || (msg.streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "")}
                    {msg.streaming && msg.content && <span className="animate-pulse">▌</span>}
                  </div>
                </div>
              ))}
              <div ref={qaEndRef} />
            </div>
            <div className="shrink-0 border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={qaInput}
                  onChange={e => setQaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAskProject(); }}
                  placeholder={lang === "ar" ? "اسأل عن مشروعك..." : "Ask about your project..."}
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
                  disabled={isAsking}
                />
                <button
                  onClick={handleAskProject}
                  disabled={!qaInput.trim() || isAsking}
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", qaInput.trim() && !isAsking ? "gradient-primary text-white" : "bg-muted text-muted-foreground/40")}
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function deduplicateFiles(files: { name: string; content: string; language: string }[]) {
  const seen = new Set<string>();
  return files.filter(f => {
    if (seen.has(f.name)) return false;
    seen.add(f.name);
    return true;
  });
}
