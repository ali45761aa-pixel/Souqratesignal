import { useState, useRef, useEffect, useCallback } from "react";
import { useMemo } from "react";
import { useLang } from "@/contexts/LangContext";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
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
  , Target, Layers, Lightbulb, GitBranch, Microscope
} from "lucide-react";
import { ExternalLink, Github, Upload, Server, Maximize2, Minimize2, Terminal, History, RotateCcw, DollarSign, Wifi, WifiOff, Wrench, Code2 as ReactIcon, FileCode, Zap as BotIcon, Layout, Columns2, Share2 } from "lucide-react";

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
  errorMessage?: string;
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

interface ConsoleMessage {
  type: "log" | "error" | "warn" | "info";
  message: string;
  timestamp: number;
}

interface ProjectVersion {
  id: string;
  prompt: string;
  files: { name: string; content: string; language: string }[];
  createdAt: number;
  label: string;
}

interface ObservabilityEntry {
  stepId: string;
  agentId: string;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
  costUSD: number;
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
  reviewer: <Search className="w-4 h-4" />,
  auditor: <Shield className="w-4 h-4" />,
  strategy: <Target className="w-4 h-4" />,
  ux: <Layers className="w-4 h-4" />,
  brand: <Palette className="w-4 h-4" />,
  solutions: <Lightbulb className="w-4 h-4" />,
  architect: <GitBranch className="w-4 h-4" />,
  research: <Microscope className="w-4 h-4" />,
  innovation: <Zap className="w-4 h-4" />,
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
  reviewer: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  auditor: "text-red-400 bg-red-500/10 border-red-500/20",
  strategy: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ux: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  brand: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  solutions: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  architect: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  research: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  innovation: "text-orange-400 bg-orange-500/10 border-orange-500/20",
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
  const [activeTab, setActiveTab] = useState<"plan" | "preview" | "files" | "chat" | "console" | "history" | "observe">("plan");
  const [selectedFile, setSelectedFile] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [copied, setCopied] = useState(false);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveHtmlFile, setLiveHtmlFile] = useState<string | null>(null);
  const allFilesRef = useRef<{ name: string; content: string; language: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const qaEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // New feature states
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [observability, setObservability] = useState<ObservabilityEntry[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeployMenu, setShowDeployMenu] = useState(false);
  const [isStandbyMode, setIsStandbyMode] = useState(false);
  const [standbyPrompt, setStandbyPrompt] = useState("");
  const [isStandbyExecuting, setIsStandbyExecuting] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editedFileContent, setEditedFileContent] = useState("");
  // QA System states
  const [qaReport, setQaReport] = useState<any>(null);
  const [qaAnalysis, setQaAnalysis] = useState<any>(null);
  const [isRunningQA, setIsRunningQA] = useState(false);
  const [qaVisualReport, setQaVisualReport] = useState("");
  const [isRunningVisualQA, setIsRunningVisualQA] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [htmlValidation, setHtmlValidation] = useState<{ score: number; seoScore?: number; perfScore?: number; mobileScore?: number; a11yScore?: number; errors: string[]; warnings: string[]; suggestions?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isHealing, setIsHealing] = useState(false);
  const [healCycles, setHealCycles] = useState(0);
  const [outputFormat, setOutputFormat] = useState<"html" | "react" | "python" | "telegram" | "landing">("html");
  const [isGeneratingFormat, setIsGeneratingFormat] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Total cost calculation
  const totalCost = useMemo(() => observability.reduce((acc, e) => acc + e.costUSD, 0), [observability]);
  const totalTokens = useMemo(() => observability.reduce((acc, e) => acc + e.tokensIn + e.tokensOut, 0), [observability]);

  // Auto-save to localStorage every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (projectMemory) {
        try {
          localStorage.setItem("nexus_autosave", JSON.stringify({
            prompt,
            files: projectMemory.allFiles.slice(0, 5).map(f => ({ name: f.name, content: f.content.slice(0, 5000), language: f.language })),
            savedAt: Date.now(),
          }));
        } catch {}
      }
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [projectMemory, prompt]);

  // Load auto-save on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus_autosave");
      if (saved) {
        const data = JSON.parse(saved);
        const ageMin = (Date.now() - data.savedAt) / 60000;
        if (ageMin < 60 && data.files?.length > 0) {
          // Show restore option
          toast(lang === "ar"
            ? `💾 يوجد مشروع محفوظ من ${Math.round(ageMin)} دقيقة مضت — هل تريد استعادته؟`
            : `💾 Saved project from ${Math.round(ageMin)} min ago — restore it?`,
            {
              action: { label: lang === "ar" ? "استعادة" : "Restore", onClick: () => {
                setProjectMemory({ prompt: data.prompt || "", plan: [], allFiles: data.files, summary: "Auto-saved project", createdAt: data.savedAt });
                const html = data.files.find((f: any) => f.language === "html");
                if (html) { setLiveHtmlFile(html.content); setActiveTab("preview"); }
                toast.success(lang === "ar" ? "✅ تم استعادة المشروع" : "✅ Project restored");
              }},
              duration: 10000,
            }
          );
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Scroll console to bottom
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [consoleMessages]);

  // Self-Healing: auto-fix JS errors (max 3 cycles)
  useEffect(() => {
    const jsErrors = consoleMessages.filter(m => m.type === "error" && m.timestamp > Date.now() - 5000);
    if (jsErrors.length === 0 || isHealing || healCycles >= 3 || !projectMemory) return;
    const currentHtml = projectMemory.allFiles.find(f => f.language === "html")?.content || liveHtmlFile || "";
    if (!currentHtml) return;

    const heal = async () => {
      setIsHealing(true);
      setHealCycles(c => c + 1);
      toast(lang === "ar"
        ? `🔧 تم اكتشاف ${jsErrors.length} خطأ — جاري الإصلاح التلقائي...`
        : `🔧 ${jsErrors.length} error(s) detected — auto-fixing...`,
        { duration: 4000 }
      );
      try {
        const res = await fetch("/api/agents/self-heal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: currentHtml,
            errors: jsErrors.map(e => e.message),
            prompt,
            lang,
          }),
        });
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let fixedHtml = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === "done" && parsed.fixedHtml) {
                fixedHtml = parsed.fixedHtml;
              }
            } catch {}
          }
        }
        if (fixedHtml.length > 100) {
          // Save version inline (can't use saveVersion here due to hook ordering)
          setVersions(prev => [...prev.slice(-9), {
            id: Date.now().toString(),
            prompt: prompt,
            files: [...projectMemory.allFiles],
            createdAt: Date.now(),
            label: `قبل الإصلاح التلقائي #${healCycles}`,
          }]);
          const updatedFiles = projectMemory.allFiles.map(f =>
            f.language === "html" ? { ...f, content: fixedHtml } : f
          );
          setProjectMemory(prev => prev ? { ...prev, allFiles: updatedFiles } : null);
          setLiveHtmlFile(fixedHtml);
          setConsoleMessages([]); // clear errors after fix
          toast.success(lang === "ar" ? "✅ تم إصلاح الأخطاء تلقائياً!" : "✅ Errors auto-fixed!");
        }
      } catch (e: any) {
        toast.error(lang === "ar" ? "فشل الإصلاح التلقائي" : "Auto-fix failed");
      } finally {
        setIsHealing(false);
      }
    };
    // Debounce: wait 3 seconds after error appears before healing
    const timer = setTimeout(heal, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consoleMessages]);

  // Generate Output Format
  const handleGenerateFormat = useCallback(async (format: string) => {
    if (!prompt || isGeneratingFormat) return;
    setIsGeneratingFormat(true);
    setShowFormatMenu(false);
    const currentHtml = projectMemory?.allFiles.find(f => f.language === "html")?.content || "";
    toast(lang === "ar" ? `⚙️ جاري توليد ${format}...` : `⚙️ Generating ${format}...`, { duration: 5000 });
    try {
      const res = await fetch("/api/agents/generate-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, format, existingHtml: currentHtml, lang }),
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
            if (parsed.type === "chunk") content += parsed.content;
            else if (parsed.type === "done" && parsed.files?.length) {
              const newFiles = parsed.files as { name: string; content: string; language: string }[];
              if (projectMemory) {
                saveVersion(projectMemory.allFiles, `قبل تحويل ${format}`);
                const merged = [...projectMemory.allFiles.filter(f => !newFiles.find(nf => nf.name === f.name)), ...newFiles];
                setProjectMemory(prev => prev ? { ...prev, allFiles: merged } : null);
                const htmlF = newFiles.find(f => f.language === "html");
                if (htmlF) setLiveHtmlFile(htmlF.content);
              } else {
                const htmlF = newFiles.find(f => f.language === "html");
                setProjectMemory({ prompt, plan: [], allFiles: newFiles, summary: `${format} project`, createdAt: Date.now() });
                if (htmlF) { setLiveHtmlFile(htmlF.content); setActiveTab("preview"); }
                else setActiveTab("files");
              }
              toast.success(lang === "ar" ? `✅ تم توليد ${format}! ${newFiles.length} ملف` : `✅ ${format} generated! ${newFiles.length} files`);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGeneratingFormat(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, projectMemory, lang, isGeneratingFormat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "Enter") { e.preventDefault(); if (plan.length > 0 && !isExecuting) handleExecuteAll(); else if (prompt.trim()) handleGeneratePlan(); }
        if (e.key === "s") { e.preventDefault(); if (projectMemory) {
          setVersions(prev => [...prev.slice(-9), { id: Date.now().toString(), prompt: prompt, files: [...projectMemory.allFiles], createdAt: Date.now(), label: `v${prev.length + 1} — ${new Date().toLocaleTimeString()}` }]);
          toast.success("✅ Version saved");
        }}
      }
      if (e.key === "Escape") { setIsFullscreen(false); setShowDeployMenu(false); setShowFormatMenu(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, isExecuting, prompt, projectMemory]);

  // Listen for iframe console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "console") {
        setConsoleMessages(prev => [...prev.slice(-200), {
          type: e.data.level || "log",
          message: e.data.message,
          timestamp: Date.now(),
        }]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Inject console interceptor into iframe HTML
  // ── HTML Cleaner — extracts pure HTML from mixed LLM output ──────────────
  const cleanHtmlContent = (raw: string): string => {
    if (!raw) return raw;

    // Step 1: Extract from ```html ... ``` block (highest priority)
    const codeBlockMatch = raw.match(/```html\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1].trim().length > 100) return codeBlockMatch[1].trim();

    // Step 2: Extract from any ``` block containing DOCTYPE
    const anyBlockMatch = raw.match(/```\w*\s*(<!DOCTYPE[\s\S]*?)```/i);
    if (anyBlockMatch && anyBlockMatch[1].trim().length > 100) return anyBlockMatch[1].trim();

    // Step 3: Find DOCTYPE anywhere in text (even if text comes before it)
    const doctypeIdx = raw.indexOf('<!DOCTYPE');
    if (doctypeIdx >= 0) {
      const closeHtml = raw.lastIndexOf('</html>');
      const extracted = closeHtml > doctypeIdx ? raw.slice(doctypeIdx, closeHtml + 7) : raw.slice(doctypeIdx);
      if (extracted.length > 100) return extracted;
    }

    // Step 4: Find <html tag anywhere
    const htmlTagIdx = raw.indexOf('<html');
    if (htmlTagIdx >= 0) {
      const closeHtml = raw.lastIndexOf('</html>');
      const extracted = closeHtml > htmlTagIdx ? raw.slice(htmlTagIdx, closeHtml + 7) : raw.slice(htmlTagIdx);
      if (extracted.length > 100) return extracted;
    }

    // Step 5: Find <head> and reconstruct full document
    const headIdx = raw.indexOf('<head');
    if (headIdx >= 0) {
      const closeHtml = raw.lastIndexOf('</html>');
      if (closeHtml > headIdx) return `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n\${raw.slice(headIdx, closeHtml + 7)}`;
      const bodyClose = raw.lastIndexOf('</body>');
      if (bodyClose > headIdx) return `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n\${raw.slice(headIdx, bodyClose + 7)}\n</html>`;
    }

    // Step 6: Find <body> and wrap it
    const bodyIdx = raw.indexOf('<body');
    if (bodyIdx >= 0) {
      const bodyClose = raw.lastIndexOf('</body>');
      const extracted = bodyClose > bodyIdx ? raw.slice(bodyIdx, bodyClose + 7) : raw.slice(bodyIdx);
      return `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:Cairo,sans-serif;direction:rtl}</style></head>\n\${extracted}\n</html>`;
    }

    // Step 7: CRITICAL — Remove non-HTML text mixed with HTML tags
    // Pattern: text like "div class=..." or ">text<" that appears as plain text
    // If content has many < > characters but no proper HTML structure, it's mixed content
    const tagCount = (raw.match(/</g) || []).length;
    if (tagCount > 5) {
      // Find the first structural HTML tag
      const firstStructural = raw.search(/<(!DOCTYPE|html|head|body|header|nav|section|main|article|div|style|script)/i);
      if (firstStructural >= 0 && firstStructural < raw.length * 0.3) {
        // Reconstruct: everything from first structural tag
        const extracted = raw.slice(firstStructural);
        if (extracted.includes('</body>') || extracted.includes('</div>')) {
          return `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>\n<body>\n\${extracted}\n</body>\n</html>`;
        }
      }
    }

    return raw;
  };

  const injectConsoleInterceptor = (html: string): string => {
    // Sanitize HTML to prevent XSS while keeping scripts for preview
    const sanitized = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ["script", "style", "link", "meta", "head", "body", "html"],
      ADD_ATTR: ["src", "href", "type", "rel", "charset", "name", "content", "defer", "async", "crossorigin", "integrity", "data-target", "data-suffix", "data-aos", "data-aos-delay", "x-data", "x-show", "@click", "@submit"],
    });
    const safeHtml = sanitized || html; // fallback to original if sanitizer removes everything
    // Clean HTML before injecting
    html = cleanHtmlContent(html);
    const interceptor = `<script>
(function() {
  var orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  ['log','error','warn','info'].forEach(function(level) {
    console[level] = function() {
      var msg = Array.from(arguments).map(function(a) { try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); } }).join(' ');
      try { window.parent.postMessage({ type: 'console', level: level, message: msg }, '*'); } catch(e) {}
      orig[level].apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    try { window.parent.postMessage({ type: 'console', level: 'error', message: 'JS Error: ' + e.message + ' (line ' + e.lineno + ')' }, '*'); } catch(ex) {}
  });
})();
</script>`;
    // Image fallback script — fixes broken Unsplash images with beautiful placeholders
    const imageFallback = `<script>
(function() {
  function fixBrokenImages() {
    document.querySelectorAll('img').forEach(function(img) {
      if (!img.dataset.fallbackAdded) {
        img.dataset.fallbackAdded = '1';
        img.addEventListener('error', function() {
          var w = img.width || img.offsetWidth || 800;
          var h = img.height || img.offsetHeight || 500;
          var colors = ['1a1a2e','16213e','0f3460','533483','e94560'];
          var color = colors[Math.floor(Math.random() * colors.length)];
          img.src = 'https://placehold.co/' + w + 'x' + h + '/' + color + '/ffffff?text=Image';
          img.style.objectFit = 'cover';
        });
        // Fix Unsplash URLs that are missing the photo ID
        if (img.src && img.src.includes('unsplash.com') && img.src.includes('[ID]')) {
          var ids = ['1560472354-b33ff0c44a43','1497366216548-37526070297c','1551434678-e076c223a692','1486312338219-ce68d2c6f44d','1519389950473-47ba0277781c'];
          img.src = 'https://images.unsplash.com/photo-' + ids[Math.floor(Math.random()*ids.length)] + '?w=800&q=80&auto=format&fit=crop';
        }
      }
    });
  }
  // Run on load and after DOM changes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixBrokenImages);
  } else { fixBrokenImages(); }
  setTimeout(fixBrokenImages, 1000);
  var obs = new MutationObserver(fixBrokenImages);
  obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
</script>`;
    if (html.includes('<head>')) return html.replace('<head>', '<head>' + interceptor).replace('</body>', imageFallback + '</body>');
    if (html.includes('<body>')) return html.replace('<body>', interceptor + '<body>');
    return interceptor + html;
  };

  // Save version snapshot
  const saveVersion = useCallback((files: { name: string; content: string; language: string }[], label?: string) => {
    const version: ProjectVersion = {
      id: Date.now().toString(),
      prompt,
      files: [...files],
      createdAt: Date.now(),
      label: label || `v${versions.length + 1} — ${new Date().toLocaleTimeString()}`,
    };
    setVersions(prev => [...prev.slice(-9), version]); // keep last 10
    toast.success(lang === "ar" ? `✅ تم حفظ الإصدار ${version.label}` : `✅ Version ${version.label} saved`);
  }, [prompt, versions.length, lang]);

  // Restore version
  const restoreVersion = useCallback((version: ProjectVersion) => {
    setProjectMemory(prev => prev ? { ...prev, allFiles: version.files } : null);
    setLiveHtmlFile(version.files.find(f => f.language === "html")?.content || null);
    toast.success(lang === "ar" ? "✅ تم استعادة الإصدار" : "✅ Version restored");
  }, [lang]);

  // ZIP Import
  const handleImportZip = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/deploy/import-zip", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Import failed");
      const importedFiles = data.files as { name: string; content: string; language: string }[];
      const htmlFile = importedFiles.find(f => f.language === "html");
      setProjectMemory({
        prompt: `Imported project: ${file.name}`,
        plan: [],
        allFiles: importedFiles,
        summary: `Imported ${importedFiles.length} files from ${file.name}`,
        createdAt: Date.now(),
      });
      if (htmlFile) { setLiveHtmlFile(htmlFile.content); setActiveTab("preview"); }
      else setActiveTab("files");
      toast.success(lang === "ar" ? `✅ تم استيراد ${importedFiles.length} ملف` : `✅ Imported ${importedFiles.length} files`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsImporting(false);
    }
  }, [lang]);

  // HTML Validation
  const handleValidateHtml = useCallback(async (html: string) => {
    try {
      const res = await fetch("/api/deploy/validate-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (data.success) setHtmlValidation(data);
    } catch {}
  }, []);

  // Standby Mode — edit without rebuilding
  const handleStandbyEdit = useCallback(async () => {
    if (!standbyPrompt.trim() || !projectMemory || isStandbyExecuting) return;
    setIsStandbyExecuting(true);
    try {
      const currentHtml = projectMemory.allFiles.find(f => f.language === "html")?.content || "";
      const res = await fetch("/api/stream-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are editing an existing project. Current HTML:\n\`\`\`html\n${currentHtml.slice(0, 8000)}\n\`\`\`\n\nUser request: ${standbyPrompt}\n\nReturn the COMPLETE updated HTML file with the requested changes applied. Keep everything else the same.`,
          lang,
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let newHtml = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === "chunk") newHtml += parsed.content;
          } catch {}
        }
      }
      // Extract HTML from response
      const htmlMatch = newHtml.match(/```html\n?([\s\S]*?)```/) || newHtml.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
      const finalHtml = htmlMatch ? (htmlMatch[1] || htmlMatch[0]) : newHtml;
      if (finalHtml.length > 100) {
        // Save current version before editing
        saveVersion(projectMemory.allFiles, `قبل: ${standbyPrompt.slice(0, 30)}`);
        const updatedFiles = projectMemory.allFiles.map(f =>
          f.language === "html" ? { ...f, content: finalHtml } : f
        );
        setProjectMemory(prev => prev ? { ...prev, allFiles: updatedFiles } : null);
        setLiveHtmlFile(finalHtml);
        setActiveTab("preview");
        setStandbyPrompt("");
        toast.success(lang === "ar" ? "✅ تم تطبيق التعديل!" : "✅ Edit applied!");
      } else {
        toast.error(lang === "ar" ? "لم يتمكن الوكيل من تطبيق التعديل" : "Agent couldn't apply the edit");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsStandbyExecuting(false);
    }
  }, [standbyPrompt, projectMemory, lang, isStandbyExecuting, saveVersion]);

  // Deploy to Custom Server
  const handleDeployCustomServer = useCallback(async () => {
    if (!projectMemory?.allFiles.length) return;
    const host = window.prompt(lang === "ar" ? "أدخل عنوان السيرفر (مثال: mysite.com)" : "Enter server host (e.g. mysite.com)");
    if (!host) return;
    const username = window.prompt(lang === "ar" ? "اسم المستخدم (FTP/SSH)" : "Username (FTP/SSH)");
    if (!username) return;
    const password = window.prompt(lang === "ar" ? "كلمة المرور" : "Password");
    if (!password) return;
    const path = window.prompt(lang === "ar" ? "مسار الرفع (افتراضي: /public_html)" : "Upload path (default: /public_html)", "/public_html");
    setIsDeploying(true);
    try {
      const res = await fetch("/api/deploy/custom-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: projectMemory.allFiles,
          serverConfig: { host, username, password, path: path || "/public_html", protocol: "ftp" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === "ar" ? `✅ تعليمات الرفع جاهزة! ${data.instructions.fileCount} ملف` : `✅ Upload instructions ready! ${data.instructions.fileCount} files`);
        // Show instructions
        const steps = data.instructions.steps.join("\n");
        alert(steps);
      } else {
        toast.error(data.error || "Deploy failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeploying(false);
      setShowDeployMenu(false);
    }
  }, [projectMemory, lang]);

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
    setLiveHtmlFile(null);
    allFilesRef.current = [];
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
            previousFiles: (() => {
              // For reviewer/auditor: pass the full HTML file so they can actually fix it
              if (step.agentId === "reviewer" || step.agentId === "auditor") {
                const htmlFiles = allFiles.filter(f =>
                  f.language === "html" &&
                  (f.content.includes("<!DOCTYPE") || f.content.includes("<html") || f.content.includes("<body"))
                );
                const latestHtml = htmlFiles[htmlFiles.length - 1];
                if (latestHtml) {
                  // Pass full HTML + other small files
                  const otherFiles = allFiles.filter(f => f.language !== "html").slice(-3).map(f => ({ name: f.name, content: f.content.slice(0, 1000), language: f.language }));
                  return [{ name: latestHtml.name, content: latestHtml.content, language: "html" }, ...otherFiles];
                }
              }
              return allFiles.slice(-5).map(f => ({ name: f.name, content: f.content.slice(0, 2000), language: f.language }));
            })(),
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
              if (parsed.type === "thinking_start") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, isThinking: true, thinkingText: "" } : s));
              } else if (parsed.type === "thinking") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, thinkingText: (s.thinkingText || "") + parsed.content } : s));
              } else if (parsed.type === "thinking_done") {
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, isThinking: false } : s));
              } else if (parsed.type === "chunk") {
                stepContent += parsed.content;
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, streamingText: stepContent } : s));
              } else if (parsed.type === "error") {
                const errMsg = parsed.message || "خطأ من الخادم";
                setPlan(prev => prev.map((s, j) => j === i ? { ...s, status: "error", errorMessage: errMsg, expanded: true } : s));
              } else if (parsed.type === "done") {
               const stepFiles = parsed.files || [];
               allFiles.push(...stepFiles);
               allFilesRef.current = [...allFilesRef.current, ...stepFiles];
               // Update live preview if HTML file found
               // Only set as HTML preview if content actually contains HTML markup
               const htmlStep = stepFiles.find((f: any) =>
                 f.language === "html" &&
                 (f.content.includes("<!DOCTYPE") || f.content.includes("<html") || f.content.includes("<body"))
               );
               if (htmlStep) { setLiveHtmlFile(htmlStep.content); setActiveTab("preview"); }
               projectContext += `\n\n=== ${step.agentId} output ===\n${stepContent.slice(0, 1000)}`;
               setPlan(prev => prev.map((s, j) => j === i ? {
                 ...s, status: "done", output: stepContent,
                 files: stepFiles, streamingText: undefined, expanded: false, hadThinking: parsed.hadThinking,
               } : s));
                // Real observability from DeepSeek API usage
                if (parsed.usage) {
                  const promptTokens: number = parsed.usage.prompt_tokens ?? 0;
                  const completionTokens: number = parsed.usage.completion_tokens ?? 0;
                  const totalTok: number = parsed.usage.total_tokens ?? (promptTokens + completionTokens);
                  setObservability(prev => [...prev, {
                    stepId: step.id,
                    agentId: step.agentId,
                    tokensIn: promptTokens,
                    tokensOut: completionTokens,
                    durationMs: 0,
                    costUSD: (totalTok / 1000) * 0.00014,
                  }]);
                }
              }
            } catch {}
          }
        }
        // Fallback: if stream ended but step still "running", mark done with content
        setPlan(prev => {
          const s = prev[i];
          if (s && s.status === "running" && stepContent.length > 100) {
            const fallbackFiles = (stepContent.includes("<html") || stepContent.includes("<!DOCTYPE"))
              ? [{ name: "index.html", content: stepContent, language: "html" }] : [];
            if (fallbackFiles.length > 0) {
              allFiles.push(...fallbackFiles);
              allFilesRef.current = [...allFilesRef.current, ...fallbackFiles];
              setLiveHtmlFile(fallbackFiles[0].content);
              setActiveTab("preview");
            }
            return prev.map((st, j) => j === i ? { ...st, status: "done", output: stepContent, files: fallbackFiles, streamingText: undefined, expanded: false } : st);
          }
          return prev;
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          const errMsg = (err as any).message || "خطأ في الاتصال";
          setPlan(prev => prev.map((s, j) => j === i ? { ...s, status: "error", errorMessage: errMsg, expanded: true } : s));
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
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // Update liveHtmlFile with the final best HTML from projectMemory
    const finalHtmlFiles = deduplicateFiles(allFiles).filter(f => f.language === "html");
    if (finalHtmlFiles.length > 0) {
      setLiveHtmlFile(finalHtmlFiles[finalHtmlFiles.length - 1].content);
    }
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
    } catch (err: any) { setPlan(prev => prev.map((s, j) => j === stepIndex ? { ...s, status: "error", errorMessage: err?.message || "حدث خطأ غير متوقع" } : s)); }
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

  // ── Deploy to Vercel ─────────────────────────────────────────────────────────
  const handleDeployVercel = async () => {
    if (!projectMemory?.allFiles.length) return;
    setIsDeploying(true);
    try {
      const projectName = prompt?.slice(0, 30).replace(/[^a-zA-Z0-9؀-ۿ\s]/g, '').trim() || 'nexus-project';
      const res = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: projectMemory.allFiles, projectName }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setDeployedUrl(data.url);
        toast.success(lang === 'ar' ? `✅ تم النشر! ${data.url}` : `✅ Deployed! ${data.url}`);
      } else if (data.configRequired) {
        toast.error(lang === 'ar' ? 'أضف VERCEL_TOKEN من لوحة الإدارة → API Keys' : 'Add VERCEL_TOKEN from Admin → API Keys');
      } else {
        toast.error(data.error || 'Deploy failed');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeploying(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const allFiles = projectMemory?.allFiles || [];
  // Prefer the latest HTML file: from projectMemory, then liveHtmlFile as fallback
  // Only include files that actually contain HTML markup (not server.js misclassified as html)
  const htmlFiles = allFiles.filter(f =>
    f.language === "html" &&
    (f.content.includes("<!DOCTYPE") || f.content.includes("<html") || f.content.includes("<body"))
  );
  const htmlFileContent = htmlFiles.length > 0
    ? htmlFiles[htmlFiles.length - 1].content  // latest from completed project (best quality)
    : liveHtmlFile ?? undefined;                // fallback: live preview or last seen HTML
  const htmlFile = htmlFileContent ? { content: htmlFileContent, name: "index.html", language: "html" } : undefined;
  const completedSteps = plan.filter(s => s.status === "done").length;
  const totalSteps = plan.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Fullscreen Preview Overlay ── */}
      {isFullscreen && htmlFile && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <span className="text-sm text-gray-300 font-medium">{lang === "ar" ? "معاينة ملء الشاشة" : "Fullscreen Preview"}</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-800 rounded-lg p-0.5">
                {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
                  <button key={d} onClick={() => setDevice(d)} className={cn("p-1.5 rounded-md transition-all", device === d ? "bg-primary text-white" : "text-gray-400 hover:text-white")}>
                    {d === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                    {d === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                    {d === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-gray-950">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{ width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px", maxWidth: "100%", minHeight: "100%" }}>
              <iframe ref={iframeRef} srcDoc={injectConsoleInterceptor(htmlFile.content)} className="w-full border-0" style={{ height: "calc(100vh - 80px)" }} sandbox="allow-scripts allow-same-origin allow-forms" title="Fullscreen Preview" />
            </div>
          </div>
        </div>
      )}

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
            <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-2">
              <span className={plan.filter(s => s.status === "error").length > 0 ? "text-red-400" : ""}>
                {completedSteps}/{totalSteps}
              </span>
              {plan.filter(s => s.status === "error").length > 0 && (
                <span className="text-red-400">• {plan.filter(s => s.status === "error").length} {lang === "ar" ? "خطأ" : "err"}</span>
              )}
              {isExecuting && <span className="text-primary font-mono">{Math.floor(elapsedTime/60)}:{String(elapsedTime%60).padStart(2,'0')}</span>}
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
              { id: "chat", icon: <MessageCircle className="w-3.5 h-3.5" />, labelAr: "اسأل عن المشروع", labelEn: "Ask Project", disabled: false },
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
            {/* Extra tabs: Console, History, Observe */}
            {consoleMessages.length > 0 && (
              <button
                onClick={() => setActiveTab("console")}
                className={cn("flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all", activeTab === "console" ? "border-red-400 text-red-400 font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "ar" ? "كونسول" : "Console"}</span>
                {consoleMessages.filter(m => m.type === "error").length > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-1 rounded">{consoleMessages.filter(m => m.type === "error").length}</span>
                )}
              </button>
            )}
            {versions.length > 0 && (
              <button
                onClick={() => setActiveTab("history")}
                className={cn("flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all", activeTab === "history" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "ar" ? "الإصدارات" : "History"}</span>
                <span className="bg-primary/20 text-primary text-xs px-1 rounded">{versions.length}</span>
              </button>
            )}
            {observability.length > 0 && (
              <button
                onClick={() => setActiveTab("observe")}
                className={cn("flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all", activeTab === "observe" ? "border-yellow-400 text-yellow-400 font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">${totalCost.toFixed(4)}</span>
              </button>
            )}
            {/* Action buttons */}
            <div className="ms-auto flex items-center gap-1 py-1">
              {totalTokens > 0 && (
               <span className="text-xs text-muted-foreground/50 px-1 hidden lg:block">{(totalTokens/1000).toFixed(1)}k</span>
             )}
              {htmlFile && (
               <button
                 onClick={() => setIsSplitView(v => !v)}
                  title={lang === "ar" ? "عرض مقسوم (كود + معاينة)" : "Split View (code + preview)"}
                 className={cn(
                   "flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors",
                   isSplitView
                     ? "bg-primary/10 border-primary/30 text-primary"
                     : "bg-card border-border text-muted-foreground hover:text-foreground"
                 )}
               >
                 <Columns2 className="w-3 h-3" />
                 <span className="hidden sm:inline">{lang === "ar" ? "مقسوم" : "Split"}</span>
               </button>
             )}
              {htmlFile && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/preview-share?html=${encodeURIComponent(btoa(unescape(encodeURIComponent(htmlFile.content.slice(0, 50000)))))}`;
                    setShareUrl(url);
                    navigator.clipboard.writeText(url).then(() => { setIsCopiedShare(true); setTimeout(() => setIsCopiedShare(false), 2000); });
                    toast.success(lang === "ar" ? "تم نسخ رابط المشاركة!" : "Share link copied!");
                  }}
                  title={lang === "ar" ? "مشاركة المعاينة" : "Share Preview"}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-card border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  {isCopiedShare ? <Check className="w-3 h-3 text-green-400" /> : <Share2 className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isCopiedShare ? (lang === "ar" ? "تم!" : "Copied!") : (lang === "ar" ? "مشاركة" : "Share")}</span>
                </button>
              )}
              {projectMemory && (
                <button onClick={handleDownload} className="flex items-center gap-1 px-2.5 py-1.5 text-xs gradient-primary text-white rounded-lg">
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">ZIP</span>
                </button>
              )}
              {projectMemory && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  title={lang === "ar" ? "استيراد ZIP" : "Import ZIP"}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                </button>
              )}
              {projectMemory && (
                <div className="relative">
                  <button
                    onClick={() => setShowDeployMenu(v => !v)}
                    disabled={isDeploying}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {isDeploying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                    <span className="hidden sm:inline">{lang === "ar" ? "نشر" : "Deploy"}</span>
                  </button>
                  {showDeployMenu && (
                    <div className="absolute top-full end-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-50 min-w-[150px] py-1 text-xs overflow-hidden">
                      <button onClick={() => { handleDeployVercel(); setShowDeployMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-start">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Vercel
                      </button>
                      <button onClick={() => setShowDeployMenu(false)} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-start text-muted-foreground">
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </button>
                      <button onClick={handleDeployCustomServer} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-start">
                        <Server className="w-3.5 h-3.5 text-green-400" />
                        {lang === "ar" ? "سيرفر خاص" : "Custom Server"}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {deployedUrl && (
                <a href={deployedUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {htmlFile && (
                <button
                  onClick={() => setIsFullscreen(v => !v)}
                  title={lang === "ar" ? "ملء الشاشة" : "Fullscreen"}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs bg-card border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Standby Mode Bar ── */}
      {projectMemory && !isExecuting && (
          <div className="shrink-0 border-b border-border bg-card/5 px-3 py-2">
            <div className="max-w-4xl mx-auto flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 focus-within:border-primary/50 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  value={standbyPrompt}
                  onChange={e => setStandbyPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleStandbyEdit(); }}
                  placeholder={lang === "ar" ? "✏️ عدّل المشروع بدون إعادة بناء... (مثال: غيّر اللون للأزرق، أضف قسم تواصل)" : "✏️ Edit without rebuilding... (e.g. change color to blue, add contact section)"}
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
                  disabled={isStandbyExecuting}
                />
                {isStandbyExecuting && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
              </div>
              <button
                onClick={handleStandbyEdit}
                disabled={!standbyPrompt.trim() || isStandbyExecuting}
                className={cn("px-3 py-1.5 text-xs rounded-xl transition-all", standbyPrompt.trim() && !isStandbyExecuting ? "gradient-primary text-white" : "bg-muted text-muted-foreground/40")}
              >
                {lang === "ar" ? "تعديل" : "Edit"}
              </button>
              <button
                onClick={() => projectMemory && saveVersion(projectMemory.allFiles)}
                className="px-3 py-1.5 text-xs rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
                title={lang === "ar" ? "حفظ إصدار" : "Save version"}
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      {/* ── Self-Healing Indicator ── */}
      {isHealing && (
        <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-3 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-amber-400 text-xs">
            <Wrench className="w-3.5 h-3.5 animate-spin" />
            <span>{lang === "ar" ? "🔧 الوكيل يصلح الأخطاء تلقائياً..." : "🔧 Agent is auto-fixing errors..."}</span>
            <span className="text-amber-400/50">({lang === "ar" ? `دورة ${healCycles}/3` : `cycle ${healCycles}/3`})</span>
          </div>
        </div>
      )}
        {/* ── Hidden file input for ZIP import ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImportZip(f); e.target.value = ""; }}
        />

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
                      {step.status === "error" && <AlertCircle className="w-7 h-7 text-red-400 animate-pulse" />}
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
                        <span className="text-xs text-primary/70 font-mono">{Math.min(99, Math.round(step.streamingText.length / 50))}%</span>
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
                      {/* Error Message Display */}
                      {step.status === "error" && (
                        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-bold text-red-400">{lang === "ar" ? "حدث خطأ" : "Error Occurred"}</span>
                          </div>
                          <p className="text-sm text-red-300/80 leading-relaxed">
                            {step.errorMessage || (lang === "ar" ? "خطأ غير متوقع. حاول مرة أخرى." : "Unexpected error. Try again.")}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleExecuteStep(plan.indexOf(step)); }}
                            className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                          >
                            {lang === "ar" ? "🔄 إعادة المحاولة" : "🔄 Retry"}
                          </button>
                        </div>
                      )}
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
        {/* ── Split View (Plan + Preview side by side) ── */}
        {isSplitView && htmlFile && (
          <div className="h-full flex overflow-hidden">
            {/* Left: Plan */}
            <div className="w-1/2 border-e border-border overflow-y-auto p-3">
              <div className="space-y-2">
                {plan.map((step, i) => (
                  <div key={step.id} className={cn("rounded-xl border px-3 py-2 text-xs transition-all", step.status === "running" ? "border-primary/50 bg-primary/5" : step.status === "done" ? "border-green-500/20 bg-green-500/5" : step.status === "error" ? "border-red-500/20 bg-red-500/5" : "border-border bg-card/50")}>
                    <div className="flex items-center gap-2">
                      {step.status === "done" && <span className="text-green-400">✓</span>}
                      {step.status === "running" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      {step.status === "error" && <span className="text-red-400">✗</span>}
                      {step.status === "pending" && <span className="text-muted-foreground/30">○</span>}
                      <span className={cn("font-medium", step.status === "running" ? "text-primary" : step.status === "done" ? "text-green-400" : "text-foreground")}>
                        {lang === "ar" ? step.titleAr : step.titleEn}
                      </span>
                    </div>
                    {step.status === "running" && step.streamingText && (
                      <p className="text-muted-foreground/60 mt-1 line-clamp-2">{step.streamingText.slice(-200)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Right: Preview */}
            <div className="w-1/2 overflow-hidden bg-white">
              <iframe ref={iframeRef} srcDoc={injectConsoleInterceptor(htmlFile.content)} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms" title="Split Preview" />
            </div>
          </div>
        )}
        {!isSplitView && activeTab === "preview" && (
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
              {!htmlFile && isExecuting && <span className="text-xs text-primary/70 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{lang === "ar" ? "جاري البناء..." : "Building..."}</span>}
              {!htmlFile && !isExecuting && plan.length > 0 && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  ⚠️ {lang === "ar" ? "المشروع يحتوي على ملفات غير HTML (مثل server.js) — اضغط على تبويب الملفات لعرضها" : "Project has non-HTML files (e.g. server.js) — check Files tab to view them"}
                </span>
              )}
              {/* Output Format Menu */}
              <div className="relative ms-auto">
                <button
                  onClick={() => setShowFormatMenu(v => !v)}
                  disabled={isGeneratingFormat}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isGeneratingFormat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Code2 className="w-3 h-3" />}
                  <span className="hidden sm:inline">{lang === "ar" ? "تحويل" : "Convert"}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showFormatMenu && (
                  <div className="absolute top-full end-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-50 min-w-[180px] py-1 text-xs overflow-hidden">
                    <p className="px-3 py-1.5 text-muted-foreground/60 border-b border-border">{lang === "ar" ? "اختر صيغة الإخراج" : "Output format"}</p>
                    {[
                      { id: "react", icon: "⚛️", label: "React App", sub: "CDN React 18" },
                      { id: "python", icon: "🐍", label: "Python Script", sub: "+ requirements.txt" },
                      { id: "telegram", icon: "🤖", label: "Telegram Bot", sub: "python-telegram-bot" },
                      { id: "landing", icon: "🚀", label: "Landing Page", sub: "Tailwind + Alpine" },
                    ].map(f => (
                      <button key={f.id} onClick={() => handleGenerateFormat(f.id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-start">
                        <span>{f.icon}</span>
                        <div><p className="font-medium">{f.label}</p><p className="text-muted-foreground/50">{f.sub}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* SEO/Validate button */}
              {htmlFile && (
                <button
                  onClick={() => handleValidateHtml(htmlFile.content)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-card border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
                  title={lang === "ar" ? "تحليل SEO والأداء" : "SEO & Performance"}
                >
                  <Search className="w-3 h-3" />
                  <span className="hidden sm:inline">SEO</span>
                </button>
              )}
              {/* Validation score badge */}
              {htmlValidation && (
                <div className={cn("flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border font-bold", htmlValidation.score >= 80 ? "bg-green-500/10 border-green-500/20 text-green-400" : htmlValidation.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
                  {htmlValidation.score}/100
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-muted/20 flex items-start justify-center p-4">
                {htmlFile ? (
               <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
                 style={{ width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px", maxWidth: "100%", minHeight: "500px" }}>
                 <iframe ref={iframeRef} srcDoc={injectConsoleInterceptor(htmlFile.content)} className="w-full border-0" style={{ height: "600px" }} sandbox="allow-scripts allow-same-origin allow-forms" title="Preview" />
               </div>
             ) : (
                <div className="text-center text-muted-foreground py-20">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  {isExecuting ? (
                    <div>
                      <p className="text-primary font-medium mb-2 text-base">{lang === "ar" ? "🔨 الوكلاء يبنون مشروعك..." : "🔨 Agents are building your project..."}</p>
                      <p className="text-xs text-muted-foreground mb-4">{lang === "ar" ? "ستظهر المعاينة تلقائياً عند اكتمال وكيل Frontend" : "Preview will appear automatically when Frontend agent completes"}</p>
                      <div className="flex justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  ) : plan.length > 0 ? (
                    <div>
                      <p className="mb-2">{lang === "ar" ? "المعاينة ستظهر بعد اكتمال البناء" : "Preview will appear after build completes"}</p>
                      <p className="text-xs">{lang === "ar" ? "اضغط تنفيذ لبدء البناء" : "Press Execute to start building"}</p>
                    </div>
                  ) : (
                    <p>{lang === "ar" ? "اكتب برومبتك وابدأ البناء" : "Write your prompt and start building"}</p>
                  )}
                </div>
              )}
              {/* SEO/Performance Report Panel */}
              {htmlValidation && (
                <div className="w-full max-w-2xl mt-4 mx-auto rounded-xl border border-border bg-card/80 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">{lang === "ar" ? "📊 تقرير الجودة" : "📊 Quality Report"}</h3>
                    <button onClick={() => setHtmlValidation(null)} className="text-muted-foreground/50 hover:text-muted-foreground text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "SEO", score: htmlValidation.seoScore ?? htmlValidation.score, icon: "🔍" },
                      { label: lang === "ar" ? "أداء" : "Perf", score: htmlValidation.perfScore ?? 80, icon: "⚡" },
                      { label: lang === "ar" ? "موبايل" : "Mobile", score: htmlValidation.mobileScore ?? 80, icon: "📱" },
                      { label: lang === "ar" ? "وصول" : "A11y", score: htmlValidation.a11yScore ?? 80, icon: "♿" },
                    ].map(item => (
                      <div key={item.label} className={cn("rounded-lg p-2 text-center border", item.score >= 80 ? "bg-green-500/10 border-green-500/20" : item.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20")}>
                        <div className="text-lg">{item.icon}</div>
                        <div className={cn("text-xl font-bold", item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400")}>{item.score}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {htmlValidation.errors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-400 mb-1">❌ {lang === "ar" ? "أخطاء" : "Errors"}</p>
                      {htmlValidation.errors.map((e, i) => <p key={i} className="text-xs text-red-300/80 ps-2">• {e}</p>)}
                    </div>
                  )}
                  {htmlValidation.warnings.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-yellow-400 mb-1">⚠️ {lang === "ar" ? "تحذيرات" : "Warnings"}</p>
                      {htmlValidation.warnings.slice(0, 5).map((w, i) => <p key={i} className="text-xs text-yellow-300/80 ps-2">• {w}</p>)}
                    </div>
                  )}
                  {htmlValidation.suggestions && htmlValidation.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-400 mb-1">💡 {lang === "ar" ? "اقتراحات" : "Suggestions"}</p>
                      {htmlValidation.suggestions.slice(0, 3).map((s, i) => <p key={i} className="text-xs text-blue-300/80 ps-2">• {s}</p>)}
                    </div>
                  )}
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
                  <button key={i} onClick={() => { setSelectedFile(i); setIsEditingFile(false); setEditedFileContent(allFiles[i]?.content || ""); }} className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-start transition-all", selectedFile === i ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}>
                    <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
              {allFiles[selectedFile] ? (
                <>
                  <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/10 bg-gray-900">
                    <span className="text-xs text-green-400 font-mono">{allFiles[selectedFile].name}</span>
                    <div className="flex items-center gap-2">
                      {isEditingFile ? (
                        <>
                          <button onClick={() => {
                            const updated = allFiles.map((f, i) => i === selectedFile ? { ...f, content: editedFileContent } : f);
                            setProjectMemory(prev => prev ? { ...prev, allFiles: updated } : prev);
                            if (allFiles[selectedFile].language === "html") setLiveHtmlFile(editedFileContent);
                            setIsEditingFile(false);
                            toast.success(lang === "ar" ? "تم حفظ التعديلات" : "Changes saved");
                          }} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                            {lang === "ar" ? "💾 حفظ" : "💾 Save"}
                          </button>
                          <button onClick={() => setIsEditingFile(false)} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                            {lang === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setIsEditingFile(true); setEditedFileContent(allFiles[selectedFile].content); }}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                            ✏️ {lang === "ar" ? "تعديل" : "Edit"}
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(allFiles[selectedFile].content); toast.success(lang === "ar" ? "تم النسخ" : "Copied"); }}
                            className="text-xs px-2 py-1 bg-white/5 text-muted-foreground rounded-lg hover:text-foreground transition-colors">
                            📋 {lang === "ar" ? "نسخ" : "Copy"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditingFile ? (
                    <textarea value={editedFileContent} onChange={e => setEditedFileContent(e.target.value)}
                      className="flex-1 p-4 text-xs font-mono text-green-300 bg-gray-950 resize-none outline-none leading-relaxed" spellCheck={false} />
                  ) : (
                    <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
                      {allFiles[selectedFile].content}
                    </pre>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/30 text-sm">
                  {lang === "ar" ? "اختر ملفاً من القائمة" : "Select a file from the list"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Console Tab ── */}
        {activeTab === "console" && (
          <div className="h-full flex flex-col overflow-hidden bg-gray-950">
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/30">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                {lang === "ar" ? "سجل الكونسول" : "Console Log"} ({consoleMessages.length})
              </span>
              <button onClick={() => setConsoleMessages([])} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                {lang === "ar" ? "مسح" : "Clear"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
              {consoleMessages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground/40">
                  {lang === "ar" ? "لا توجد رسائل بعد. افتح المعاينة لالتقاط رسائل الكونسول." : "No messages yet. Open preview to capture console messages."}
                </div>
              ) : consoleMessages.map((msg, i) => (
                <div key={i} className={cn("flex items-start gap-2 py-0.5", msg.type === "error" ? "text-red-400" : msg.type === "warn" ? "text-yellow-400" : msg.type === "info" ? "text-blue-400" : "text-green-300")}>
                  <span className="shrink-0 text-muted-foreground/40">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  <span className={cn("shrink-0 px-1 rounded text-xs", msg.type === "error" ? "bg-red-500/20" : msg.type === "warn" ? "bg-yellow-500/20" : "bg-green-500/10")}>{msg.type}</span>
                  <span className="break-all">{msg.message}</span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        )}

        {/* ── Version History Tab ── */}
        {activeTab === "history" && (
          <div className="h-full overflow-y-auto p-3">
            <div className="max-w-2xl mx-auto space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                {lang === "ar" ? "الإصدارات المحفوظة — اضغط استعادة للرجوع لأي إصدار سابق" : "Saved versions — click Restore to go back to any previous version"}
              </p>
              {versions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground/40">
                  {lang === "ar" ? "لا توجد إصدارات محفوظة بعد. اضغط زر الإصدار في شريط التعديل." : "No saved versions yet. Click the version button in the edit bar."}
                </div>
              ) : [...versions].reverse().map(version => (
                <div key={version.id} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{version.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{version.files.length} {lang === "ar" ? "ملف" : "files"} • {new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => restoreVersion(version)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    {lang === "ar" ? "استعادة" : "Restore"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Observability Tab ── */}
        {activeTab === "observe" && (
          <div className="h-full overflow-y-auto p-3">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
                  <p className="text-2xl font-bold text-primary">${totalCost.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "التكلفة الإجمالية" : "Total Cost"}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{(totalTokens/1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "إجمالي التوكنز" : "Total Tokens"}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{observability.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "عدد الخطوات" : "Steps"}</p>
                </div>
              </div>
              {htmlFile && (
                <div className="rounded-xl border border-border bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">🔬 {lang === "ar" ? "نظام QA المتكامل" : "Integrated QA System"}</h3>
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        setIsRunningQA(true);
                        try {
                          const [analysis, interactive] = await Promise.all([
                            fetch("/api/qa/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html: htmlFile.content }) }).then(r => r.json()),
                            fetch("/api/qa/interactive-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html: htmlFile.content }) }).then(r => r.json()),
                          ]);
                          setQaReport({ analysis, interactive });
                        } catch (e: any) { toast.error((e as Error).message); }
                        setIsRunningQA(false);
                      }} disabled={isRunningQA} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                        {isRunningQA ? <Loader2 className="w-3 h-3 animate-spin" /> : "⚡"} {lang === "ar" ? "فحص سريع" : "Quick Check"}
                      </button>
                      <button onClick={async () => {
                        setIsRunningVisualQA(true); setQaVisualReport("");
                        try {
                          const res = await fetch("/api/qa/visual-qa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html: htmlFile.content, lang }) });
                          const reader = res.body?.getReader(); const decoder = new TextDecoder();
                          if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; for (const line of decoder.decode(value, { stream: true }).split("\n")) { if (!line.startsWith("data: ")) continue; try { const p = JSON.parse(line.slice(6)); if (p.type === "chunk") setQaVisualReport(prev => prev + p.content); if (p.type === "qa_data") setQaReport((prev: any) => ({ ...prev, aiScore: p.data })); } catch {} } } }
                        } catch (e: any) { toast.error((e as Error).message); }
                        setIsRunningVisualQA(false);
                      }} disabled={isRunningVisualQA} className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-1">
                        {isRunningVisualQA ? <Loader2 className="w-3 h-3 animate-spin" /> : "🤖"} {lang === "ar" ? "تحليل AI" : "AI Analysis"}
                      </button>
                    </div>
                  </div>
                  {qaReport?.analysis && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {([
                          { label: lang === "ar" ? "أداء" : "Perf", score: qaReport.analysis.scores?.performance ?? 0, icon: "⚡" },
                          { label: "SEO", score: qaReport.analysis.scores?.seo ?? 0, icon: "🔍" },
                          { label: lang === "ar" ? "وصول" : "A11y", score: qaReport.analysis.scores?.accessibility ?? 0, icon: "♿" },
                          { label: lang === "ar" ? "موبايل" : "Mobile", score: qaReport.analysis.scores?.mobile ?? 0, icon: "📱" },
                        ] as {label:string;score:number;icon:string}[]).map(item => (
                          <div key={item.label} className={cn("rounded-lg p-2 text-center border", item.score >= 80 ? "bg-green-500/10 border-green-500/20" : item.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20")}>
                            <div className="text-base">{item.icon}</div>
                            <div className={cn("text-lg font-bold", item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400")}>{item.score}</div>
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { key: "hasAOS", label: "AOS" },
                          { key: "hasAlpine", label: "Alpine.js" },
                          { key: "hasLucide", label: "Lucide" },
                        ].map(lib => (
                          <span key={lib.key} className={cn("text-xs px-2 py-1 rounded-full", qaReport.analysis[lib.key] ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                            {qaReport.analysis[lib.key] ? "✅" : "❌"} {lib.label}
                          </span>
                        ))}
                        <span className={cn("text-xs px-2 py-1 rounded-full", !qaReport.analysis.hasLorem ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {!qaReport.analysis.hasLorem ? "✅" : "❌"} {lang === "ar" ? "لا Lorem" : "No Lorem"}
                        </span>
                      </div>
                      {qaReport.interactive && qaReport.interactive.total > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الفحص التفاعلي:" : "Interactive:"} {qaReport.interactive.critical} 🔴 {qaReport.interactive.warnings} 🟡 {qaReport.interactive.notes} 🟢</p>
                          <div className="max-h-28 overflow-y-auto space-y-1">
                            {qaReport.interactive.results?.slice(0, 6).map((issue: {type:string;element:string;issue:string;fix:string}, i: number) => (
                              <div key={i} className={cn("text-xs px-2 py-1 rounded border", issue.type === "critical" ? "bg-red-500/10 border-red-500/20 text-red-300" : issue.type === "warning" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300" : "bg-blue-500/10 border-blue-500/20 text-blue-300")}>
                                {issue.issue}
                              </div>
                            ))}
                          </div>
                          <button onClick={async () => {
                            if (!htmlFile || !qaReport.interactive.results) return;
                            setIsAutoFixing(true);
                            const issues = qaReport.interactive.results.filter((i: {type:string}) => i.type !== "note").slice(0, 10);
                            if (!issues.length) { toast.success(lang === "ar" ? "لا مشاكل!" : "No issues!"); setIsAutoFixing(false); return; }
                            try {
                              const res = await fetch("/api/qa/auto-fix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html: htmlFile.content, issues, lang }) });
                              const reader = res.body?.getReader(); const decoder = new TextDecoder(); let fixed = "";
                              if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; for (const line of decoder.decode(value, { stream: true }).split("\n")) { if (!line.startsWith("data: ")) continue; try { const p = JSON.parse(line.slice(6)); if (p.type === "chunk") fixed += p.content; } catch {} } } }
                              const m = fixed.match(/```html\s*([\s\S]*?)```/i);
                              if (m) { setLiveHtmlFile(m[1].trim()); toast.success(lang === "ar" ? "✅ تم الإصلاح!" : "✅ Fixed!"); setQaReport(null); }
                            } catch (e: any) { toast.error((e as Error).message); }
                            setIsAutoFixing(false);
                          }} disabled={isAutoFixing} className="w-full text-xs py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2">
                            {isAutoFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : "🔧"} {lang === "ar" ? "إصلاح تلقائي" : "Auto-Fix Issues"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {qaVisualReport && (
                    <div className="mt-3 p-3 bg-card/50 rounded-lg border border-border/50 max-h-56 overflow-y-auto">
                      <p className="text-xs font-medium text-purple-400 mb-2">🤖 {lang === "ar" ? "تقرير AI المرئي" : "AI Visual Report"}</p>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{qaVisualReport}</pre>
                      {isRunningVisualQA && <span className="animate-pulse text-purple-400">▌</span>}
                    </div>
                  )}
                </div>
              )}
              {observability.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <p className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border bg-card/30">{lang === "ar" ? "تفاصيل التكلفة" : "Cost breakdown"}</p>
                  <table className="w-full text-xs">
                    <thead className="bg-card/50 border-b border-border">
                      <tr>
                        <th className="px-3 py-2 text-start text-muted-foreground">{lang === "ar" ? "الوكيل" : "Agent"}</th>
                        <th className="px-3 py-2 text-end text-muted-foreground">{lang === "ar" ? "توكنز" : "Tokens"}</th>
                        <th className="px-3 py-2 text-end text-muted-foreground">{lang === "ar" ? "الوقت" : "Time"}</th>
                        <th className="px-3 py-2 text-end text-muted-foreground">{lang === "ar" ? "التكلفة" : "Cost"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observability.map((entry, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-3 py-2 font-medium">{entry.agentId}</td>
                          <td className="px-3 py-2 text-end text-muted-foreground">{(entry.tokensIn + entry.tokensOut).toLocaleString()}</td>
                          <td className="px-3 py-2 text-end text-muted-foreground">{(entry.durationMs/1000).toFixed(1)}s</td>
                          <td className="px-3 py-2 text-end text-yellow-400">${entry.costUSD.toFixed(5)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    {lang === "ar" ? (isExecuting ? "🔨 الوكلاء يعملون الآن — يمكنك السؤال أثناء البناء!" : "اسأل أي شيء عن مشروعك...") : (isExecuting ? "🔨 Agents are working — you can ask questions during build!" : "Ask anything about your project...")}
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
