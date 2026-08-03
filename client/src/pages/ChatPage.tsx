import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send, Paperclip, Sparkles, Bot, User, CheckCircle2,
  Loader2, AlertCircle, Clock, ChevronRight, Zap,
  Globe, Code2, Palette, FileText, MessageSquare,
  BookOpen, Search, Megaphone, Gamepad2, CreditCard,
  X, Plus, RotateCcw
} from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Agent Icon Map ───────────────────────────────────────────────────────────
const agentIcons: Record<string, React.ReactNode> = {
  planning: <Sparkles className="w-4 h-4" />,
  programming: <Code2 className="w-4 h-4" />,
  design: <Palette className="w-4 h-4" />,
  content: <FileText className="w-4 h-4" />,
  bots: <MessageSquare className="w-4 h-4" />,
  writing: <BookOpen className="w-4 h-4" />,
  qa: <CheckCircle2 className="w-4 h-4" />,
  research: <Search className="w-4 h-4" />,
  marketing: <Megaphone className="w-4 h-4" />,
  games: <Gamepad2 className="w-4 h-4" />,
  payments: <CreditCard className="w-4 h-4" />,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkflowStep {
  id: string;
  agent: string;
  title: string;
  titleAr: string;
  status: "pending" | "in_progress" | "completed" | "error";
  startedAt?: number;
  elapsedMs?: number;
  output?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: { name: string; url: string; type: string }[];
  createdAt: Date;
}

// ─── Workflow Step Component ──────────────────────────────────────────────────
function WorkflowStepItem({ step, lang }: { step: WorkflowStep; lang: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (step.status !== "in_progress" || !step.startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - step.startedAt!);
    }, 100);
    return () => clearInterval(interval);
  }, [step.status, step.startedAt]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const statusColors = {
    pending: "text-muted-foreground",
    in_progress: "text-primary",
    completed: "text-green-400",
    error: "text-destructive",
  };

  const statusIcons = {
    pending: <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />,
    in_progress: <Loader2 className="w-4 h-4 animate-spin text-primary" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    error: <AlertCircle className="w-4 h-4 text-destructive" />,
  };

  return (
    <div className={cn(
      "flex items-start gap-3 px-3 py-2 rounded-lg transition-all duration-200",
      step.status === "in_progress" && "bg-primary/5 border border-primary/20",
      step.status === "completed" && "opacity-70",
    )}>
      <div className="mt-0.5 shrink-0">{statusIcons[step.status]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-xs font-medium truncate", statusColors[step.status])}>
            {lang === "ar" ? step.titleAr : step.title}
          </span>
          {(step.status === "in_progress" || step.status === "completed") && (
            <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {step.status === "in_progress"
                ? formatTime(elapsed)
                : formatTime(step.elapsedMs ?? 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-muted-foreground">{agentIcons[step.agent]}</span>
          <span className="text-xs text-muted-foreground">
            {lang === "ar"
              ? { planning:"التخطيط",programming:"البرمجة",design:"التصميم",content:"المحتوى",bots:"البوتات",writing:"الكتابة",qa:"الفحص",research:"البحث",marketing:"التسويق",games:"الألعاب",payments:"الدفع" }[step.agent]
              : step.agent.charAt(0).toUpperCase() + step.agent.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────
const suggestions = {
  ar: [
    "ابني لي متجر عطور بتصميم أسود ذهبي مع بوت تليغرام",
    "أنشئ موقع شركة تقنية عصري مع لوحة تحكم",
    "اصنع لعبة ويب 2D بسيطة",
    "اكتب كتاب عن ريادة الأعمال 150 صفحة",
    "ابني متجر إلكتروني مع نظام دفع كامل",
    "أنشئ بوت تليغرام لحجز المواعيد",
  ],
  en: [
    "Build a perfume store with black and gold design + Telegram bot",
    "Create a modern tech company website with dashboard",
    "Make a simple 2D web game",
    "Write a 150-page entrepreneurship book",
    "Build an e-commerce store with full payment system",
    "Create a Telegram bot for appointment booking",
  ],
};

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage({ projectId }: { projectId?: number }) {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      if (data.message) {
        setMessages(prev => [...prev, {
          id: String(Date.now()),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        }]);
      }
      if (data.steps) setWorkflowSteps(data.steps);
      setIsStreaming(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setIsStreaming(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setInput("");

    // Simulate workflow steps
    const steps: WorkflowStep[] = [
      { id: "1", agent: "planning", title: "Analyzing requirements", titleAr: "تحليل المتطلبات", status: "in_progress", startedAt: Date.now() },
      { id: "2", agent: "design", title: "Choosing design system", titleAr: "اختيار نظام التصميم", status: "pending" },
      { id: "3", agent: "programming", title: "Writing code", titleAr: "كتابة الكود", status: "pending" },
      { id: "4", agent: "content", title: "Generating content", titleAr: "توليد المحتوى", status: "pending" },
      { id: "5", agent: "qa", title: "Testing & validation", titleAr: "الاختبار والتحقق", status: "pending" },
    ];
    setWorkflowSteps(steps);

    sendMutation.mutate({ content: input.trim(), projectId, lang });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col overflow-hidden bg-background" style={{ height: '100%' }} dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Main Chat Area ── */}
      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Messages / Welcome */}
        <ScrollArea className="flex-1 px-4">
          {isEmpty ? (
            /* Welcome Screen - compact on mobile */
            <div className="flex flex-col items-center justify-start pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-3 glow-primary">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient mb-1">
                {lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}
              </h1>
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                {lang === "ar"
                  ? "اكتب برومبت واحد واحصل على مشروع كامل جاهز للاستخدام"
                  : "Write one prompt and get a complete ready-to-use project"}
              </p>
              {/* Agent Grid - smaller on mobile */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mb-4 w-full max-w-lg">
                {Object.entries(agentIcons).map(([key, icon]) => (
                  <div key={key} className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {icon}
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {tr.agents[key as keyof typeof tr.agents]}
                    </span>
                  </div>
                ))}
              </div>
              {/* Suggestions */}
              <div className="w-full max-w-2xl">
                <p className="text-xs text-muted-foreground mb-2">{tr.chat.suggestions}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions[lang].slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="text-start p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Zap className="w-3 h-3 inline me-1.5 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === "user" ? "bg-primary/20" : "gradient-primary"
                  )}>
                    {msg.role === "user"
                      ? <User className="w-4 h-4 text-primary" />
                      : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  {/* Bubble */}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  )}>
                    {msg.role === "assistant"
                      ? <Streamdown className="prose prose-invert prose-sm max-w-none">{msg.content}</Streamdown>
                      : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* ── Input Area ── */}
        <div className="border-t border-border p-3 bg-background">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 py-1 text-xs">
                  <Paperclip className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tr.chat.placeholder}
                className="min-h-[52px] max-h-[200px] resize-none bg-card border-border text-sm pr-12 rounded-2xl"
                dir={isRTL ? "rtl" : "ltr"}
                disabled={isStreaming}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 end-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".zip,.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.js,.ts,.html,.css,.json"
                className="hidden"
                onChange={handleFileAttach}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-[52px] w-[52px] rounded-2xl gradient-primary shrink-0"
            >
              {isStreaming
                ? <Loader2 className="w-5 h-5 animate-spin text-white" />
                : <Send className="w-5 h-5 text-white" />}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {lang === "ar" ? "اضغط Enter للإرسال، Shift+Enter لسطر جديد" : "Press Enter to send, Shift+Enter for new line"}
          </p>
        </div>
      </div>

      {/* ── Workflow Sidebar ── */}
      {workflowSteps.length > 0 && showSidebar && (
        <div className="w-72 border-s border-border flex flex-col bg-card/50 shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">
                {lang === "ar" ? "سير العمل" : "Workflow"}
              </span>
            </div>
            <button onClick={() => setShowSidebar(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {workflowSteps.map((step, i) => (
                <div key={step.id}>
                  <WorkflowStepItem step={step} lang={lang} />
                  {i < workflowSteps.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Progress bar */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{lang === "ar" ? "التقدم" : "Progress"}</span>
              <span>
                {workflowSteps.filter(s => s.status === "completed").length}/{workflowSteps.length}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{
                  width: `${(workflowSteps.filter(s => s.status === "completed").length / workflowSteps.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
