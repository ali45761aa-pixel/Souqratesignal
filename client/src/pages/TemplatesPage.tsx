import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe, ShoppingCart, Layout, BarChart3, MessageSquare,
  BookOpen, User, Layers, Gamepad2, Smartphone, Search,
  Star, Zap, ArrowRight, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  company_website: <Globe className="w-5 h-5" />,
  ecommerce: <ShoppingCart className="w-5 h-5" />,
  landing_page: <Layout className="w-5 h-5" />,
  dashboard: <BarChart3 className="w-5 h-5" />,
  telegram_bot: <MessageSquare className="w-5 h-5" />,
  blog: <BookOpen className="w-5 h-5" />,
  portfolio: <User className="w-5 h-5" />,
  saas: <Layers className="w-5 h-5" />,
  web_game: <Gamepad2 className="w-5 h-5" />,
  mobile_game: <Smartphone className="w-5 h-5" />,
};

// Built-in template data (shown when DB is empty)
const BUILTIN_TEMPLATES = [
  { id: 1, name: "Modern Company", nameAr: "موقع شركة عصري", category: "company_website", theme: "modern", description: "Clean modern company website", descriptionAr: "موقع شركة نظيف وعصري", features: ["SEO", "Blog", "Contact", "Portfolio"], usageCount: 142, preview: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80&auto=format&fit=crop" },
  { id: 2, name: "Bold Agency", nameAr: "وكالة جريئة", category: "company_website", theme: "bold", description: "Bold agency website", descriptionAr: "موقع وكالة جريء", features: ["Hero", "Services", "Team", "CTA"], usageCount: 98, preview: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80&auto=format&fit=crop" },
  { id: 3, name: "E-commerce Pro", nameAr: "متجر احترافي", category: "ecommerce", theme: "modern", description: "Full e-commerce with payments", descriptionAr: "متجر كامل مع نظام دفع", features: ["Cart", "Payments", "Inventory", "Orders"], usageCount: 215, preview: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80&auto=format&fit=crop" },
  { id: 4, name: "Fashion Store", nameAr: "متجر أزياء", category: "ecommerce", theme: "minimal", description: "Elegant fashion store", descriptionAr: "متجر أزياء أنيق", features: ["Gallery", "Wishlist", "Reviews", "Filters"], usageCount: 167, preview: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80&auto=format&fit=crop" },
  { id: 5, name: "SaaS Landing", nameAr: "صفحة SaaS", category: "landing_page", theme: "modern", description: "High-converting SaaS landing", descriptionAr: "صفحة هبوط SaaS عالية التحويل", features: ["Hero", "Features", "Pricing", "FAQ"], usageCount: 189, preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80&auto=format&fit=crop" },
  { id: 6, name: "Admin Dashboard", nameAr: "لوحة تحكم", category: "dashboard", theme: "modern", description: "Full admin dashboard", descriptionAr: "لوحة تحكم كاملة", features: ["Charts", "Tables", "CRUD", "Auth"], usageCount: 134, preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80&auto=format&fit=crop" },
  { id: 7, name: "Telegram Bot", nameAr: "بوت تليغرام", category: "telegram_bot", theme: "minimal", description: "Booking & payment bot", descriptionAr: "بوت حجز ودفع", features: ["Booking", "Payments", "Notifications", "Support"], usageCount: 87, preview: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80&auto=format&fit=crop" },
  { id: 8, name: "Tech Blog", nameAr: "مدونة تقنية", category: "blog", theme: "minimal", description: "Clean tech blog", descriptionAr: "مدونة تقنية نظيفة", features: ["CMS", "SEO", "Comments", "Newsletter"], usageCount: 76, preview: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80&auto=format&fit=crop" },
  { id: 9, name: "Creative Portfolio", nameAr: "بورتفوليو إبداعي", category: "portfolio", theme: "bold", description: "Creative portfolio", descriptionAr: "بورتفوليو إبداعي", features: ["Gallery", "About", "Contact", "Animations"], usageCount: 123, preview: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80&auto=format&fit=crop" },
  { id: 10, name: "SaaS App", nameAr: "تطبيق SaaS", category: "saas", theme: "modern", description: "Full SaaS with subscriptions", descriptionAr: "تطبيق SaaS مع اشتراكات", features: ["Auth", "Billing", "Dashboard", "API"], usageCount: 201, preview: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80&auto=format&fit=crop" },
  { id: 11, name: "2D Web Game", nameAr: "لعبة 2D", category: "web_game", theme: "bold", description: "2D browser game", descriptionAr: "لعبة متصفح 2D", features: ["Phaser.js", "Leaderboard", "Levels", "Sound"], usageCount: 45, preview: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80&auto=format&fit=crop" },
  { id: 12, name: "3D Game", nameAr: "لعبة 3D", category: "web_game", theme: "bold", description: "3D browser game", descriptionAr: "لعبة متصفح 3D", features: ["Babylon.js", "Physics", "Multiplayer", "Assets"], usageCount: 38, preview: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80&auto=format&fit=crop" },
];

const THEME_COLORS: Record<string, string> = {
  minimal: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  bold: "bg-red-500/10 text-red-400 border-red-500/20",
  modern: "bg-primary/10 text-primary border-primary/20",
};

export default function TemplatesPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: dbTemplates } = trpc.templates.list.useQuery();
  const templates = (dbTemplates && dbTemplates.length > 0) ? dbTemplates : BUILTIN_TEMPLATES;

  const categories = ["all", ...Array.from(new Set(BUILTIN_TEMPLATES.map(t => t.category)))];

  const filtered = templates.filter(tpl => {
    const name = lang === "ar" ? (tpl.nameAr ?? tpl.name) : tpl.name;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || tpl.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold">{tr.templates.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === "ar" ? `${templates.length} قالب جاهز للاستخدام` : `${templates.length} ready-to-use templates`}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tr.common.search}
            className="ps-9 bg-card"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              activeCategory === cat
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-primary/20"
            )}
          >
            {cat !== "all" && CATEGORY_ICONS[cat]}
            {cat === "all"
              ? (lang === "ar" ? "الكل" : "All")
              : (lang === "ar"
                ? (({ company_website:"شركات", ecommerce:"متاجر", landing_page:"هبوط", dashboard:"لوحات", telegram_bot:"بوتات", blog:"مدونات", portfolio:"بورتفوليو", saas:"SaaS", web_game:"ألعاب ويب", mobile_game:"ألعاب موبايل" } as Record<string,string>)[cat] ?? cat)
                : cat.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tpl) => (
          <Card key={tpl.id} className="bg-card border-border hover:border-primary/30 transition-all duration-200 group overflow-hidden">
            {/* Preview Image Placeholder */}
            <div className="h-36 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
              {(tpl as any).preview ? (
                <img src={(tpl as any).preview} alt={(lang === "ar" ? (tpl.nameAr ?? tpl.name) : tpl.name) as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="text-muted-foreground/30 flex items-center justify-center w-full h-full">${(CATEGORY_ICONS[tpl.category] as any)?.props ? '' : ''}</div>`; }} />
              ) : (
                <div className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300">
                  {CATEGORY_ICONS[tpl.category]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                <Button size="sm" variant="secondary" className="text-xs h-7 gap-1" onClick={() => toast.info("Preview coming soon")}>
                  <Eye className="w-3 h-3" /> {tr.templates.preview}
                </Button>
                <Link href={`/chat?template=${tpl.id}`}>
                  <Button size="sm" className="text-xs h-7 gap-1 gradient-primary text-white">
                    <Zap className="w-3 h-3" /> {tr.templates.useTemplate}
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold leading-tight">
                  {lang === "ar" ? (tpl.nameAr ?? tpl.name) : tpl.name}
                </h3>
                <Badge variant="outline" className={cn("text-xs shrink-0", THEME_COLORS[tpl.theme ?? "modern"])}>
                  {lang === "ar"
                    ? { minimal:"بسيط", bold:"جريء", modern:"عصري" }[tpl.theme ?? "modern"]
                    : tpl.theme}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {lang === "ar" ? (tpl.descriptionAr ?? tpl.description) : tpl.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(tpl.features as string[]).slice(0, 3).map((f, i) => (
                  <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{tpl.usageCount} {lang === "ar" ? "استخدام" : "uses"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {CATEGORY_ICONS[tpl.category]}
                  <span className="capitalize">{tpl.category.replace(/_/g, " ")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
