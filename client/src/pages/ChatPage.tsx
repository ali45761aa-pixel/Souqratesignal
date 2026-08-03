import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Paperclip, Sparkles, Bot, User, CheckCircle2,
  Loader2, AlertCircle, Clock, ChevronDown,
  Code2, Palette, FileText, MessageSquare,
  BookOpen, Search, Megaphone, Gamepad2, CreditCard,
  X, Zap, Mic
} from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const agentIcons: Record<string, React.ReactNode> = {
  planning: <Sparkles className="w-5 h-5" />,
  programming: <Code2 className="w-5 h-5" />,
  design: <Palette className="w-5 h-5" />,
  content: <FileText className="w-5 h-5" />,
  bots: <MessageSquare className="w-5 h-5" />,
  writing: <BookOpen className="w-5 h-5" />,
  qa: <CheckCircle2 className="w-5 h-5" />,
  research: <Search className="w-5 h-5" />,
  marketing: <Megaphone className="w-5 h-5" />,
  games: <Gamepad2 className="w-5 h-5" />,
  payments: <CreditCard className="w-5 h-5" />,
};

const agentColors: Record<string, string> = {
  planning: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  programming: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  design: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  content: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  bots: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  writing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  qa: "bg-green-500/15 text-green-400 border-green-500/30",
  research: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  marketing: "bg-red-500/15 text-red-400 border-red-500/30",
  games: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  payments: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

interface WorkflowStep {
  id: string;
  agent: string;
  title: string;
  titleAr: string;
  status: "pending" | "in_progress" | "completed" | "error";
  startedAt?: number;
  elapsedMs?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const suggestions = {
  ar: [
    "ابني لي متجر عطور بتصميم أسود ذهبي مع بوت تليغرام",
    "أنشئ موقع شركة تقنية عصري مع لوحة تحكم",
    "اصنع لعبة ويب 2D بسيطة",
    "اكتب كتاب عن ريادة الأعمال 150 صفحة",
  ],
  en: [
    "Build a perfume store with black gold design + Telegram bot",
    "Create a modern tech company website with dashboard",
    "Make a simple 2D web game",
    "Write a 150-page entrepreneurship book",
  ],
};

export default function ChatPage({ projectId }: { projectId?: number }) {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showWorkflow, setShowWorkflow] = useState(false);
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
      if (data.steps) {
        setWorkflowSteps(data.steps);
        setShowWorkflow(true);
      }
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

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

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
    setWorkflowSteps([
      { id: "1", agent: "planning", title: "Analyzing requirements", titleAr: "تحليل المتطلبات", status: "in_progress", startedAt: Date.now() },
      { id: "2", agent: "design", title: "Choosing design system", titleAr: "اختيار نظام التصميم", status: "pending" },
      { id: "3", agent: "programming", title: "Writing code", titleAr: "كتابة الكود", status: "pending" },
      { id: "4", agent: "content", title: "Generating content", titleAr: "توليد المحتوى", status: "pending" },
      { id: "5", agent: "qa", title: "Testing & validation", titleAr: "الاختبار والتحقق", status: "pending" },
    ]);
    setShowWorkflow(true);
    sendMutation.mutate({ content: input.trim(), projectId, lang });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col bg-background"
      style={{ height: "100%", direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isEmpty ? (
          /* ── Welcome Screen ── */
          <div className="flex flex-col items-center px-4 pt-8 pb-4 text-center">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
              {lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}
            </h1>
            <p className="text-muted-foreground text-base mb-6 max-w-sm leading-relaxed">
              {lang === "ar"
                ? "اكتب برومبت واحد واحصل على مشروع كامل جاهز"
                : "One prompt → complete ready project"}
            </p>

            {/* Agents - 2 rows, bigger */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6 w-full max-w-sm sm:max-w-lg">
              {Object.entries(agentIcons).map(([key, icon]) => (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-default",
                    agentColors[key] ?? "bg-card border-border"
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">
                    {tr.agents[key as keyof typeof tr.agents]}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-lg">
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                {lang === "ar" ? "💡 جرب هذه الأمثلة:" : "💡 Try these examples:"}
              </p>
              <div className="flex flex-col gap-2">
                {suggestions[lang].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-start px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-foreground leading-relaxed"
                  >
                    <Zap className="w-4 h-4 inline me-2 text-primary shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Messages ── */
          <div className="flex flex-col gap-4 px-3 sm:px-6 py-4 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1",
                  msg.role === "user" ? "bg-primary/20" : "gradient-primary"
                )}>
                  {msg.role === "user"
                    ? <User className="w-5 h-5 text-primary" />
                    : <Bot className="w-5 h-5 text-white" />}
                </div>
                {/* Bubble */}
                <div className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-base leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm text-foreground"
                )}>
                  {msg.role === "assistant"
                    ? <Streamdown className="prose prose-invert prose-base max-w-none">{msg.content}</Streamdown>
                    : <p className="whitespace-pre-wrap">{msg.content}</p>}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Steps (inline after messages) */}
            {showWorkflow && workflowSteps.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {lang === "ar" ? "سير العمل" : "Workflow"}
                    </span>
                  </div>
                  <button onClick={() => setShowWorkflow(false)} className="text-muted-foreground hover:text-foreground p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {workflowSteps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                      step.status === "in_progress" && "bg-primary/8 border border-primary/20",
                      step.status === "completed" && "opacity-60",
                    )}
                  >
                    <div className="shrink-0">
                      {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />}
                      {step.status === "in_progress" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                      {step.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {step.status === "error" && <AlertCircle className="w-5 h-5 text-destructive" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        step.status === "in_progress" ? "text-primary" :
                        step.status === "completed" ? "text-green-400" :
                        step.status === "error" ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {lang === "ar" ? step.titleAr : step.title}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      agentColors[step.agent] ?? "bg-muted text-muted-foreground border-border"
                    )}>
                      {lang === "ar"
                        ? ({planning:"تخطيط",programming:"برمجة",design:"تصميم",content:"محتوى",bots:"بوت",writing:"كتابة",qa:"فحص",research:"بحث",marketing:"تسويق",games:"ألعاب",payments:"دفع"} as any)[step.agent]
                        : step.agent}
                    </span>
                  </div>
                ))}
                {/* Progress */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{lang === "ar" ? "التقدم" : "Progress"}</span>
                    <span>{workflowSteps.filter(s => s.status === "completed").length} / {workflowSteps.length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${(workflowSteps.filter(s => s.status === "completed").length / workflowSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Area - Big & Clear ── */}
      <div className="shrink-0 border-t border-border bg-background px-3 sm:px-4 pt-3 pb-3">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm">
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground max-w-[140px] truncate">{f.name}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main input box */}
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <div className="flex-1 bg-card border-2 border-border focus-within:border-primary/60 rounded-2xl transition-all duration-200 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === "ar"
                ? "اكتب برومبتك هنا... مثال: ابني لي متجر إلكتروني"
                : "Type your prompt here... e.g. Build me an online store"}
              className="w-full bg-transparent px-4 pt-3.5 pb-2 text-base text-foreground placeholder:text-muted-foreground/60 resize-none outline-none leading-relaxed"
              style={{
                minHeight: "56px",
                maxHeight: "160px",
                direction: isRTL ? "rtl" : "ltr",
              }}
              rows={1}
              disabled={isStreaming}
            />
            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={lang === "ar" ? "إرفاق ملف" : "Attach file"}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".zip,.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.js,.ts,.html,.css,.json"
                  className="hidden"
                  onChange={e => setAttachments(prev => [...prev, ...Array.from(e.target.files || [])])}
                />
              </div>
              <p className="text-xs text-muted-foreground/50 hidden sm:block">
                {lang === "ar" ? "Enter للإرسال · Shift+Enter لسطر جديد" : "Enter to send · Shift+Enter new line"}
              </p>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200",
              input.trim() && !isStreaming
                ? "gradient-primary shadow-lg shadow-primary/30 scale-100 hover:scale-105 active:scale-95"
                : "bg-muted cursor-not-allowed opacity-50"
            )}
          >
            {isStreaming
              ? <Loader2 className="w-6 h-6 animate-spin text-white" />
              : <Send className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
