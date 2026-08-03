import { Link } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, ArrowRight, Globe, ShoppingCart, MessageSquare,
  Gamepad2, BookOpen, Code2, Palette, Brain, CheckCircle2,
  Zap, Shield, BarChart3, Layers, Star, ChevronRight,
  Play, Users, DollarSign, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: <Brain className="w-5 h-5" />, titleAr: "ذكاء اصطناعي متقدم", titleEn: "Advanced AI", descAr: "Claude + GPT-4o + DeepSeek مع Chain-of-Thought", descEn: "Claude + GPT-4o + DeepSeek with Chain-of-Thought" },
  { icon: <Layers className="w-5 h-5" />, titleAr: "11 وكيل متخصص", titleEn: "11 Specialized Agents", descAr: "تخطيط، برمجة، تصميم، محتوى، بوتات، ألعاب...", descEn: "Planning, Programming, Design, Content, Bots, Games..." },
  { icon: <Globe className="w-5 h-5" />, titleAr: "مشاريع متنوعة", titleEn: "Diverse Projects", descAr: "مواقع، متاجر، بوتات، ألعاب، كتب من برومبت واحد", descEn: "Websites, stores, bots, games, books from one prompt" },
  { icon: <Shield className="w-5 h-5" />, titleAr: "فحص أمان تلقائي", titleEn: "Auto Security Scan", descAr: "XSS, SQL Injection, CSRF, CORS بعد كل تعديل", descEn: "XSS, SQL Injection, CSRF, CORS after every edit" },
  { icon: <DollarSign className="w-5 h-5" />, titleAr: "نظام دفع متكامل", titleEn: "Complete Payment System", descAr: "USDT, BTC, ETH, TON + Stripe + Paymob", descEn: "USDT, BTC, ETH, TON + Stripe + Paymob" },
  { icon: <BarChart3 className="w-5 h-5" />, titleAr: "تحليلات ومراقبة", titleEn: "Analytics & Monitoring", descAr: "تكلفة كل مشروع، استهلاك API، تقارير دورية", descEn: "Per-project cost, API usage, periodic reports" },
];

const PROJECT_TYPES = [
  { icon: <Globe className="w-6 h-6" />, labelAr: "موقع شركة", labelEn: "Company Website", color: "text-blue-400 bg-blue-500/10" },
  { icon: <ShoppingCart className="w-6 h-6" />, labelAr: "متجر إلكتروني", labelEn: "E-commerce Store", color: "text-green-400 bg-green-500/10" },
  { icon: <MessageSquare className="w-6 h-6" />, labelAr: "بوت تليغرام", labelEn: "Telegram Bot", color: "text-sky-400 bg-sky-500/10" },
  { icon: <Gamepad2 className="w-6 h-6" />, labelAr: "لعبة ويب", labelEn: "Web Game", color: "text-purple-400 bg-purple-500/10" },
  { icon: <BookOpen className="w-6 h-6" />, labelAr: "كتاب 150+ صفحة", labelEn: "150+ Page Book", color: "text-orange-400 bg-orange-500/10" },
  { icon: <Code2 className="w-6 h-6" />, labelAr: "تطبيق SaaS", labelEn: "SaaS Application", color: "text-pink-400 bg-pink-500/10" },
];

export default function Home() {
  const { lang, changeLang, isRTL } = useLang();

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">
              {lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              <button onClick={() => changeLang("ar")} className={cn("text-xs px-2 py-1 rounded-md transition-all", lang === "ar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>AR</button>
              <button onClick={() => changeLang("en")} className={cn("text-xs px-2 py-1 rounded-md transition-all", lang === "en" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>EN</button>
            </div>
            <Link href="/dashboard">
              <Button size="sm" className="gradient-primary text-white gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === "ar" ? "ابدأ الآن" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container text-center relative">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 me-1.5" />
            {lang === "ar" ? "منصة AI متكاملة ومستقلة" : "Fully Independent AI Platform"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {lang === "ar" ? (
              <>
                <span className="text-gradient">برومبت واحد</span>
                <br />
                <span className="text-foreground">مشروع كامل جاهز</span>
              </>
            ) : (
              <>
                <span className="text-gradient">One Prompt</span>
                <br />
                <span className="text-foreground">Complete Ready Project</span>
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            {lang === "ar"
              ? "منصة وكيل ذكاء اصطناعي متكاملة تبني لك مواقع، متاجر، بوتات، ألعاب، وكتب من برومبت واحد. مستقلة بالكامل وقابلة للنشر على سيرفرك."
              : "A comprehensive AI agent platform that builds websites, stores, bots, games, and books from a single prompt. Fully independent and deployable on your server."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="gradient-primary text-white gap-2 px-8 glow-primary">
                <Sparkles className="w-5 h-5" />
                {lang === "ar" ? "ابدأ مشروعك الأول" : "Start Your First Project"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <Play className="w-4 h-4" />
                {lang === "ar" ? "استعراض المنصة" : "Explore Platform"}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
            {[
              { value: "11", label: lang === "ar" ? "وكيل متخصص" : "Specialized Agents" },
              { value: "30+", label: lang === "ar" ? "قالب جاهز" : "Ready Templates" },
              { value: "8+", label: lang === "ar" ? "عملة رقمية" : "Crypto Currencies" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="py-16 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">
              {lang === "ar" ? "ماذا يمكنك بناؤه؟" : "What Can You Build?"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {lang === "ar" ? "كل شيء من برومبت واحد" : "Everything from a single prompt"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROJECT_TYPES.map((type, i) => (
              <Link key={i} href="/chat">
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-center group">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", type.color)}>
                    {type.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {lang === "ar" ? type.labelAr : type.labelEn}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              {lang === "ar" ? "كل ما تحتاجه في مكان واحد" : "Everything You Need in One Place"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "ar" ? "منصة متكاملة ومستقلة بالكامل" : "Fully integrated and independent platform"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">
                  {lang === "ar" ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar" ? feature.descAr : feature.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {lang === "ar" ? "ابدأ الآن مجاناً" : "Start Now for Free"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {lang === "ar"
                ? "منصتك الخاصة المستقلة — أضف مفاتيح API الخاصة بك وابدأ البناء فوراً"
                : "Your own independent platform — add your API keys and start building immediately"}
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gradient-primary text-white gap-2 px-10 glow-primary">
                <Sparkles className="w-5 h-5" />
                {lang === "ar" ? "الدخول إلى المنصة" : "Enter Platform"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>{lang === "ar" ? "منصة الوكيل الذكي" : "AI Agent Platform"}</span>
          </div>
          <p>{lang === "ar" ? "مستقل بالكامل • قابل للنقل • مفتوح المصدر" : "Fully Independent • Portable • Open Source"}</p>
        </div>
      </footer>
    </div>
  );
}
