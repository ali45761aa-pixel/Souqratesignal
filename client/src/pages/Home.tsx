import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { cn } from "@/lib/utils";
import {
  Sparkles, Globe, Gamepad2, Palette, FileText,
  MessageSquare, Plus, ArrowUp, Zap, BookOpen,
  Code2, ShoppingCart
} from "lucide-react";

const quickActions = {
  ar: [
    { icon: <Globe className="w-3.5 h-3.5" />, label: "ابنِ موقعاً", prompt: "ابني لي موقع شركة تقنية عصري مع لوحة تحكم" },
    { icon: <ShoppingCart className="w-3.5 h-3.5" />, label: "متجر إلكتروني", prompt: "ابني متجر عطور فاخر بتصميم أسود ذهبي مع سلة تسوق" },
    { icon: <Gamepad2 className="w-3.5 h-3.5" />, label: "اصنع لعبة", prompt: "اصنع لعبة Snake بسيطة بـ HTML5 Canvas" },
    { icon: <Palette className="w-3.5 h-3.5" />, label: "صمّم", prompt: "صمم لي واجهة مستخدم احترافية لتطبيق موبايل" },
    { icon: <MessageSquare className="w-3.5 h-3.5" />, label: "بوت تليغرام", prompt: "اصنع بوت تليغرام لإدارة الحجوزات مع قائمة تفاعلية" },
    { icon: <FileText className="w-3.5 h-3.5" />, label: "المزيد", prompt: "" },
  ],
  en: [
    { icon: <Globe className="w-3.5 h-3.5" />, label: "Build website", prompt: "Build me a modern tech company website with dashboard" },
    { icon: <ShoppingCart className="w-3.5 h-3.5" />, label: "Online store", prompt: "Build a luxury perfume store with black gold design and shopping cart" },
    { icon: <Gamepad2 className="w-3.5 h-3.5" />, label: "Create games", prompt: "Make a simple Snake game with HTML5 Canvas" },
    { icon: <Palette className="w-3.5 h-3.5" />, label: "Design", prompt: "Design a professional mobile app UI for a food delivery app" },
    { icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Telegram bot", prompt: "Create a Telegram bot for appointment booking with interactive menu" },
    { icon: <FileText className="w-3.5 h-3.5" />, label: "More", prompt: "" },
  ],
};

export default function Home() {
  const { lang, changeLang, isRTL } = useLang();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  // Load pending prompt from builder redirect
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPrompt");
    if (pending) {
      sessionStorage.removeItem("pendingPrompt");
      setInput(pending);
    }
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;
    sessionStorage.setItem("pendingPrompt", input.trim());
    navigate("/agent-builder");
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Top Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            {lang === "ar" ? "الوكيل الذكي" : "AI Agent"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex gap-0.5 bg-muted/60 rounded-lg p-0.5">
            <button
              onClick={() => changeLang("ar")}
              className={cn("text-xs px-2.5 py-1 rounded-md transition-all", lang === "ar" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}
            >AR</button>
            <button
              onClick={() => changeLang("en")}
              className={cn("text-xs px-2.5 py-1 rounded-md transition-all", lang === "en" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}
            >EN</button>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors hidden sm:block"
          >
            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </button>
        </div>
      </nav>

      {/* ── Main Content - Vertically Centered ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">
          {lang === "ar" ? "ماذا يمكنني أن أبني لك؟" : "What can I build for you?"}
        </h1>

        {/* ── Main Input Box ── */}
        <div className="w-full max-w-2xl">
          <div className={cn(
            "bg-card border-2 rounded-2xl transition-all duration-200",
            focused ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border hover:border-border/80"
          )}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={lang === "ar"
                ? "اكتب مهمة أو اسأل أي شيء..."
                : "Assign a task or ask anything..."}
              className="w-full bg-transparent px-4 pt-4 pb-1 text-base text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
              style={{ minHeight: "60px", maxHeight: "200px", direction: isRTL ? "rtl" : "ltr" }}
              rows={1}
            />
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
                  input.trim()
                    ? "gradient-primary text-white shadow-md hover:opacity-90 active:scale-95"
                    : "bg-muted/60 text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Quick Action Chips ── */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {quickActions[lang].map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  if (action.prompt) {
                    setInput(action.prompt);
                    textareaRef.current?.focus();
                  } else {
                    navigate("/agent-builder");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Examples ── */}
        <div className="w-full max-w-2xl mt-10">
          <p className="text-xs text-muted-foreground/50 text-center mb-3">
            {lang === "ar" ? "أمثلة سريعة" : "Quick examples"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { ar: "ابني لي متجر عطور بتصميم أسود ذهبي مع بوت تليغرام", en: "Build a perfume store with black gold design + Telegram bot" },
              { ar: "أنشئ موقع شركة تقنية عصري مع لوحة تحكم", en: "Create a modern tech company website with dashboard" },
              { ar: "اصنع لعبة ويب 2D بسيطة بـ HTML5", en: "Make a simple 2D web game with HTML5" },
              { ar: "اكتب كتاباً عن ريادة الأعمال 150 صفحة", en: "Write a 150-page entrepreneurship book" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(lang === "ar" ? item.ar : item.en);
                  textareaRef.current?.focus();
                }}
                className="text-start px-3.5 py-2.5 rounded-xl bg-card/60 border border-border/60 hover:border-primary/30 hover:bg-card transition-all text-sm text-muted-foreground hover:text-foreground"
              >
                <Zap className="w-3 h-3 inline me-1.5 text-primary/50" />
                {lang === "ar" ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-3 text-xs text-muted-foreground/30 shrink-0">
        {lang === "ar" ? "منصة الوكيل الذكي — مستقلة 100% عن أي خدمة خارجية" : "AI Agent Platform — 100% Independent"}
      </div>
    </div>
  );
}
