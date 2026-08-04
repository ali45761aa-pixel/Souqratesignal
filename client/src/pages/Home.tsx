import { useState, useEffect, useRef } from "react";
import { useLang } from "@/contexts/LangContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Sparkles, Zap, Globe, Bot, ShoppingCart, Gamepad2,
  Code2, ArrowRight, Star, Check, ChevronDown, Play,
  Shield, Clock, Users, TrendingUp, Cpu, Layers,
  MessageSquare, FileCode2, Wand2, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "27+", label: { ar: "وكيل متخصص", en: "Specialized Agents" } },
  { value: "100%", label: { ar: "مستقل عن خدمات خارجية", en: "Independent Platform" } },
  { value: "10x", label: { ar: "أسرع من البرمجة اليدوية", en: "Faster than Manual Coding" } },
  { value: "∞", label: { ar: "مشاريع بلا حدود", en: "Unlimited Projects" } },
];

const FEATURES = [
  { icon: Cpu, title: { ar: "27 وكيل متخصص", en: "27 Specialized Agents" }, desc: { ar: "كل وكيل متخصص في مجاله: Frontend، Backend، تصميم، SEO، أمان، وأكثر", en: "Each agent specialized: Frontend, Backend, Design, SEO, Security, and more" }, color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Zap, title: { ar: "بناء فوري بالذكاء الاصطناعي", en: "Instant AI Building" }, desc: { ar: "من الفكرة إلى موقع احترافي كامل في دقائق بدون كتابة كود", en: "From idea to complete professional website in minutes without writing code" }, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Globe, title: { ar: "مواقع احترافية بمستوى Awwwards", en: "Awwwards-Level Websites" }, desc: { ar: "تصاميم احترافية بـ 8 ثيمات مختلفة مع animations وتأثيرات بصرية", en: "Professional designs with 8 themes, animations and visual effects" }, color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Bot, title: { ar: "بوتات تليغرام كاملة", en: "Complete Telegram Bots" }, desc: { ar: "بوتات Python مع قوائم تفاعلية وقاعدة بيانات ونظام دفع", en: "Python bots with interactive menus, database and payment system" }, color: "text-green-400", bg: "bg-green-500/10" },
  { icon: ShoppingCart, title: { ar: "متاجر إلكترونية متكاملة", en: "Complete E-commerce Stores" }, desc: { ar: "متاجر مع سلة تسوق ونظام دفع وإدارة مخزون", en: "Stores with cart, payment system and inventory management" }, color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Gamepad2, title: { ar: "ألعاب HTML5 تفاعلية", en: "Interactive HTML5 Games" }, desc: { ar: "ألعاب 2D و3D كاملة مع نظام نقاط ومستويات وتأثيرات صوتية", en: "Complete 2D/3D games with scoring, levels and sound effects" }, color: "text-pink-400", bg: "bg-pink-500/10" },
];

const EXAMPLES = [
  { ar: "ابني لي متجر عطور فاخر بتصميم أسود ذهبي مع سلة تسوق", en: "Build a luxury perfume store with black gold design and shopping cart" },
  { ar: "أنشئ موقع شركة تقنية عصري مع لوحة تحكم وإحصائيات", en: "Create a modern tech company website with dashboard and analytics" },
  { ar: "اصنع لعبة ويب 2D بسيطة بـ HTML5 Canvas مع نظام نقاط", en: "Make a 2D web game with HTML5 Canvas and scoring system" },
  { ar: "ابني بوت تليغرام لحجز المواعيد مع نظام دفع كريبتو", en: "Build a Telegram booking bot with crypto payment system" },
];

const PRICING = [
  {
    name: { ar: "مجاني", en: "Free" },
    price: "$0",
    period: { ar: "/شهر", en: "/month" },
    features: { ar: ["5 مشاريع/شهر", "الوكلاء الأساسية", "معاينة مباشرة", "تحميل ZIP"], en: ["5 projects/month", "Basic agents", "Live preview", "ZIP download"] },
    cta: { ar: "ابدأ مجاناً", en: "Start Free" },
    highlight: false,
  },
  {
    name: { ar: "احترافي", en: "Pro" },
    price: "$29",
    period: { ar: "/شهر", en: "/month" },
    features: { ar: ["مشاريع غير محدودة", "جميع الـ 27 وكيل", "Self-Healing Loop", "نشر تلقائي", "دعم أولوي"], en: ["Unlimited projects", "All 27 agents", "Self-Healing Loop", "Auto deploy", "Priority support"] },
    cta: { ar: "ابدأ الآن", en: "Start Now" },
    highlight: true,
  },
  {
    name: { ar: "مؤسسي", en: "Enterprise" },
    price: "$99",
    period: { ar: "/شهر", en: "/month" },
    features: { ar: ["كل مميزات Pro", "API مخصص", "نموذج AI خاص", "دعم 24/7", "SLA مضمون"], en: ["All Pro features", "Custom API", "Private AI model", "24/7 support", "Guaranteed SLA"] },
    cta: { ar: "تواصل معنا", en: "Contact Us" },
    highlight: false,
  },
];

export default function Home() {
  const { lang } = useLang();
  const isRTL = lang === "ar";
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    navigate(`/agent-builder?prompt=${encodeURIComponent(input.trim())}`);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-text">{lang === "ar" ? "الوكيل الذكي" : "AI Agent"}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-foreground transition-colors">
              {lang === "ar" ? "المميزات" : "Features"}
            </button>
            <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-foreground transition-colors">
              {lang === "ar" ? "الأسعار" : "Pricing"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </Button>
            <Button size="sm" className="gradient-primary text-white" onClick={() => navigate("/agent-builder")}>
              {lang === "ar" ? "ابدأ الآن" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            {lang === "ar" ? "27 وكيل ذكاء اصطناعي متخصص" : "27 Specialized AI Agents"}
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            {lang === "ar" ? (
              <>
                ابنِ <span className="gradient-text">أي شيء</span><br />
                بجملة واحدة
              </>
            ) : (
              <>
                Build <span className="gradient-text">Anything</span><br />
                With One Sentence
              </>
            )}
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            {lang === "ar"
              ? "منصة ذكاء اصطناعي تحول أفكارك إلى مواقع احترافية، بوتات، ألعاب، ومتاجر في دقائق — بدون كتابة كود واحد"
              : "AI platform that transforms your ideas into professional websites, bots, games, and stores in minutes — without writing a single line of code"}
          </p>

          {/* Main Input */}
          <div className="w-full max-w-2xl mx-auto mb-6">
            <div className={cn(
              "bg-card border-2 rounded-2xl transition-all duration-200 shadow-lg",
              focused ? "border-primary/50 shadow-primary/10" : "border-border hover:border-border/80"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder={lang === "ar" ? "صف مشروعك... مثال: ابني متجر عطور فاخر بتصميم أسود ذهبي" : "Describe your project... e.g. Build a luxury perfume store with black gold design"}
                className="w-full bg-transparent px-5 pt-4 pb-2 text-base text-foreground placeholder:text-muted-foreground/40 resize-none outline-none leading-relaxed"
                style={{ minHeight: "60px", maxHeight: "200px", direction: isRTL ? "rtl" : "ltr" }}
                rows={1}
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                  <Wand2 className="w-3 h-3" />
                  {lang === "ar" ? "اضغط Enter للبدء" : "Press Enter to start"}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className={cn(
                    "h-9 px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-150",
                    input.trim()
                      ? "gradient-primary text-white shadow-md hover:opacity-90 active:scale-95"
                      : "bg-muted/60 text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  {lang === "ar" ? "ابنِ الآن" : "Build Now"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setInput(lang === "ar" ? ex.ar : ex.en); textareaRef.current?.focus(); }}
                className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
              >
                <Zap className="w-3 h-3 inline me-1 text-primary/50" />
                {lang === "ar" ? ex.ar.slice(0, 40) + "..." : ex.en.slice(0, 40) + "..."}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{lang === "ar" ? "كل ما تحتاجه في مكان واحد" : "Everything You Need in One Place"}</h2>
            <p className="text-muted-foreground">{lang === "ar" ? "منصة متكاملة تغطي كل أنواع المشاريع الرقمية" : "Complete platform covering all types of digital projects"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-all group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", f.bg)}>
                  <f.icon className={cn("w-5 h-5", f.color)} />
                </div>
                <h3 className="font-semibold mb-2">{f.title[lang]}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{lang === "ar" ? "كيف يعمل؟" : "How Does It Work?"}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: MessageSquare, title: { ar: "صف مشروعك", en: "Describe Your Project" }, desc: { ar: "اكتب وصفاً بسيطاً لما تريد بناءه بالعربية أو الإنجليزية", en: "Write a simple description of what you want to build in Arabic or English" } },
              { step: "02", icon: Cpu, title: { ar: "الوكلاء يعملون", en: "Agents Get to Work" }, desc: { ar: "27 وكيل متخصص يعملون بالتوازي لبناء مشروعك خطوة بخطوة", en: "27 specialized agents work in parallel to build your project step by step" } },
              { step: "03", icon: FileCode2, title: { ar: "احصل على نتيجتك", en: "Get Your Result" }, desc: { ar: "معاينة فورية، تحميل الكود، أو نشر مباشر على الإنترنت", en: "Instant preview, download code, or deploy directly to the internet" } },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className="text-4xl font-black text-primary/10 mb-4">{item.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title[lang]}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc[lang]}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -end-3 w-6 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{lang === "ar" ? "أسعار شفافة وبسيطة" : "Transparent & Simple Pricing"}</h2>
            <p className="text-muted-foreground">{lang === "ar" ? "ابدأ مجاناً، ادفع عند الحاجة" : "Start free, pay when you need"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <div key={i} className={cn(
                "rounded-2xl p-6 border transition-all",
                plan.highlight
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5 scale-105"
                  : "bg-card border-border"
              )}>
                {plan.highlight && (
                  <div className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 inline-block mb-4">
                    {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name[lang]}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period[lang]}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features[lang].map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full", plan.highlight ? "gradient-primary text-white" : "")}
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => navigate("/agent-builder")}
                >
                  {plan.cta[lang]}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-border rounded-2xl p-10">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">
              {lang === "ar" ? "جاهز لبناء مشروعك؟" : "Ready to Build Your Project?"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {lang === "ar" ? "انضم إلى آلاف المستخدمين الذين يبنون مشاريعهم بالذكاء الاصطناعي" : "Join thousands of users building their projects with AI"}
            </p>
            <Button size="lg" className="gradient-primary text-white gap-2" onClick={() => navigate("/agent-builder")}>
              <Sparkles className="w-5 h-5" />
              {lang === "ar" ? "ابدأ مجاناً الآن" : "Start Free Now"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">{lang === "ar" ? "الوكيل الذكي" : "AI Agent"}</span>
          </div>
          <p className="text-xs text-muted-foreground/50">
            {lang === "ar" ? "منصة الوكيل الذكي — مستقلة 100% عن أي خدمة خارجية" : "AI Agent Platform — 100% Independent"}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</button>
            <button onClick={() => navigate("/agent-builder")} className="hover:text-foreground transition-colors">{lang === "ar" ? "البناء" : "Builder"}</button>
            <button onClick={() => navigate("/templates")} className="hover:text-foreground transition-colors">{lang === "ar" ? "القوالب" : "Templates"}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
