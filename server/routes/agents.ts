import { getModelForAgent, callWithBestModel } from "../lib/modelRouter";
import { planCache, makeCacheKey } from "../lib/cache";
import { Router, Request, Response } from "express";
import { buildThinkingPrompt, observeAndDecide, LOOP_PHASES } from "../lib/agentLoop";
import { detectTheme, generateDesignSystemCSS, getDesignInstructions, getUnsplashPhotos, DESIGN_THEMES } from '../lib/designSystem';
import { searchUnsplashImages } from '../lib/integrations';
const agentsRouter = Router();

// ── Agent Definitions ─────────────────────────────────────────────────────────
export const AGENTS = {
  analyzer: {
    id: "analyzer", icon: "🧠",
    nameAr: "وكيل التحليل", nameEn: "Analyzer Agent",
    descAr: "يحلل المتطلبات ويولّد خطة عمل مفصّلة",
    descEn: "Analyzes requirements and generates detailed work plan",
    color: "violet",
  },
  designer: {
    id: "designer", icon: "🎨",
    nameAr: "وكيل التصميم", nameEn: "Design Agent",
    descAr: "يختار الألوان والخطوط والهوية البصرية",
    descEn: "Chooses colors, fonts and visual identity",
    color: "pink",
  },
  frontend: {
    id: "frontend", icon: "💻",
    nameAr: "وكيل Frontend", nameEn: "Frontend Agent",
    descAr: "يبني HTML/CSS/JS الاحترافي",
    descEn: "Builds professional HTML/CSS/JS",
    color: "blue",
  },
  backend: {
    id: "backend", icon: "⚙️",
    nameAr: "وكيل Backend", nameEn: "Backend Agent",
    descAr: "يبني Node.js API وسيرفر Express",
    descEn: "Builds Node.js API and Express server",
    color: "green",
  },
  database: {
    id: "database", icon: "🗄️",
    nameAr: "وكيل قاعدة البيانات", nameEn: "Database Agent",
    descAr: "يصمم DB schema ويكتب SQL migrations",
    descEn: "Designs DB schema and writes SQL migrations",
    color: "orange",
  },
  security: {
    id: "security", icon: "🔐",
    nameAr: "وكيل الأمان", nameEn: "Security Agent",
    descAr: "يضيف Auth وحماية XSS/CSRF/SQL Injection",
    descEn: "Adds Auth and XSS/CSRF/SQL Injection protection",
    color: "red",
  },
  content: {
    id: "content", icon: "📝",
    nameAr: "وكيل المحتوى", nameEn: "Content Agent",
    descAr: "يكتب النصوص والمحتوى الاحترافي",
    descEn: "Writes professional texts and content",
    color: "yellow",
  },
  bot: {
    id: "bot", icon: "🤖",
    nameAr: "وكيل البوتات", nameEn: "Bot Agent",
    descAr: "يبني بوتات تليغرام بـ Python",
    descEn: "Builds Telegram bots with Python",
    color: "sky",
  },
  game: {
    id: "game", icon: "🎮",
    nameAr: "وكيل الألعاب", nameEn: "Game Agent",
    descAr: "يبني ألعاب ويب بـ HTML5 Canvas",
    descEn: "Builds web games with HTML5 Canvas",
    color: "purple",
  },
  payment: {
    id: "payment", icon: "💳",
    nameAr: "وكيل الدفع", nameEn: "Payment Agent",
    descAr: "يدمج Stripe وCrypto وPaymob",
    descEn: "Integrates Stripe, Crypto and Paymob",
    color: "emerald",
  },
  analytics: {
    id: "analytics", icon: "📊",
    nameAr: "وكيل التحليلات", nameEn: "Analytics Agent",
    descAr: "يضيف تتبع الزوار والإحصائيات",
    descEn: "Adds visitor tracking and statistics",
    color: "cyan",
  },
  seo: {
    id: "seo", icon: "🔍",
    nameAr: "وكيل SEO", nameEn: "SEO Agent",
    descAr: "يحسّن للمحركات ويضيف meta tags",
    descEn: "Optimizes for search engines and adds meta tags",
    color: "lime",
  },
  mobile: {
    id: "mobile", icon: "📱",
    nameAr: "وكيل الموبايل", nameEn: "Mobile Agent",
    descAr: "يجعل التصميم متجاوباً مع كل الأجهزة",
    descEn: "Makes design responsive for all devices",
    color: "teal",
  },
  tester: {
    id: "tester", icon: "🧪",
    nameAr: "وكيل الاختبار", nameEn: "Testing Agent",
    descAr: "يختبر الكود ويصحح الأخطاء تلقائياً",
    descEn: "Tests code and auto-fixes bugs",
    color: "amber",
  },
  docs: {
    id: "docs", icon: "📚",
    nameAr: "وكيل التوثيق", nameEn: "Docs Agent",
    descAr: "يكتب README وتوثيق API كامل",
    descEn: "Writes README and complete API documentation",
    color: "slate",
  },
  deployer: {
    id: "deployer", icon: "🚀",
    nameAr: "وكيل النشر", nameEn: "Deploy Agent",
    descAr: "يجهّز للنشر على Vercel وContabo",
    descEn: "Prepares for deployment on Vercel and Contabo",
    color: "indigo",
  },
  optimizer: {
    id: "optimizer", icon: "🔄",
    nameAr: "وكيل التحسين", nameEn: "Optimizer Agent",
    descAr: "يحسّن الأداء وسرعة التحميل",
    descEn: "Optimizes performance and load speed",
    color: "rose",
  },
  memory: {
    id: "memory", icon: "💬",
    nameAr: "وكيل الذاكرة", nameEn: "Memory Agent",
    descAr: "يحفظ السياق ويجيب عن المشروع",
    descEn: "Saves context and answers about the project",
    color: "fuchsia",
  },
  reviewer: {
    id: "reviewer", icon: "🔎",
    nameAr: "وكيل المراجعة", nameEn: "Review Agent",
    descAr: "يراجع الكود بالكامل ويكتشف الأخطاء والمشاكل ويصلحها فوراً",
    descEn: "Reviews all code, finds bugs and issues, and fixes them immediately",
    color: "amber",
  },
  auditor: {
    id: "auditor", icon: "🛡️",
    nameAr: "وكيل التدقيق العميق", nameEn: "Deep Audit Agent",
    descAr: "تدقيق شامل وعميق في كل التفاصيل الصغيرة: أمان، أداء، UX، accessibility، responsive، SEO، clean code",
    descEn: "Deep comprehensive audit of every small detail: security, performance, UX, accessibility, responsive, SEO, clean code",
    color: "red",
  },
  strategy: {
    id: "strategy", icon: "🎯",
    nameAr: "وكيل استراتيجية المنتج", nameEn: "Product Strategy Agent",
    descAr: "يحلل السوق والمنافسين ويضع استراتيجية منتج كاملة مع خارطة طريق",
    descEn: "Analyzes market and competitors, builds complete product strategy with roadmap",
    color: "blue",
  },
  ux: {
    id: "ux", icon: "🧩",
    nameAr: "وكيل UX وتجربة المستخدم", nameEn: "UX Agent",
    descAr: "يصمم User Journey وWireframes وUser Flows ويحدد نقاط الألم والحلول",
    descEn: "Designs User Journey, Wireframes, User Flows, identifies pain points and solutions",
    color: "purple",
  },
  brand: {
    id: "brand", icon: "🎨",
    nameAr: "وكيل هوية العلامة التجارية", nameEn: "Brand Identity Agent",
    descAr: "يبني Brand Identity كاملة: ألوان، خطوط، شعار، أسلوب بصري، voice & tone",
    descEn: "Builds complete Brand Identity: colors, fonts, logo concept, visual style, voice & tone",
    color: "pink",
  },
  solutions: {
    id: "solutions", icon: "💡",
    nameAr: "وكيل اكتشاف الحلول", nameEn: "Solutions Discovery Agent",
    descAr: "يحلل المشكلة بعمق ويقترح 3-5 حلول مختلفة مع مقارنة شاملة للمزايا والعيوب",
    descEn: "Deeply analyzes the problem and proposes 3-5 different solutions with comprehensive pros/cons comparison",
    color: "yellow",
  },
  architect: {
    id: "architect", icon: "📐",
    nameAr: "وكيل هندسة المعمارية", nameEn: "Architecture Agent",
    descAr: "يصمم System Architecture وData Flow وAPI Design وDatabase Schema بشكل احترافي",
    descEn: "Designs System Architecture, Data Flow, API Design, and Database Schema professionally",
    color: "cyan",
  },
  research: {
    id: "research", icon: "🔬",
    nameAr: "وكيل بحث المستخدمين", nameEn: "User Research Agent",
    descAr: "يحلل الجمهور المستهدف ويبني User Personas وCustomer Journey Map",
    descEn: "Analyzes target audience, builds User Personas and Customer Journey Map",
    color: "teal",
  },
  innovation: {
    id: "innovation", icon: "⚡",
    nameAr: "وكيل الابتكار", nameEn: "Innovation Agent",
    descAr: "يولّد أفكاراً إبداعية غير تقليدية وميزات مبتكرة لتمييز المشروع عن المنافسين",
    descEn: "Generates unconventional creative ideas and innovative features to differentiate the project",
    color: "orange",
  },
  fixer: {
    id: "fixer", icon: "🔧",
    nameAr: "وكيل إصلاح الأخطاء", nameEn: "Error Fixer Agent",
    descAr: "يكتشف ويصلح جميع الأخطاء تلقائياً: JS errors, CSS bugs, broken links, missing images, responsive issues",
    descEn: "Detects and fixes all errors automatically: JS errors, CSS bugs, broken links, missing images, responsive issues",
    color: "emerald",
  },
};

// ── Plan Generator ────────────────────────────────────────────────────────────
function generatePlan(prompt: string, lang: string): {
  id: string; agentId: string; titleAr: string; titleEn: string;
  descAr: string; descEn: string; estimatedTime: string;
}[] {
  const p = prompt.toLowerCase();
  const isBot = p.includes("بوت") || p.includes("bot") || p.includes("telegram");
  const isGame = p.includes("لعبة") || p.includes("game");
  const isFullstack = p.includes("full") || p.includes("تطبيق") || p.includes("app");
  const isEcommerce = p.includes("متجر") || p.includes("store") || p.includes("shop");
  const isDashboard = p.includes("لوحة") || p.includes("dashboard");

  const basePlan = [
    {
      id: "step-1", agentId: "analyzer",
      titleAr: "تحليل المتطلبات وخطة العمل",
      titleEn: "Requirements Analysis & Work Plan",
      descAr: "تحليل البرومبت واستخراج المتطلبات الكاملة وتحديد التقنيات المناسبة",
      descEn: "Analyzing prompt, extracting full requirements and identifying suitable technologies",
      estimatedTime: "5s",
    },
    {
      id: "step-knowledge", agentId: "research",
      titleAr: "جمع المعرفة وتحليل المنافسين",
      titleEn: "Knowledge Collection & Competitor Analysis",
      descAr: "البحث في أفضل المواقع المنافسة واستخراج أفضل الممارسات واتجاهات التصميم",
      descEn: "Researching top competitor sites and extracting best practices and design trends",
      estimatedTime: "10s",
    },
    {
      id: "step-sitemap", agentId: "architect",
      titleAr: "خريطة الموقع وهيكل الصفحات",
      titleEn: "Sitemap & Page Structure",
      descAr: "تحديد جميع الصفحات والعلاقات بينها وتدفق المستخدم",
      descEn: "Defining all pages, relationships between them and user flow",
      estimatedTime: "5s",
    },
    {
      id: "step-ux", agentId: "ux",
      titleAr: "تخطيط تجربة المستخدم",
      titleEn: "UX Planning",
      descAr: "تحديد مسار المستخدم وأماكن CTA والنماذج وتدفق التحويل",
      descEn: "Defining user journey, CTA placement, forms and conversion flow",
      estimatedTime: "8s",
    },
    {
      id: "step-wireframe", agentId: "solutions",
      titleAr: "Wireframe وهيكل الصفحة",
      titleEn: "Wireframe & Page Layout",
      descAr: "بناء مخطط تفصيلي لكل قسم قبل كتابة أي كود",
      descEn: "Building detailed layout plan for each section before writing any code",
      estimatedTime: "8s",
    },
    {
      id: "step-2", agentId: "designer",
      titleAr: "تصميم الهوية البصرية",
      titleEn: "Visual Identity Design",
      descAr: "اختيار لوحة الألوان والخطوط والأيقونات وأسلوب التصميم العام",
      descEn: "Choosing color palette, fonts, icons and overall design style",
      estimatedTime: "8s",
    },
    {
      id: "step-3", agentId: "content",
      titleAr: "كتابة المحتوى والنصوص",
      titleEn: "Content & Copywriting",
      descAr: "كتابة جميع النصوص والعناوين والأوصاف بأسلوب احترافي",
      descEn: "Writing all texts, headlines and descriptions in professional style",
      estimatedTime: "10s",
    },
    {
      id: "step-components", agentId: "brand",
      titleAr: "مكتبة المكونات",
      titleEn: "Component Library",
      descAr: "بناء Button وCard وNavbar وHero وFooter وPricing كمكونات مستقلة قابلة لإعادة الاستخدام",
      descEn: "Building Button, Card, Navbar, Hero, Footer and Pricing as independent reusable components",
      estimatedTime: "15s",
    },
    {
      id: "step-4", agentId: "frontend",
      titleAr: "بناء الواجهة الأمامية",
      titleEn: "Frontend Development",
      descAr: "بناء HTML/CSS/JavaScript الاحترافي مع Tailwind CSS وAlpine.js",
      descEn: "Building professional HTML/CSS/JavaScript with Tailwind CSS and Alpine.js",
      estimatedTime: "25s",
    },
    {
      id: "step-5", agentId: "mobile",
      titleAr: "تحسين التجاوب مع الأجهزة",
      titleEn: "Mobile Responsiveness",
      descAr: "ضمان عمل التصميم بشكل مثالي على الهاتف والتابلت والكمبيوتر",
      descEn: "Ensuring design works perfectly on mobile, tablet and desktop",
      estimatedTime: "5s",
    },
    {
      id: "step-6", agentId: "seo",
      titleAr: "تحسين محركات البحث",
      titleEn: "SEO Optimization",
      descAr: "إضافة meta tags وStructured Data وOpen Graph لتحسين الظهور في Google",
      descEn: "Adding meta tags, Structured Data and Open Graph for better Google ranking",
      estimatedTime: "5s",
    },
    {
      id: "step-7", agentId: "optimizer",
      titleAr: "تحسين الأداء والسرعة",
      titleEn: "Performance Optimization",
      descAr: "تحسين سرعة التحميل وضغط الصور وتقليل حجم الكود",
      descEn: "Improving load speed, compressing images and reducing code size",
      estimatedTime: "5s",
    },
    {
      id: "step-fix", agentId: "fixer",
      titleAr: "إصلاح جميع الأخطاء",
      titleEn: "Fix All Errors",
      descAr: "فحص شامل وإصلاح تلقائي لكل الأخطاء: JS, CSS, responsive, accessibility, broken links",
      descEn: "Comprehensive scan and auto-fix of all errors: JS, CSS, responsive, accessibility, broken links",
      estimatedTime: "15s",
    },
    {
      id: "step-8", agentId: "docs",
      titleAr: "توثيق المشروع",
      titleEn: "Project Documentation",
      descAr: "كتابة README.md شامل مع تعليمات التثبيت والاستخدام",
      descEn: "Writing comprehensive README.md with installation and usage instructions",
      estimatedTime: "5s",
    },
  ];

  if (isEcommerce) {
    basePlan.splice(4, 0, {
      id: "step-ec1", agentId: "payment",
      titleAr: "نظام الدفع والسلة",
      titleEn: "Payment & Cart System",
      descAr: "بناء سلة تسوق تفاعلية مع دعم Stripe وCrypto وPaymob",
      descEn: "Building interactive shopping cart with Stripe, Crypto and Paymob support",
      estimatedTime: "15s",
    });
  }

  if (isFullstack || isEcommerce || isDashboard) {
    basePlan.splice(4, 0,
      {
        id: "step-fs1", agentId: "backend",
        titleAr: "بناء الـ Backend وAPI",
        titleEn: "Backend & API Development",
        descAr: "بناء Node.js Express API مع endpoints كاملة وMiddleware",
        descEn: "Building Node.js Express API with complete endpoints and Middleware",
        estimatedTime: "20s",
      },
      {
        id: "step-fs2", agentId: "database",
        titleAr: "تصميم قاعدة البيانات",
        titleEn: "Database Design",
        descAr: "تصميم DB schema وكتابة SQL migrations وإعداد الاتصال",
        descEn: "Designing DB schema, writing SQL migrations and setting up connection",
        estimatedTime: "10s",
      },
      {
        id: "step-fs3", agentId: "security",
        titleAr: "الأمان والمصادقة",
        titleEn: "Security & Authentication",
        descAr: "إضافة JWT Auth وحماية XSS/CSRF وتشفير كلمات المرور",
        descEn: "Adding JWT Auth, XSS/CSRF protection and password encryption",
        estimatedTime: "10s",
      }
    );
  }

  if (isBot) {
    return [
      basePlan[0],
      {
        id: "step-bot1", agentId: "bot",
        titleAr: "بناء هيكل البوت",
        titleEn: "Bot Structure",
        descAr: "إنشاء handlers وCommands وConversationHandler الأساسية",
        descEn: "Creating handlers, Commands and basic ConversationHandler",
        estimatedTime: "20s",
      },
      {
        id: "step-bot2", agentId: "content",
        titleAr: "القوائم والرسائل التفاعلية",
        titleEn: "Interactive Menus & Messages",
        descAr: "بناء InlineKeyboard وReplyKeyboard والرسائل التفاعلية",
        descEn: "Building InlineKeyboard, ReplyKeyboard and interactive messages",
        estimatedTime: "15s",
      },
      {
        id: "step-bot3", agentId: "database",
        titleAr: "قاعدة بيانات البوت",
        titleEn: "Bot Database",
        descAr: "إعداد SQLite أو PostgreSQL لحفظ بيانات المستخدمين",
        descEn: "Setting up SQLite or PostgreSQL for saving user data",
        estimatedTime: "10s",
      },
      basePlan[basePlan.length - 1],
    ];
  }

  if (isGame) {
    return [
      basePlan[0],
      {
        id: "step-g1", agentId: "game",
        titleAr: "محرك اللعبة",
        titleEn: "Game Engine",
        descAr: "بناء Game Loop وPhysics وCollision Detection بـ HTML5 Canvas",
        descEn: "Building Game Loop, Physics and Collision Detection with HTML5 Canvas",
        estimatedTime: "30s",
      },
      {
        id: "step-g2", agentId: "designer",
        titleAr: "رسومات وتأثيرات اللعبة",
        titleEn: "Game Graphics & Effects",
        descAr: "تصميم الشخصيات والخلفيات والتأثيرات البصرية",
        descEn: "Designing characters, backgrounds and visual effects",
        estimatedTime: "15s",
      },
      {
        id: "step-g3", agentId: "content",
        titleAr: "نظام النقاط والمستويات",
        titleEn: "Score & Level System",
        descAr: "بناء نظام نقاط ومستويات وشاشات البداية والنهاية",
        descEn: "Building score, levels and start/end screens",
        estimatedTime: "10s",
      },
      basePlan[basePlan.length - 1],
    ];
  }

  // ── Mandatory quality steps at the end of EVERY plan ──────────────────────
  const accessibilityStep = {
    id: "step-a11y", agentId: "innovation",
    titleAr: "تحسين إمكانية الوصول",
    titleEn: "Accessibility Enhancement",
    descAr: "إضافة ARIA labels وContrast ratios وKeyboard navigation وScreen reader support",
    descEn: "Adding ARIA labels, contrast ratios, keyboard navigation and screen reader support",
    estimatedTime: "8s",
  };
  const finalPolishStep = {
    id: "step-polish", agentId: "strategy",
    titleAr: "اللمسات النهائية والتحسين الشامل",
    titleEn: "Final Polish & Enhancement",
    descAr: "إضافة Empty States وSkeleton Screens وError Pages وFavicon وManifest وPage Transitions",
    descEn: "Adding Empty States, Skeleton Screens, Error Pages, Favicon, Manifest and Page Transitions",
    estimatedTime: "10s",
  };
  const reviewerStep = {
    id: "step-reviewer", agentId: "reviewer",
    titleAr: "مراجعة الكود وإصلاح الأخطاء",
    titleEn: "Code Review & Bug Fixing",
    descAr: "مراجعة شاملة للكود وإصلاح أخطاء JavaScript والـ CSS وتحسين التصميم البصري",
    descEn: "Comprehensive code review, fixing JavaScript/CSS bugs and improving visual design",
    estimatedTime: "20s",
  };
  const auditorStep = {
    id: "step-auditor", agentId: "auditor",
    titleAr: "التدقيق العميق والتحسين النهائي",
    titleEn: "Deep Audit & Final Enhancement",
    descAr: "تدقيق الأمان والأداء والـ Accessibility وتحسين جمالي نهائي للوصول لمستوى احترافي",
    descEn: "Security, performance and accessibility audit plus final aesthetic enhancement to professional level",
    estimatedTime: "25s",
  };

  // Remove docs from end and add reviewer+auditor after it
  const docsStep = basePlan.find(s => s.agentId === "docs");
  const planWithoutDocs = basePlan.filter(s => s.agentId !== "docs");
  return docsStep
    ? [...planWithoutDocs, accessibilityStep, finalPolishStep, docsStep, reviewerStep, auditorStep]
    : [...planWithoutDocs, accessibilityStep, finalPolishStep, reviewerStep, auditorStep];
}

// ── Plan endpoint ─────────────────────────────────────────────────────────────
agentsRouter.post("/plan", async (req: Request, res: Response) => {
  const { prompt, lang = "ar" } = req.body;
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    // Fallback to static plan if no API key
    const plan = generatePlan(prompt, lang);
    res.json({ plan, totalSteps: plan.length });
    return;
  }

  // LLM-powered dynamic plan generation
  try {
    const isAr = lang === "ar";
    const systemPrompt = isAr
      ? `أنت خبير تخطيط مشاريع رقمية. مهمتك تحليل طلب المستخدم وإنشاء خطة عمل مفصّلة ومخصصة.

أرجع JSON array فقط بدون أي نص آخر. كل عنصر يحتوي:
- id: معرف فريد (step-1, step-2, ...)
- agentId: أحد الوكلاء التالية فقط: analyzer, research, architect, ux, solutions, designer, brand, content, frontend, mobile, seo, optimizer, docs, backend, database, security, bot, game, payment, analytics, tester, deployer, memory, innovation, strategy, reviewer, auditor
- titleAr: عنوان الخطوة بالعربية (قصير ومحدد)
- titleEn: عنوان الخطوة بالإنجليزية
- descAr: وصف تفصيلي لما سيفعله الوكيل (جملتان على الأقل)
- descEn: الوصف بالإنجليزية
- estimatedTime: الوقت التقديري (مثل "10s", "25s")
- dependencies: array من الـ ids التي يعتمد عليها (مثل ["step-1"])

قواعد:
1. حلّل المتطلبات بدقة — لا تضف خطوات غير ضرورية
2. رتّب الخطوات منطقياً (التحليل أولاً، ثم التصميم، ثم البناء)
3. اختر الوكلاء المناسبين فقط — لا تستخدم كل الوكلاء
4. لمشروع بسيط: 4-6 خطوات. لمشروع معقد: 8-12 خطوة
5. أضف دائماً خطوة "reviewer" قبل الأخيرة لمراجعة الكود وإصلاح الأخطاء
6. أضف دائماً خطوة "auditor" كآخر خطوة للتدقيق العميق في كل التفاصيل
7. أضف "docs" فقط للمشاريع الكبيرة`
      : `You are a digital project planning expert. Analyze the user's request and create a detailed, customized work plan.

Return ONLY a JSON array with no other text. Each element contains:
- id: unique identifier (step-1, step-2, ...)
- agentId: one of: analyzer, research, architect, ux, solutions, designer, brand, content, frontend, mobile, seo, optimizer, docs, backend, database, security, bot, game, payment, analytics, tester, deployer, memory, innovation, strategy, reviewer, auditor
- titleAr: step title in Arabic (short and specific)
- titleEn: step title in English
- descAr: detailed description of what the agent will do (at least 2 sentences)
- descEn: description in English
- estimatedTime: estimated time (like "10s", "25s")
- dependencies: array of ids this step depends on (like ["step-1"])

Rules:
1. Analyze requirements precisely — don't add unnecessary steps
2. Order steps logically (analysis first, then design, then build)
3. Choose only appropriate agents — don't use all agents
4. Simple project: 4-6 steps. Complex project: 8-12 steps
5. Always add a "reviewer" step as second-to-last to review code and fix bugs
6. Always add an "auditor" step as the LAST step for deep comprehensive audit
7. Add "docs" only for large projects`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      // Fallback to static
      const plan = generatePlan(prompt, lang);
      res.json({ plan, totalSteps: plan.length });
      return;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || "";

    // Parse LLM response
    let llmPlan: any[];
    try {
      const parsed = JSON.parse(content);
      llmPlan = Array.isArray(parsed) ? parsed : parsed.plan || parsed.steps || [];
    } catch (_e) {
      // Try to extract array from content
      const match = content.match(/\[[\s\S]*\]/);
      if (match) { llmPlan = JSON.parse(match[0]); }
      else { llmPlan = []; }
    }

    if (llmPlan.length === 0) {
      // Fallback
      const plan = generatePlan(prompt, lang);
      res.json({ plan, totalSteps: plan.length });
      return;
    }

    // Validate and normalize
    const validAgents = Object.keys(AGENTS);
    const plan = llmPlan
      .filter((s: any) => s.agentId && validAgents.includes(s.agentId))
      .map((s: any, i: number) => ({
        id: s.id || `step-${i + 1}`,
        agentId: s.agentId,
        titleAr: s.titleAr || s.title || `خطوة ${i + 1}`,
        titleEn: s.titleEn || s.title || `Step ${i + 1}`,
        descAr: s.descAr || s.description || "",
        descEn: s.descEn || s.description || "",
        estimatedTime: s.estimatedTime || "10s",
        dependencies: s.dependencies || [],
      }));

    res.json({ plan, totalSteps: plan.length, dynamic: true });
  } catch (err: any) {
    // Fallback to static plan on any error
    const plan = generatePlan(prompt, lang);
    res.json({ plan, totalSteps: plan.length });
  }
});

// ── Execute single agent step with streaming ─────────────────────────────────
agentsRouter.post("/execute-step", async (req: Request, res: Response) => {
  const { prompt, stepId, agentId, lang = "ar", projectContext = "", conversationHistory = [], previousFiles = [], previousResults = [] } = req.body;
  if (!prompt || !agentId) { res.status(400).json({ error: "prompt and agentId required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  const agent = AGENTS[agentId as keyof typeof AGENTS];
  if (!agent) { res.status(400).json({ error: "Unknown agent" }); return; }

  // Build rich context from previous files
  let richContext = projectContext;
  if (previousFiles && previousFiles.length > 0) {
    richContext += "\n\n=== الملفات المبنية حتى الآن ===\n";
    for (const file of previousFiles.slice(-5)) {
      richContext += `\n--- ${file.name} ---\n${file.content.slice(0, 2000)}\n`;
    }
  }

  // ── Manus-style Agent Loop: inject thinking framework ──────────────────────
  const agentName = lang === "ar" ? agent.nameAr : agent.nameEn;
  const baseAgentPrompt = await buildAgentPrompt(agentId, prompt, lang, richContext);
  const thinkingPrefix = buildThinkingPrompt(agentId, agentName, prompt, richContext, previousResults ?? [], lang);
  const systemPrompt = thinkingPrefix + "\n\n" + baseAgentPrompt;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: "user", content: `المشروع: ${prompt}\n\nنفّذ مهمتك كـ ${lang === "ar" ? agent.nameAr : agent.nameEn}` },
    ];

    // Use reasoner model for analysis/design agents, chat for code agents
    // ── Model Router: Claude for visual/creative agents, DeepSeek for others ──
    const useClaude = getModelForAgent(agentId) === "claude" && !!process.env.ANTHROPIC_API_KEY;
    const useReasoner = !useClaude && ["analyzer", "designer", "security", "tester", "optimizer", "strategy", "ux", "brand", "solutions", "architect", "research", "innovation", "auditor"].includes(agentId);
    const modelLabel = useClaude ? "claude-sonnet-4.5" : (useReasoner ? "deepseek-reasoner" : "deepseek-chat");

    // Send thinking start event
    res.write(`data: ${JSON.stringify({ type: "thinking_start", model: modelLabel })}\n\n`);

    let response: globalThis.Response;
    if (useClaude) {
      // Use Claude API for frontend/reviewer/auditor/designer/ux/brand/innovation/strategy agents
      const claudeKey = process.env.ANTHROPIC_API_KEY!;
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": claudeKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        signal: AbortSignal.timeout(180000),
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 64000,
          temperature: 0.7,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: `المشروع: ${prompt}\n\nنفّذ مهمتك كـ ${lang === "ar" ? agent.nameAr : agent.nameEn}` }],
        }),
      });
    } else {
      // Use DeepSeek for analysis/content/SEO/backend agents
      const dsModel = useReasoner ? "deepseek-reasoner" : "deepseek-chat";
      response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        signal: AbortSignal.timeout(180000),
        body: JSON.stringify({ model: dsModel, messages, max_tokens: useReasoner ? 12000 : 8000, temperature: useReasoner ? 0.5 : 0.6, stream: true }),
      });
    }

    if (!response.ok) { res.write(`data: ${JSON.stringify({ type: "error", message: await response.text() })}\n\n`); res.end(); return; }

    const reader = response.body?.getReader();
    if (!reader) { res.end(); return; }

    const decoder = new TextDecoder();
    let fullContent = "";
    let thinkingContent = "";
    let isInThinking = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);

          // ── Claude SSE format ──
          if (useClaude) {
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              fullContent += parsed.delta.text;
              res.write(`data: ${JSON.stringify({ type: "chunk", content: parsed.delta.text })}\n\n`);
            }
            continue;
          }

          // ── DeepSeek SSE format ──
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.reasoning_content) {
            thinkingContent += delta.reasoning_content;
            if (!isInThinking) isInThinking = true;
            res.write(`data: ${JSON.stringify({ type: "thinking", content: delta.reasoning_content })}\n\n`);
          }
          if (delta?.content) {
            if (isInThinking) {
              isInThinking = false;
              res.write(`data: ${JSON.stringify({ type: "thinking_done", thinkingLength: thinkingContent.length })}\n\n`);
            }
            fullContent += delta.content;
            res.write(`data: ${JSON.stringify({ type: "chunk", content: delta.content })}\n\n`);
          }
        } catch (_e) { /* intentional */ }
      }
    }

    // Extract code files from content
    // ── Continuation System: detect truncated HTML and request completion ──────
    let finalContent = fullContent;
    const isHtmlAgent = ["frontend", "reviewer", "auditor"].includes(agentId);
    if (isHtmlAgent && fullContent.length > 1000) {
      const hasClosingHtml = finalContent.includes("</html>");
      const hasClosingBody = finalContent.includes("</body>");
      const openCount = (finalContent.match(/<[a-z][a-z0-9]*/gi) || []).length;
      const closeCount = (finalContent.match(/<\/[a-z][a-z0-9]*/gi) || []).length;
      const isTruncated = !hasClosingHtml || !hasClosingBody || (openCount > closeCount + 20);
      if (isTruncated) {
        res.write(`data: ${JSON.stringify({ type: "continuation_start", message: "Completing truncated HTML..." })}\n\n`);
        try {
          // Use same model for continuation to maintain style consistency
          const contUrl = useClaude ? "https://api.anthropic.com/v1/messages" : "https://api.deepseek.com/chat/completions";
          const contHeaders = useClaude 
            ? { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" }
            : { "Content-Type": "application/json", "Authorization": `Bearer ${key}` };
          const contBody = useClaude
            ? JSON.stringify({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 32000,
                temperature: 0.1,
                stream: true,
                system: "You are completing an HTML document that was cut off. Continue EXACTLY from where it stopped. Do NOT repeat any content already written. Do NOT add explanations. Output HTML code only.",
                messages: [{ role: "user", content: "Here is the HTML so far (continue from where it ends):\n\n" + fullContent.slice(-8000) + "\n\nContinue from exactly where you stopped. Complete all remaining pages/sections, close all open tags, and end with </body></html>." }],
              })
            : JSON.stringify({
                model: "deepseek-chat",
                messages: [
                  { role: "system", content: "You are completing an HTML document that was cut off. Continue EXACTLY from where it stopped. Do NOT repeat any content already written. Do NOT add explanations. Output HTML code only." },
                  { role: "assistant", content: fullContent.slice(-8000) },
                  { role: "user", content: "The HTML was cut off. Continue from exactly where you stopped. Complete all remaining pages/sections, close all open tags, and end with </body></html>." }
                ],
                max_tokens: 16000,
                temperature: 0.1,
                stream: true,
              });
          const contResponse = await fetch(contUrl, {
            method: "POST",
            headers: contHeaders as any,
            signal: AbortSignal.timeout(180000),
            body: contBody,
          });
          const contReader = contResponse.body?.getReader();
          const contDecoder = new TextDecoder();
          let contContent = "";
          if (contReader) {
            while (true) {
              const { done, value } = await contReader.read();
              if (done) break;
              for (const contLine of contDecoder.decode(value, { stream: true }).split("\n")) {
                if (!contLine.startsWith("data: ") || contLine.includes("[DONE]")) continue;
                try {
                  const contParsed = JSON.parse(contLine.slice(6));
                  // Handle both Claude and DeepSeek SSE formats
                  let contText = "";
                  if (contParsed.type === "content_block_delta") {
                    contText = contParsed.delta?.text || "";
                  } else {
                    contText = contParsed.choices?.[0]?.delta?.content || "";
                  }
                  if (contText) {
                    contContent += contText;
                    res.write(`data: ${JSON.stringify({ type: "chunk", content: contText })}\n\n`);
                  }
                } catch (_e) { /* intentional */ }
              }
            }
          }
          const cleanFirst = fullContent.replace(/```\s*$/, "").trimEnd();
          const cleanSecond = contContent.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").trimStart();
          finalContent = cleanFirst + "\n" + cleanSecond;
          res.write(`data: ${JSON.stringify({ type: "continuation_done" })}\n\n`);
        } catch (_e) { /* Continuation failed silently — keep original */ }
      }
    }

    const files = extractFiles(finalContent, agentId);
    
    // ── Quality Gate: reject HTML that's too short for frontend agents ──────
    const isVisualAgent = ["frontend", "reviewer", "auditor"].includes(agentId);
    if (isVisualAgent && files.length > 0 && files[0].language === "html") {
      const htmlContent = files[0].content;
      const lineCount = htmlContent.split("\n").length;
      const hasMultiplePages = htmlContent.includes("x-show=\"page");
      const hasSections = (htmlContent.match(/<section/gi) || []).length;
      
      // Quality metrics
      const qualityScore = {
        lines: lineCount,
        multiPage: hasMultiplePages,
        sections: hasSections,
        hasNav: htmlContent.includes("<nav"),
        hasFooter: htmlContent.includes("<footer"),
        hasAnimations: htmlContent.includes("aos") || htmlContent.includes("x-transition"),
        hasResponsive: htmlContent.includes("@media") || htmlContent.includes("md:") || htmlContent.includes("lg:"),
      };
      
      // Send quality metrics to client
      res.write(`data: ${JSON.stringify({ type: "quality_check", metrics: qualityScore })}\n\n`);
    }
    
    // Estimate token usage (approximate: 1 token ≈ 4 chars)
    const estimatedPromptTokens = Math.round(systemPrompt.length / 4);
    const estimatedCompletionTokens = Math.round(finalContent.length / 4);
    const usage = {
      prompt_tokens: estimatedPromptTokens,
      completion_tokens: estimatedCompletionTokens,
      total_tokens: estimatedPromptTokens + estimatedCompletionTokens,
    };
    res.write(`data: ${JSON.stringify({ type: "done", content: finalContent, files, agentId, stepId, hadThinking: thinkingContent.length > 0, usage })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Self-Healing endpoint — fix JS errors automatically ──────────────────────
agentsRouter.post("/self-heal", async (req: Request, res: Response) => {
  const { html, errors, prompt, lang = "ar" } = req.body;
  if (!html || !errors?.length) { res.status(400).json({ error: "html and errors required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const errorList = errors.slice(0, 10).join("\n");
  const systemPrompt = lang === "ar"
    ? `أنت وكيل إصلاح أخطاء JavaScript متخصص. لديك كود HTML مع أخطاء JS محددة.
مهمتك: إصلاح جميع الأخطاء وإرجاع الكود الكامل المُصلَح.

قواعد صارمة:
1. أرجع الكود HTML الكامل فقط داخل ` + "`" + `html ... ` + "`" + `
2. لا تحذف أي ميزة موجودة — فقط أصلح الأخطاء
3. تأكد أن كل الـ functions معرّفة قبل استخدامها
4. أصلح مشاكل undefined variables وmissing functions وsyntax errors
5. إذا كان الخطأ في مكتبة خارجية، استبدلها بكود vanilla JS`
    : `You are a specialized JavaScript error-fixing agent. You have HTML code with specific JS errors.
Your task: Fix all errors and return the complete fixed code.

Strict rules:
1. Return ONLY the complete HTML inside ` + "`" + `html ... ` + "`" + `
2. Do NOT remove any existing feature — only fix errors
3. Ensure all functions are defined before use
4. Fix undefined variables, missing functions, and syntax errors
5. If error is in an external library, replace with vanilla JS`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `الأخطاء المكتشفة:\n${errorList}\n\nالكود الحالي:\n\`\`\`html\n${html.slice(0, 12000)}\n\`\`\`` },
        ],
        max_tokens: 12000, temperature: 0.2, stream: true,
      }),
    });

    if (!response.ok) { res.write(`data: ${JSON.stringify({ type: "error", message: await response.text() })}\n\n`); res.end(); return; }

    const reader = response.body?.getReader();
    if (!reader) { res.end(); return; }
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) { fullContent += delta; res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`); }
        } catch (_e) { /* intentional */ }
      }
    }

    // Extract fixed HTML
    const htmlMatch = fullContent.match(/```html\n?([\s\S]*?)```/) || fullContent.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
    const fixedHtml = htmlMatch ? (htmlMatch[1] || htmlMatch[0]).trim() : "";
    res.write(`data: ${JSON.stringify({ type: "done", fixedHtml, success: fixedHtml.length > 100 })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Parallel execute — run independent agents concurrently ────────────────────
agentsRouter.post("/execute-parallel", async (req: Request, res: Response) => {
  const { prompt, steps, lang = "ar", projectContext = "", previousFiles = [] } = req.body;
  if (!prompt || !steps?.length) { res.status(400).json({ error: "prompt and steps required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // Run all steps in parallel using Promise.all
    const results = await Promise.allSettled(
      steps.map(async (step: { id: string; agentId: string }) => {
        const agent = AGENTS[step.agentId as keyof typeof AGENTS];
        if (!agent) return { stepId: step.id, agentId: step.agentId, content: "", files: [], error: "Unknown agent" };

        let richContext = projectContext;
        if (previousFiles?.length) {
          richContext += "\n\n=== Previous Files ===\n";
          for (const f of previousFiles.slice(-3)) {
            richContext += `\n--- ${f.name} ---\n${f.content.slice(0, 1500)}\n`;
          }
        }

        const systemPrompt = await buildAgentPrompt(step.agentId, prompt, lang, richContext);
        const useReasoner = ["analyzer", "designer", "security", "auditor"].includes(step.agentId);

        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          signal: AbortSignal.timeout(120000),
          body: JSON.stringify({
            model: useReasoner ? "deepseek-reasoner" : "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `المشروع: ${prompt}\n\nنفّذ مهمتك كـ ${agent.nameAr}` },
            ],
            max_tokens: useReasoner ? 8000 : 6000, temperature: 0.5, stream: false,
          }),
        });

        if (!response.ok) return { stepId: step.id, agentId: step.agentId, content: "", files: [], error: response.statusText };

        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content || "";
        const usage = data.usage || {};
        const files = extractFiles(content, step.agentId);
        return { stepId: step.id, agentId: step.agentId, content, files, usage };
      })
    );

    // Send all results
    for (const result of results) {
      if (result.status === "fulfilled") {
        res.write(`data: ${JSON.stringify({ type: "step_done", ...result.value })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ type: "step_error", error: result.reason?.message })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Output Format Generator — React/Python/PDF/DOCX ──────────────────────────
agentsRouter.post("/generate-format", async (req: Request, res: Response) => {
  const { prompt, format, existingHtml = "", lang = "ar" } = req.body;
  if (!prompt || !format) { res.status(400).json({ error: "prompt and format required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const formatPrompts: Record<string, string> = {
    react: `You are a React expert. Convert this project to a complete React application.
Output a SINGLE self-contained React app using CDN (React 18 + ReactDOM via unpkg).
Use: <script type="text/babel"> for JSX. Include Tailwind CSS CDN.
Return complete HTML file with embedded React app inside ` + "`" + `html ... ` + "`" + `
Project: ${prompt}
${existingHtml ? `Existing design reference:\n${existingHtml.slice(0, 3000)}` : ""}`,

    python: `You are a Python expert. Create a complete Python application for this project.
Output structure using === FILE: filename === markers:
=== FILE: main.py ===
[Python code]
=== FILE: requirements.txt ===
[dependencies]
=== FILE: README.md ===
[setup instructions]
Project: ${prompt}`,

    telegram: `You are a Telegram bot expert. Create a complete Telegram bot in Python.
Use python-telegram-bot v20 (async). Include all handlers, commands, and inline keyboards.
Output:
=== FILE: bot.py ===
[complete async bot code]
=== FILE: requirements.txt ===
python-telegram-bot==20.7
=== FILE: .env.example ===
BOT_TOKEN=your_token_here
=== FILE: README.md ===
[setup and deployment instructions]
Project: ${prompt}`,

    landing: `You are a landing page expert. Create a stunning, conversion-optimized landing page.
Use: Tailwind CSS CDN + Alpine.js CDN + AOS animations CDN.
Include: Hero, Features, Testimonials, Pricing, CTA, Footer sections.
Make it pixel-perfect, mobile-first, with smooth animations.
Return complete HTML inside ` + "`" + `html ... ` + "`" + `
Project: ${prompt}`,
  };

  const systemPrompt = formatPrompts[format] || formatPrompts.react;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      signal: AbortSignal.timeout(180000),
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: 12000, temperature: 0.5, stream: true,
      }),
    });

    if (!response.ok) { res.write(`data: ${JSON.stringify({ type: "error", message: await response.text() })}\n\n`); res.end(); return; }

    const reader = response.body?.getReader();
    if (!reader) { res.end(); return; }
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) { fullContent += delta; res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`); }
        } catch (_e) { /* intentional */ }
      }
    }

    const files = extractFiles(fullContent, "frontend");
    // Also parse === FILE: === format
    const fileMarkerRegex = /=== FILE: (.+?) ===\n([\s\S]*?)(?==== FILE:|$)/g;
    let fmatch;
    while ((fmatch = fileMarkerRegex.exec(fullContent)) !== null) {
      const fname = fmatch[1].trim();
      const fcontent = fmatch[2].trim();
      if (fcontent.length > 10) {
        const ext = fname.split('.').pop()?.toLowerCase() || 'txt';
        const langMap: Record<string, string> = { py: 'python', js: 'javascript', ts: 'typescript', html: 'html', css: 'css', md: 'markdown', txt: 'text', json: 'json', sh: 'bash' };
        files.push({ name: fname, content: fcontent, language: langMap[ext] || 'text' });
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done", files, format })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Memory / Q&A endpoint ─────────────────────────────────────────────────────
agentsRouter.post("/ask-project", async (req: Request, res: Response) => {
  const { question, projectMemory, lang = "ar" } = req.body;
  if (!question || !projectMemory) { res.status(400).json({ error: "question and projectMemory required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const systemPrompt = lang === "ar"
      ? `أنت مساعد ذكي يعرف كل شيء عن المشروع التالي. أجب بدقة واحترافية بالعربية.

سياق المشروع الكامل:
${projectMemory}`
      : `You are an intelligent assistant who knows everything about the following project. Answer accurately and professionally.

Full project context:
${projectMemory}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: question }],
        max_tokens: 2000, temperature: 0.3, stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) { res.end(); return; }
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`);
        } catch (_e) { /* intentional */ }
      }
    }
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Agent Prompts ─────────────────────────────────────────────────────────────
async function buildAgentPrompt(agentId: string, prompt: string, lang: string, context: string): Promise<string> {
  const ar = lang === "ar";
  const ctx = context ? `\n\nسياق المشروع حتى الآن:\n${context.slice(0, 2000)}` : "";

  const themeKey = detectTheme(prompt);
  const designCSS = generateDesignSystemCSS(themeKey);
  const designInstructions = getDesignInstructions(themeKey, prompt);
  // Use real Unsplash API if key available, else fallback to static IDs
   
  let unsplashPhotos: string[] = [];
  try {
    unsplashPhotos = await searchUnsplashImages(prompt, 8);
  } catch {
    unsplashPhotos = getUnsplashPhotos(prompt, 8);
  }
  const photoList = unsplashPhotos.map((url, i) => `Photo ${i+1}: ${url}`).join('\n');
    const prompts: Record<string, string> = {
    analyzer: ar
      ? `أنت خبير تحليل متطلبات. حلّل المشروع وأخرج:
1. ملخص المشروع (3 أسطر)
2. المتطلبات الوظيفية (قائمة مرقّمة)
3. المتطلبات التقنية (التقنيات المقترحة)
4. هيكل الملفات المقترح
5. تقدير الوقت والتعقيد${ctx}`
      : `You are a requirements analysis expert. Analyze the project and output:
1. Project summary (3 lines)
2. Functional requirements (numbered list)
3. Technical requirements (suggested technologies)
4. Suggested file structure
5. Time and complexity estimate${ctx}`,

    designer: ar
      ? `أنت مصمم UI/UX خبير. حدّد:
1. لوحة الألوان الرئيسية (Primary, Secondary, Accent, Background, Text) مع قيم HEX
2. الخطوط المقترحة (Google Fonts)
3. أسلوب التصميم (Modern/Minimal/Bold/Elegant)
4. مكونات UI الرئيسية
5. أمثلة CSS Variables جاهزة للاستخدام${ctx}`
      : `You are an expert UI/UX designer. Define:
1. Main color palette (Primary, Secondary, Accent, Background, Text) with HEX values
2. Suggested fonts (Google Fonts)
3. Design style (Modern/Minimal/Bold/Elegant)
4. Main UI components
5. Ready-to-use CSS Variables examples${ctx}`,

    frontend: ar
      ? `أنت مطور Frontend بمستوى Awwwards. مهمتك بناء موقع احترافي متعدد الصفحات مذهل يُباع بآلاف الدولارات.

⚠️ قاعدة ذهبية: ابنِ موقعاً متعدد الصفحات حقيقياً بـ SPA Router — ليس صفحة واحدة طويلة!

${designInstructions}

═══════════════════════════════════════════════════
قواعد البناء الإلزامية — لا تتجاوز أياً منها:
═══════════════════════════════════════════════════

الهيكل الإلزامي للملف:
ابدأ بـ <!DOCTYPE html><html lang="ar" dir="rtl"> مع meta charset وviewport وtitle حقيقي ووصف حقيقي.
أضف Google Fonts من designSystem في <link>.
في <style>: أدرج هذا الـ CSS Design System الكامل أولاً (انسخه حرفياً):
\`\`\`css
\${designCSS}
\`\`\`
ثم أضف CSS مخصص للمشروع بعده.

هيكل الموقع متعدد الصفحات (SPA Router):
استخدم Alpine.js لبناء SPA Router حقيقي:

\`\`\`html
<div x-data="{ page: 'home' }">
  <!-- NAV مع روابط التنقل -->
  <nav>
    <a @click="page='home'">الرئيسية</a>
    <a @click="page='about'">من نحن</a>
    <a @click="page='services'">خدماتنا</a>
    <a @click="page='portfolio'">أعمالنا</a>
    <a @click="page='contact'">تواصل</a>
  </nav>
  
  <!-- صفحة الرئيسية -->
  <div x-show="page === 'home'" x-transition>
    [محتوى الصفحة الرئيسية الكامل]
  </div>
  
  <!-- صفحة من نحن -->
  <div x-show="page === 'about'" x-transition>
    [محتوى صفحة من نحن الكامل]
  </div>
  
  <!-- باقي الصفحات... -->
</div>
\`\`\`

الصفحات الإلزامية بالترتيب:
1. NAV: sticky مع backdrop-filter، logo + روابط التنقل بين الصفحات + زر CTA + hamburger للموبايل
2. الصفحة الرئيسية (home): HERO + STATS + FEATURES + HOW IT WORKS + TESTIMONIALS + PRICING + CTA
3. صفحة من نحن (about): قصة الشركة + الفريق + القيم + الإنجازات
4. صفحة الخدمات (services): تفاصيل كل خدمة مع صور وأسعار
5. صفحة الأعمال (portfolio): معرض مشاريع مع تصفية حسب الفئة
6. صفحة التواصل (contact): نموذج + خريطة + معلومات التواصل
7. FOOTER: footer-grid بـ 4 أعمدة + social-links + footer-bottom

قواعد المحتوى الإلزامية:
- اكتب محتوى عربياً حقيقياً ومناسباً للمشروع — لا Lorem ipsum ولا placeholder أبداً
- اسم الموقع يجب أن يكون مناسباً للمشروع وليس "اسم الموقع"
- الأرقام في Stats منطقية للمشروع (متجر عطور → "٥٠٠٠+ عطر فاخر"، "٢٠٠+ علامة تجارية")
- آراء العملاء بأسماء عربية حقيقية ومناسبة مع صور Unsplash
- الأسعار في Pricing منطقية للسوق العربي

قواعد الصور — استخدم هذه الروابط الحقيقية المُعدّة لمشروعك:
${photoList}
- للـ Hero: استخدم Photo 1 بعرض w=1200
- للبطاقات: استخدم Photo 2-6 بعرض w=600
- لا تستخدم [ID] placeholder — استخدم الروابط الكاملة أعلاه

قواعد CSS الإلزامية:
- استخدم rgba(var(--primary-rgb), 0.1) للشفافية — وليس rgba(var(--primary), 0.1)
- أضف class="reveal" لكل section رئيسي
- أضف data-target="[رقم]" لكل stat-number
- nav يجب أن يكون position:sticky مع backdrop-filter:blur(24px)

JavaScript الإلزامي في نهاية الـ body:
// 1. Scroll Reveal Observer
// 2. Counter Animation لكل [data-target]
// 3. Mobile Menu Toggle
// 4. Smooth scroll لروابط الـ nav
// 5. أي تفاعل خاص بالمشروع

⚠️ تحذيرات صارمة جداً — لا استثناء:
1. أرجع الكود HTML الكامل فقط — لا نص، لا شرح، لا markdown خارج الكود
2. يجب أن يبدأ ردك بـ <!DOCTYPE html> مباشرة
3. يجب أن ينتهي ردك بـ </body></html> — لا تقطع الكود أبداً
4. إذا كان الموقع طويلاً، اختصر المحتوى لكن أكمل البنية الكاملة
5. أكمل جميع الأقسام حتى لو كانت مختصرة — لا تترك أي tag مفتوح
6. الـ JavaScript يجب أن يكون داخل </body> مباشرة قبل </html>${ctx}`
      : `You are a world-class Frontend developer at Awwwards level. Build a stunning MULTI-PAGE professional website worth thousands of dollars.

⚠️ GOLDEN RULE: Build a REAL multi-page website with SPA Router — NOT a single long scrolling page!

${designInstructions}

═══════════════════════════════════════════════════════════════
STEP 0 — DESIGN BRIEF (MANDATORY before writing any code):
═══════════════════════════════════════════════════════════════
Define in your head (do NOT output this, just apply it):
- Color palette: 2 primary + 1 accent — NEVER use Bootstrap blue #007bff or default colors
- Typography: Choose from: Inter, Manrope, Sora, Space Grotesk, Plus Jakarta Sans, Satoshi, General Sans
- Design style: minimal / bold / glassmorphism / editorial — pick ONE and apply consistently
- Spacing scale: 4px or 8px base — every margin/padding must be a multiple of this

═══════════════════════════════════════════════════════════════
MANDATORY LIBRARIES — include via CDN in <head>:
═══════════════════════════════════════════════════════════════
1. Google Fonts: chosen font from list above
2. Lucide Icons: <script src="https://unpkg.com/lucide@latest"></script>
3. AOS (scroll animations): 
   <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
   <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
4. Alpine.js for interactions: <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>

═══════════════════════════════════════════════════════════════
MANDATORY BUILD RULES — follow every single one:
═══════════════════════════════════════════════════════════════

REQUIRED HTML STRUCTURE:
<!DOCTYPE html><html lang="en"> with:
- <meta charset="UTF-8">
- <meta name="viewport" content="width=device-width, initial-scale=1.0">
- <meta name="description" content="[real description]">
- <meta property="og:title"> and <meta property="og:description"> for social sharing
- <link rel="icon" href="[relevant emoji as favicon]">
- Google Fonts <link> for chosen font
- CDN libraries above

MULTI-PAGE SPA STRUCTURE (Alpine.js Router):
Build a REAL multi-page website — not a single scrolling page!

\`\`\`html
<div x-data="{ page: 'home' }">
  <!-- NAV with page navigation links -->
  <nav>
    <a @click="page='home'">Home</a>
    <a @click="page='about'">About</a>
    <a @click="page='services'">Services</a>
    <a @click="page='portfolio'">Portfolio</a>
    <a @click="page='contact'">Contact</a>
  </nav>
  
  <!-- Home Page -->
  <div x-show="page === 'home'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    [Full home page content]
  </div>
  
  <!-- About Page -->
  <div x-show="page === 'about'" x-transition>
    [Full about page content]
  </div>
  
  <!-- More pages... -->
</div>
\`\`\`

MANDATORY PAGES:
1. NAV: sticky with backdrop-filter:blur(24px), logo + page navigation links + CTA button + hamburger (x-data Alpine)
2. HOME PAGE: HERO + STATS + FEATURES + HOW IT WORKS + TESTIMONIALS + PRICING + FAQ + CTA
3. ABOUT PAGE: Company story + Team members + Values + Achievements timeline
4. SERVICES PAGE: Detailed service cards with images, descriptions, and pricing
5. PORTFOLIO PAGE: Project gallery with filter by category (Alpine.js filtering)
6. CONTACT PAGE: Contact form + Map embed + Contact info + Social links
7. FOOTER: 4-column grid + social icons (Lucide) + newsletter form + footer-bottom with copyright

MANDATORY CONTENT RULES:
- ZERO Lorem ipsum — write real, specific, relevant content for this exact project
- Website name must match the project exactly
- Stats must be realistic and impressive (e-commerce: "50,000+ Products", barista: "10,000+ Cups Daily")
- Testimonials: realistic names + relevant quotes + Unsplash avatar photos
- Pricing: realistic market prices for this specific industry

IMAGE RULES:
${photoList}
- Hero: use Photo 1 with w=1200&h=800&fit=crop
- Cards/Avatars: use Photo 2-6 with w=400&h=400&fit=crop&crop=face
- NEVER use [ID] placeholder — use complete URLs above

MANDATORY CSS QUALITY RULES:
- CSS custom properties for ALL colors, fonts, spacing — no hardcoded values
- Use rgba(var(--primary-rgb), 0.1) for transparency — NEVER rgba(var(--primary), 0.1)
- Every section: class="reveal" for scroll animation
- Smooth transitions: transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1)
- Button :active state: transform: scale(0.97) — makes buttons feel responsive
- Cards: box-shadow that changes on hover (lift effect)
- Typography hierarchy: clear size difference between h1/h2/h3/body/caption
- Whitespace: generous padding (min 80px vertical) — "let the design breathe"
- Mobile-first: different layout for 320px, 768px, 1200px — not just "it works"

MANDATORY JAVASCRIPT (at end of body):
1. AOS.init({ duration: 800, once: true, offset: 100 });
2. Lucide.createIcons();
3. Counter Animation: IntersectionObserver on [data-target] elements
4. Mobile Menu: Alpine.js handles this automatically
5. Smooth scroll: document.querySelectorAll('a[href^="#"]')
6. Sticky nav: add class on scroll for background change
7. Back-to-top button: appears after 300px scroll
8. Any project-specific interactions (tabs, modals, sliders)

LOADING & EMPTY STATES:
- Buttons: show loading spinner on click (add/remove class)
- Images: add loading="lazy" to all images
- Forms: show success/error state after submission

ACCESSIBILITY (non-negotiable):
- All images: descriptive alt text
- All interactive elements: aria-label
- Color contrast: minimum 4.5:1 for text
- Focus styles: visible outline for keyboard navigation

Return ONLY the complete HTML code inside ` + "`" + `html ... ` + "`" + ` — no text outside the code block${ctx}`,
    backend: ar
     ? `أنت مطور Backend خبير. اكتب كود Node.js + Express كاملاً:
- RESTful API endpoints
- Middleware (cors, helmet, morgan)
- Error handling
- Environment variables
      - اكتب الكود في ملف server.js مع تعليقات واضحة
أرجع الكود داخل \`\`\`javascript ... \`\`\` فقط — لا تكتب HTML أبداً${ctx}`
      : `You are an expert Backend developer. Write complete Node.js + Express code:
- RESTful API endpoints
- Middleware (cors, helmet, morgan)
- Error handling
- Environment variables
      - Write code in server.js with clear comments
Return code inside \`\`\`javascript ... \`\`\` only — NEVER write HTML${ctx}`,

    database: ar
      ? `أنت خبير قواعد بيانات. صمّم:
1. DB Schema كامل (SQL)
2. Migrations scripts
3. Sample data للاختبار
4. Indexes للأداء
5. اكتب في ملف schema.sql${ctx}`
      : `You are a database expert. Design:
1. Complete DB Schema (SQL)
2. Migration scripts
3. Sample data for testing
4. Performance indexes
5. Write in schema.sql file${ctx}`,

    security: ar
      ? `أنت خبير أمان. أضف:
1. JWT Authentication
2. Password hashing (bcrypt)
3. Input validation
4. Rate limiting
5. CORS configuration
6. Helmet.js headers
اكتب الكود الكامل مع التعليقات${ctx}`
      : `You are a security expert. Add:
1. JWT Authentication
2. Password hashing (bcrypt)
3. Input validation
4. Rate limiting
5. CORS configuration
6. Helmet.js headers
Write complete code with comments${ctx}`,

    content: ar
      ? `أنت كاتب محتوى احترافي. اكتب:
1. العناوين الرئيسية والفرعية
2. النصوص التسويقية
3. أوصاف المنتجات/الخدمات
4. نصوص CTA
5. محتوى FAQ
اجعل المحتوى عربياً فصيحاً وجذاباً${ctx}`
      : `You are a professional content writer. Write:
1. Main and sub headlines
2. Marketing copy
3. Product/service descriptions
4. CTA texts
5. FAQ content
Make content engaging and professional${ctx}`,

    bot: ar
      ? `أنت خبير بوتات تليغرام. اكتب كود Python كاملاً:
- python-telegram-bot library
- Commands handlers
- InlineKeyboard menus
- ConversationHandler
- Database integration
- ملف bot.py + requirements.txt${ctx}`
      : `You are a Telegram bot expert. Write complete Python code:
- python-telegram-bot library
- Commands handlers
- InlineKeyboard menus
- ConversationHandler
- Database integration
- bot.py + requirements.txt files${ctx}`,

    game: ar
      ? `أنت مطور ألعاب ويب خبير. ابنِ لعبة HTML5 كاملة:
- HTML5 Canvas
- Game Loop احترافي
- Physics وCollision
- نظام نقاط ومستويات
- تأثيرات بصرية
- شاشات بداية ونهاية${ctx}`
      : `You are an expert web game developer. Build a complete HTML5 game:
- HTML5 Canvas
- Professional Game Loop
- Physics and Collision
- Score and level system
- Visual effects
- Start and end screens${ctx}`,

    payment: ar
      ? `أنت خبير أنظمة دفع. أضف:
1. Stripe Checkout integration
2. Crypto payment (USDT/BTC/ETH) مع Memo system
3. Paymob للدفع العربي
4. Order management
5. Invoice generation
اكتب الكود الكامل${ctx}`
      : `You are a payment systems expert. Add:
1. Stripe Checkout integration
2. Crypto payment (USDT/BTC/ETH) with Memo system
3. Paymob for Arabic payments
4. Order management
5. Invoice generation
Write complete code${ctx}`,

    analytics: ar
      ? `أنت خبير تحليلات. أضف:
1. Page view tracking
2. User behavior analytics
3. Conversion tracking
4. Performance metrics
5. Dashboard charts (Chart.js)
اكتب الكود الكامل${ctx}`
      : `You are an analytics expert. Add:
1. Page view tracking
2. User behavior analytics
3. Conversion tracking
4. Performance metrics
5. Dashboard charts (Chart.js)
Write complete code${ctx}`,

    seo: ar
      ? `أنت خبير SEO. أضف:
1. Meta tags كاملة
2. Open Graph tags
3. Twitter Cards
4. Structured Data (JSON-LD)
5. Sitemap.xml
6. Robots.txt
7. Canonical URLs
اكتب الكود الكامل${ctx}`
      : `You are an SEO expert. Add:
1. Complete meta tags
2. Open Graph tags
3. Twitter Cards
4. Structured Data (JSON-LD)
5. Sitemap.xml
6. Robots.txt
7. Canonical URLs
Write complete code${ctx}`,

    mobile: ar
      ? `أنت خبير تصميم متجاوب. تأكد من:
1. Mobile-first design
2. Touch-friendly buttons (min 44px)
3. Readable fonts على الهاتف
4. Fast loading على الشبكات البطيئة
5. PWA manifest
6. Viewport optimization
راجع الكود وأضف التحسينات${ctx}`
      : `You are a responsive design expert. Ensure:
1. Mobile-first design
2. Touch-friendly buttons (min 44px)
3. Readable fonts on mobile
4. Fast loading on slow networks
5. PWA manifest
6. Viewport optimization
Review code and add improvements${ctx}`,

    tester: ar
      ? `أنت خبير اختبار. راجع الكود وافعل:
1. تحديد الأخطاء المحتملة
2. اختبار الحالات الحدية
3. التحقق من الأمان
4. اختبار الأداء
5. إصلاح الأخطاء الموجودة
أرجع الكود المُصحَّح${ctx}`
      : `You are a testing expert. Review code and:
1. Identify potential bugs
2. Test edge cases
3. Security verification
4. Performance testing
5. Fix existing bugs
Return corrected code${ctx}`,

    docs: ar
      ? `أنت خبير توثيق تقني. اكتب:
1. README.md شامل
2. تعليمات التثبيت خطوة بخطوة
3. API documentation
4. Environment variables guide
5. Deployment guide
6. Contributing guide${ctx}`
      : `You are a technical documentation expert. Write:
1. Comprehensive README.md
2. Step-by-step installation instructions
3. API documentation
4. Environment variables guide
5. Deployment guide
6. Contributing guide${ctx}`,

    deployer: ar
      ? `أنت خبير نشر تطبيقات. جهّز:
1. Dockerfile كامل
2. docker-compose.yml
3. Vercel configuration (vercel.json)
4. Nginx configuration
5. Environment variables template
6. CI/CD pipeline (GitHub Actions)${ctx}`
      : `You are a deployment expert. Prepare:
1. Complete Dockerfile
2. docker-compose.yml
3. Vercel configuration (vercel.json)
4. Nginx configuration
5. Environment variables template
6. CI/CD pipeline (GitHub Actions)${ctx}`,

    optimizer: ar
      ? `أنت خبير تحسين أداء. راجع وحسّن:
1. تحسين حجم CSS/JS
2. Lazy loading للصور
3. Caching strategy
4. Code splitting
5. Critical CSS
6. Web Vitals (LCP, FID, CLS)
أرجع الكود المحسّن${ctx}`
      : `You are a performance optimization expert. Review and improve:
1. CSS/JS size optimization
2. Image lazy loading
3. Caching strategy
4. Code splitting
5. Critical CSS
6. Web Vitals (LCP, FID, CLS)
Return optimized code${ctx}`,

    memory: ar
      ? `أنت وكيل الذاكرة. لخّص المشروع بالكامل:
1. وصف المشروع
2. التقنيات المستخدمة
3. هيكل الملفات
4. الميزات الرئيسية
5. API endpoints
6. قاعدة البيانات
7. كيفية التثبيت والتشغيل
اجعل الملخص شاملاً ودقيقاً${ctx}`
      : `You are the memory agent. Summarize the entire project:
1. Project description
2. Technologies used
3. File structure
4. Main features
5. API endpoints
6. Database
7. How to install and run
Make summary comprehensive and accurate${ctx}`,
    reviewer: ar
      ? `أنت مراجع كود Frontend خبير بمستوى Awwwards. مهمتك مراجعة وتحسين الموقع ليصبح جاهزاً للبيع.

⚠️ قواعد المراجعة الإلزامية:
1. تأكد أن الموقع متعدد الصفحات حقيقياً (Home, About, Services, Portfolio, Contact كحد أدنى)
2. تأكد أن كل صفحة كاملة ومفصّلة — إذا كانت قصيرة أضف محتوى
3. تأكد من وجود: nav sticky + footer 4-columns + scroll animations + hover effects
4. تأكد من responsive design حقيقي (ليس فقط يعمل بل يبدو رائعاً على الموبايل)
5. تأكد من عدم وجود Lorem ipsum أو placeholder text
6. أصلح أي CSS مكسور أو ألوان غير متناسقة
7. أضف micro-interactions مفقودة (button press, card hover lift, smooth transitions)
8. تأكد من accessibility (alt text, aria-labels, focus styles)

سياق المشروع:
${ctx}

أرجع الكود المحسّن كاملاً داخل a code block (html format) — لا تكتب شرحاً خارج الكود`
      : `You are an Awwwards-level Frontend code reviewer. Your mission is to review and enhance the website to be sale-ready.

⚠️ MANDATORY REVIEW RULES:
1. Ensure the website is truly multi-page (Home, About, Services, Portfolio, Contact minimum)
2. Ensure each page is complete and detailed — if short, ADD content
3. Verify: sticky nav + 4-column footer + scroll animations + hover effects
4. Verify REAL responsive design (not just "works" but "looks amazing" on mobile)
5. Verify NO Lorem ipsum or placeholder text exists
6. Fix any broken CSS or inconsistent colors
7. Add missing micro-interactions (button press, card hover lift, smooth transitions)
8. Verify accessibility (alt text, aria-labels, focus styles)

Project context:
${ctx}

Return the COMPLETE enhanced code inside a code block (html format) — no explanation outside the code block`,
        auditor: ar
      ? `أنت وكيل التدقيق العميق والتحسين النهائي — آخر وكيل يعمل على المشروع.

مهمتك: تحويل الموقع من "جيد" إلى "احترافي يُباع بآلاف الدولارات".

**المرحلة 1 — التدقيق الشامل:**
🔐 الأمان: تحقق من XSS, CSRF, input sanitization
⚡ الأداء: حجم الكود, render-blocking scripts, image optimization
🎨 التصميم: تناسق الألوان, typography hierarchy, spacing system
♿ Accessibility: alt text, aria-labels, keyboard navigation, color contrast
📱 Responsive: يعمل بشكل مثالي على 320px, 768px, 1200px
🧹 الكود: لا تكرار, تسمية واضحة, تنظيم منطقي

**المرحلة 2 — التحسينات الجمالية الإلزامية:**
1. إذا كان Hero section لا يحتوي على صورة → أضف hero-image مع صورة Unsplash مناسبة
2. إذا كانت الأقسام تبدو مملة → أضف background patterns أو subtle gradients
3. إذا كانت الأزرار بسيطة → أضف shimmer effect أو arrow icon
4. إذا كان الـ footer بسيطاً → أضف newsletter signup form
5. أضف "Back to Top" button في الزاوية
6. أضف loading skeleton أو smooth page transition
7. تأكد من أن كل section له section-label فوق العنوان

**المرحلة 3 — المحتوى النهائي:**
- استبدل أي نص placeholder بمحتوى حقيقي ومناسب
- تأكد من أن أسماء العملاء في Testimonials عربية حقيقية
- تأكد من أن الأرقام في Stats منطقية ومقنعة

لكل مشكلة وجدتها: "🔴 حرجة" / "🟡 تحسين" / "🟢 ملاحظة"
ثم أرجع الكود HTML الكامل المُحسَّن فقط داخل ` + "`" + `html ... ` + "`" + `
في النهاية أضف: "⭐ التقييم النهائي: [X]/10"${ctx}`
      : `You are the Deep Audit & Final Enhancement Agent — the LAST agent. Your output is what the user sees.

Your mission: Transform the website into a PREMIUM product worth $5,000+.

═══════════════════════════════════════════════════
PHASE 1 — THE GOLDEN RULE AUDIT:
═══════════════════════════════════════════════════
"The difference between an ordinary site and a world-class one is 90% consistent small details 
(spacing, timing, contrast) applied with discipline, NOT one big feature."

Check EVERY element for:
✅ Spacing: Is every margin/padding a multiple of 4px or 8px?
✅ Typography: Clear hierarchy h1 > h2 > h3 > body > caption? Font consistent throughout?
✅ Color: Max 3 colors used consistently? No random color deviations?
✅ Contrast: All text passes WCAG AA (4.5:1 minimum)?
✅ Whitespace: Does the design "breathe"? Min 80px vertical padding per section?
✅ Motion: Animations under 300ms? Using cubic-bezier(0.23, 1, 0.32, 1)?
✅ Consistency: Same border-radius everywhere? Same shadow style?

═══════════════════════════════════════════════════
PHASE 2 — PERFORMANCE LAYER:
═══════════════════════════════════════════════════
- Move all <script> tags to end of <body> (except CDN in head)
- Add loading="lazy" to ALL images
- Add fetchpriority="high" to hero image only
- Defer non-critical CSS
- Minify inline CSS (remove comments, extra spaces)

═══════════════════════════════════════════════════
PHASE 3 — FINAL POLISH (apply ALL):
═══════════════════════════════════════════════════
1. Hero: Must have image + gradient overlay + badge + 2 CTAs + scroll indicator arrow
2. Every section: section-label in small caps above the main heading
3. Testimonials: Real avatar photos from Unsplash + 5 stars + realistic quotes
4. FAQ: Alpine.js accordion with smooth animation
5. Footer: Newsletter form + 4 columns + social icons (Lucide) + copyright
6. Back-to-top: Fixed button, bottom-right, appears after 300px scroll
7. 404-style empty states: If any section has no content, add meaningful placeholder
8. Skeleton screens: Add CSS skeleton animation class for loading states
9. Favicon: Add <link rel="icon" href="data:image/svg+xml,..."> with relevant emoji
10. Open Graph: og:title, og:description, og:image meta tags

═══════════════════════════════════════════════════
PHASE 4 — CONTENT FINAL CHECK:
═══════════════════════════════════════════════════
- ZERO Lorem ipsum — replace every instance with real content
- Stats: Impressive but believable numbers with context
- Testimonials: Names that match the target market culture
- Pricing: Research-based prices for this specific industry

Rate each issue: 🔴 Critical (breaks UX) / 🟡 Improvement / 🟢 Polish

Return ONLY the complete final HTML inside ` + "`" + `html ... ` + "`" + `
End with: "⭐ Quality Score: [X]/10 | 🚀 Production Ready: [Yes/Almost/No]"${ctx}`,

    strategy: ar
      ? `أنت خبير استراتيجية منتجات رقمية. حلّل المشروع وأخرج:

## 🎯 استراتيجية المنتج

### 1. تحليل السوق
- حجم السوق المستهدف
- الاتجاهات الحالية
- الفرص المتاحة

### 2. تحليل المنافسين
- أبرز 3 منافسين مع نقاط قوتهم وضعفهم
- الفجوة في السوق

### 3. Value Proposition
- ما الذي يجعل هذا المشروع فريداً؟
- لماذا سيختاره المستخدم؟

### 4. خارطة الطريق (Roadmap)
- المرحلة 1 (MVP): الميزات الأساسية
- المرحلة 2: الميزات المتقدمة
- المرحلة 3: التوسع

### 5. مؤشرات النجاح (KPIs)
- المقاييس الرئيسية لقياس النجاح

اجعل التحليل دقيقاً ومبنياً على بيانات حقيقية.${ctx}`
      : `You are a digital product strategy expert. Analyze the project and output a complete strategy: market analysis, competitor analysis, value proposition, roadmap (MVP → Advanced → Scale), and KPIs. Make it data-driven and actionable.${ctx}`,

    ux: ar
      ? `أنت خبير UX/UI متخصص. صمّم تجربة المستخدم الكاملة:

## 🧩 تصميم تجربة المستخدم

### 1. User Personas (3 شخصيات)
لكل شخصية: الاسم، العمر، الاحتياجات، نقاط الألم، الأهداف

### 2. User Journey Map
الخطوات التي يمر بها المستخدم من الاكتشاف حتى الهدف النهائي

### 3. User Flows الرئيسية
- Flow 1: [أهم مسار]
- Flow 2: [المسار الثاني]

### 4. Wireframe نصي
وصف تفصيلي لكل صفحة رئيسية:
- الهيدر
- المحتوى الرئيسي
- الـ CTA
- الفوتر

### 5. نقاط الاحتكاك والحلول
المشاكل المتوقعة وكيف نحلها في التصميم

### 6. Micro-interactions المقترحة
التفاعلات الصغيرة التي تحسن التجربة${ctx}`
      : `You are a UX/UI expert. Design the complete user experience: 3 User Personas, User Journey Map, main User Flows, textual Wireframes for each page, friction points with solutions, and recommended micro-interactions.${ctx}`,

    brand: ar
      ? `أنت خبير هوية بصرية وعلامة تجارية. ابنِ هوية كاملة:

## 🎨 هوية العلامة التجارية

### 1. اسم العلامة التجارية
- اقتراح اسم (إذا لم يُحدَّد)
- شرح الدلالة والمعنى

### 2. لوحة الألوان الكاملة
\`\`\`css
:root {
  --primary: #[HEX]; /* اللون الرئيسي - [الدلالة] */
  --secondary: #[HEX]; /* اللون الثانوي */
  --accent: #[HEX]; /* لون التمييز */
  --background: #[HEX]; /* الخلفية */
  --surface: #[HEX]; /* الأسطح */
  --text-primary: #[HEX]; /* النص الرئيسي */
  --text-secondary: #[HEX]; /* النص الثانوي */
  --success: #[HEX];
  --warning: #[HEX];
  --error: #[HEX];
}
\`\`\`

### 3. الخطوط
- خط العناوين: [الاسم] - [السبب]
- خط النص: [الاسم] - [السبب]
- خط الأرقام: [الاسم] - [السبب]
- كود Google Fonts جاهز للاستخدام

### 4. أسلوب التصميم
- الكلمات المفتاحية البصرية (3-5 كلمات)
- نوع الظلال والحدود
- نصف قطر الزوايا
- التباعد والإيقاع

### 5. الصوت والنبرة (Voice & Tone)
- كيف تتحدث العلامة التجارية؟
- أمثلة على نصوص CTA

### 6. مفهوم الشعار
- وصف تفصيلي للشعار المقترح
- الرمز والمعنى${ctx}`
      : `You are a brand identity expert. Build a complete brand identity: brand name suggestion, full color palette with CSS variables, typography (Google Fonts), design style keywords, voice & tone, and logo concept description.${ctx}`,

    solutions: ar
      ? `أنت خبير حل المشكلات والابتكار. حلّل المشكلة واقترح حلولاً:

## 💡 اكتشاف الحلول

### تعريف المشكلة الجوهرية
ما المشكلة الحقيقية التي يحلها هذا المشروع؟

### الحلول المقترحة

#### الحل 1: [الاسم] — [النهج]
- **الوصف:** [شرح مفصل]
- **المزايا:** [قائمة]
- **العيوب:** [قائمة]
- **التكلفة التقنية:** منخفضة/متوسطة/عالية
- **وقت التنفيذ:** [تقدير]
- **مناسب لـ:** [الحالة المثالية]

#### الحل 2: [الاسم] — [النهج]
[نفس الهيكل]

#### الحل 3: [الاسم] — [النهج]
[نفس الهيكل]

### مقارنة الحلول
| المعيار | الحل 1 | الحل 2 | الحل 3 |
|---------|--------|--------|--------|
| السرعة | | | |
| التكلفة | | | |
| القابلية للتوسع | | | |
| سهولة التنفيذ | | | |

### التوصية النهائية
الحل الأمثل مع التبرير${ctx}`
      : `You are a problem-solving and innovation expert. Define the core problem, propose 3-5 solutions each with description, pros/cons, technical cost, timeline, and ideal use case. Include a comparison table and final recommendation.${ctx}`,

    architect: ar
      ? `أنت مهندس معمارية برمجيات خبير. صمّم البنية التقنية الكاملة:

## 📐 هندسة المعمارية

### 1. نظرة عامة على البنية
[رسم ASCII للبنية العامة]

### 2. مكونات النظام
لكل مكون: الاسم، المسؤولية، التقنية المستخدمة

### 3. تصميم قاعدة البيانات
\`\`\`sql
-- الجداول الرئيسية مع العلاقات
CREATE TABLE [table_name] (
  id INT PRIMARY KEY AUTO_INCREMENT,
  -- الحقول...
);
\`\`\`

### 4. API Design
\`\`\`
GET    /api/[resource]          - [الوصف]
POST   /api/[resource]          - [الوصف]
PUT    /api/[resource]/:id      - [الوصف]
DELETE /api/[resource]/:id      - [الوصف]
\`\`\`

### 5. Data Flow
وصف تفصيلي لكيفية تدفق البيانات بين المكونات

### 6. قرارات التقنية
لماذا اخترنا هذه التقنيات؟

### 7. نقاط الضعف المحتملة والحلول
Single points of failure وكيف نتجنبها${ctx}`
      : `You are an expert software architect. Design complete technical architecture: system overview (ASCII diagram), components with responsibilities, database schema (SQL), API design (REST endpoints), data flow, technology decisions rationale, and potential failure points with solutions.${ctx}`,

    research: ar
      ? `أنت باحث متخصص في تجربة المستخدم وسلوك المستهلك. أجرِ بحثاً شاملاً:

## 🔬 بحث المستخدمين

### 1. الجمهور المستهدف
- الشريحة الأساسية (Primary Audience)
- الشريحة الثانوية (Secondary Audience)
- الشريحة المستبعدة (Anti-Audience)

### 2. User Personas التفصيلية

#### Persona 1: [الاسم]
- **الديموغرافيا:** العمر، الموقع، المهنة، الدخل
- **الأهداف:** ما يريد تحقيقه
- **نقاط الألم:** ما يزعجه
- **السلوك الرقمي:** كيف يستخدم الإنترنت
- **الدوافع:** لماذا سيستخدم المنتج
- **الاعتراضات:** لماذا قد لا يستخدمه

#### Persona 2: [الاسم]
[نفس الهيكل]

### 3. Customer Journey Map
| المرحلة | الإجراء | الأفكار | المشاعر | نقاط الألم | الفرص |
|---------|---------|---------|---------|------------|-------|
| الاكتشاف | | | | | |
| التقييم | | | | | |
| الشراء | | | | | |
| الاستخدام | | | | | |
| الولاء | | | | | |

### 4. أسئلة بحث المستخدم المقترحة
10 أسئلة لمقابلات المستخدمين

### 5. توصيات المنتج بناءً على البحث${ctx}`
      : `You are a UX researcher and consumer behavior specialist. Research the target audience: primary/secondary/anti-audience segments, 2 detailed User Personas (demographics, goals, pain points, digital behavior, motivations, objections), Customer Journey Map, 10 user interview questions, and product recommendations based on research.${ctx}`,

    innovation: ar
      ? `أنت خبير ابتكار وتفكير إبداعي. فكّر خارج الصندوق:

## ⚡ أفكار الابتكار

### 1. الميزة "WOW" الرئيسية
ميزة واحدة مذهلة لم يفكر فيها أحد تجعل المشروع لا يُنسى

### 2. أفكار تمييزية (5 أفكار)
لكل فكرة:
- **الفكرة:** [الوصف]
- **لماذا هي مبتكرة؟**
- **كيف تُنفَّذ تقنياً؟** (بشكل مبسط)
- **الأثر المتوقع على المستخدم**

### 3. تطبيق الذكاء الاصطناعي
3 طرق غير تقليدية لدمج AI في هذا المشروع تحديداً

### 4. Gamification
كيف نضيف عناصر اللعب لزيادة التفاعل؟

### 5. الميزة الاجتماعية (Viral Loop)
كيف يجعل المنتج المستخدمين يدعون أصدقاءهم تلقائياً؟

### 6. نموذج العمل المبتكر
طريقة غير تقليدية لتحقيق الإيرادات

### 7. الرؤية المستقبلية (5 سنوات)
أين يمكن أن يصل هذا المشروع؟${ctx}`
      : `You are an innovation and creative thinking expert. Think outside the box: one "WOW" feature, 5 differentiating ideas (with description, why innovative, technical implementation, user impact), 3 unconventional AI applications, gamification strategy, viral loop mechanism, innovative business model, and 5-year vision.${ctx}`,
  };

  // Add fixer agent prompt
  prompts.fixer = ar
    ? `أنت وكيل إصلاح أخطاء متخصص بمستوى عالمي. مهمتك فحص الكود بالكامل وإصلاح كل خطأ تجده.

أنواع الأخطاء التي تبحث عنها وتصلحها:
═══════════════════════════════════════════════════
1. JavaScript Errors: undefined variables, missing functions, syntax errors, type errors
2. CSS Bugs: broken layouts, overflow issues, z-index conflicts, missing responsive styles
3. HTML Issues: unclosed tags, invalid nesting, missing alt text, broken links
4. Responsive Issues: elements overflowing on mobile, text too small, buttons too close
5. Performance Issues: unoptimized images, render-blocking scripts, excessive DOM nodes
6. Accessibility Issues: missing aria-labels, poor contrast, no focus styles
7. Browser Compatibility: features not supported in Safari/Firefox
8. Logic Errors: broken navigation, forms that don't submit, broken Alpine.js bindings
═══════════════════════════════════════════════════

قواعد الإصلاح:
1. أرجع الكود الكامل المُصلَح — لا تحذف أي ميزة
2. أضف تعليقات // FIXED: ... عند كل إصلاح
3. إذا وجدت صورة مكسورة، استبدلها بصورة Unsplash مناسبة
4. إذا وجدت responsive مكسور، أصلحه بـ media queries صحيحة
5. إذا وجدت Alpine.js binding مكسور، أصلحه
6. تأكد أن الموقع يعمل 100% بدون أي خطأ في Console
${ctx}

أرجع الكود المُصلَح كاملاً في code block بصيغة html`
    : `You are a world-class Error Fixer agent. Your mission is to scan the entire code and fix every error you find.

Error types you detect and fix:
═══════════════════════════════════════════════════
1. JavaScript Errors: undefined variables, missing functions, syntax errors, type errors
2. CSS Bugs: broken layouts, overflow issues, z-index conflicts, missing responsive styles
3. HTML Issues: unclosed tags, invalid nesting, missing alt text, broken links
4. Responsive Issues: elements overflowing on mobile, text too small, buttons too close
5. Performance Issues: unoptimized images, render-blocking scripts, excessive DOM nodes
6. Accessibility Issues: missing aria-labels, poor contrast, no focus styles
7. Browser Compatibility: features not supported in Safari/Firefox
8. Logic Errors: broken navigation, forms that don't submit, broken Alpine.js bindings
═══════════════════════════════════════════════════

Fix rules:
1. Return the COMPLETE fixed code — do NOT remove any feature
2. Add comments // FIXED: ... at each fix
3. If you find a broken image, replace with appropriate Unsplash image
4. If you find broken responsive, fix with proper media queries
5. If you find broken Alpine.js binding, fix it
6. Ensure the website works 100% with ZERO console errors
${ctx}

Return the complete fixed code in a code block (html format)`;

  return prompts[agentId] || prompts.frontend;
}

// ── Extract files from agent output ──────────────────────────────────────────
// ── Clean HTML output — remove leading text/markdown before DOCTYPE ──────────
function cleanHtmlOutput(raw: string): string {
  if (!raw) return raw;

  // Extract from ```html ... ``` block
  const codeBlock = raw.match(/```html\s*([\s\S]*?)```/i);
  if (codeBlock) return codeBlock[1].trim();

  // Extract from any ``` block containing DOCTYPE
  const anyBlock = raw.match(/```\w*\s*(<!DOCTYPE[\s\S]*?)```/i);
  if (anyBlock) return anyBlock[1].trim();

  // Find DOCTYPE and extract to end of </html>
  const doctypeIdx = raw.indexOf('<!DOCTYPE');
  if (doctypeIdx >= 0) {
    const closeHtml = raw.lastIndexOf('</html>');
    return closeHtml > doctypeIdx ? raw.slice(doctypeIdx, closeHtml + 7) : raw.slice(doctypeIdx);
  }

  // Find <html tag
  const htmlIdx = raw.indexOf('<html');
  if (htmlIdx >= 0) {
    const closeHtml = raw.lastIndexOf('</html>');
    return closeHtml > htmlIdx ? raw.slice(htmlIdx, closeHtml + 7) : raw.slice(htmlIdx);
  }

  return raw;
}

function extractFiles(content: string, agentId: string): { name: string; content: string; language: string }[] {
  // Try to extract named code blocks first (```html, ```javascript, etc.)
  const namedBlocks: { name: string; content: string; language: string }[] = [];
  const blockRegex = /```(\w+)\n([\s\S]*?)```/g;
  let match;
  const langToFile: Record<string, { name: string; lang: string }> = {
    html: { name: "index.html", lang: "html" },
    javascript: { name: "script.js", lang: "javascript" },
    js: { name: "script.js", lang: "javascript" },
    css: { name: "style.css", lang: "css" },
    python: { name: "main.py", lang: "python" },
    sql: { name: "schema.sql", lang: "sql" },
    typescript: { name: "index.ts", lang: "typescript" },
    ts: { name: "index.ts", lang: "typescript" },
    bash: { name: "setup.sh", lang: "bash" },
    sh: { name: "setup.sh", lang: "bash" },
    json: { name: "config.json", lang: "json" },
    dockerfile: { name: "Dockerfile", lang: "dockerfile" },
    markdown: { name: "README.md", lang: "markdown" },
    md: { name: "README.md", lang: "markdown" },
  };

  while ((match = blockRegex.exec(content)) !== null) {
    const lang = match[1].toLowerCase();
    const blockContent = match[2].trim();
    if (blockContent.length > 50) {
      const fileInfo = langToFile[lang];
      if (fileInfo) {
        // Avoid duplicates — use latest version
        const existing = namedBlocks.findIndex(b => b.name === fileInfo.name);
        if (existing >= 0) { namedBlocks[existing] = { name: fileInfo.name, content: fileInfo.lang === "html" ? cleanHtmlOutput(blockContent) : blockContent, language: fileInfo.lang }; }
        else { namedBlocks.push({ name: fileInfo.name, content: fileInfo.lang === "html" ? cleanHtmlOutput(blockContent) : blockContent, language: fileInfo.lang }); }
      }
    }
  }

  // If we found blocks, prioritize HTML for frontend agents
  if (namedBlocks.length > 0) {
    // For frontend/reviewer/auditor/game agents, always prefer HTML file
    const htmlAgents = ["frontend", "reviewer", "auditor", "fixer", "game", "seo", "mobile", "optimizer", "tester", "payment"];
    if (htmlAgents.includes(agentId)) {
      const htmlBlock = namedBlocks.find(b => b.language === "html");
      if (htmlBlock) return [htmlBlock]; // Return only the HTML for preview
    }
    return namedBlocks;
  }

  // Fallback: use agent-specific mapping
  const cleaned = content.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  const extMap: Record<string, { name: string; lang: string }> = {
    frontend: { name: "index.html", lang: "html" },
    backend: { name: "server.js", lang: "javascript" },
    database: { name: "schema.sql", lang: "sql" },
    security: { name: "auth.js", lang: "javascript" },
    bot: { name: "bot.py", lang: "python" },
    game: { name: "game.html", lang: "html" },
    deployer: { name: "Dockerfile", lang: "dockerfile" },
    docs: { name: "README.md", lang: "markdown" },
    seo: { name: "index.html", lang: "html" },
    mobile: { name: "index.html", lang: "html" },
    optimizer: { name: "index.html", lang: "html" },
    tester: { name: "index.html", lang: "html" },
    reviewer: { name: "index.html", lang: "html" },
    auditor: { name: "index.html", lang: "html" },
    payment: { name: "payment.html", lang: "html" },
    analytics: { name: "analytics.js", lang: "javascript" },
    content: { name: "content.md", lang: "markdown" },
    designer: { name: "design.css", lang: "css" },
    analyzer: { name: "analysis.md", lang: "markdown" },
    memory: { name: "README.md", lang: "markdown" },
    strategy: { name: "strategy.md", lang: "markdown" },
    ux: { name: "ux-design.md", lang: "markdown" },
    brand: { name: "brand-identity.md", lang: "markdown" },
    solutions: { name: "solutions.md", lang: "markdown" },
    architect: { name: "architecture.md", lang: "markdown" },
    research: { name: "user-research.md", lang: "markdown" },
    innovation: { name: "innovation.md", lang: "markdown" },
  };

  // Check for HTML anywhere in content (AI sometimes puts text before DOCTYPE)
  const doctypeIdx = content.indexOf("<!DOCTYPE");
  const htmlTagIdx = content.indexOf("<html");
  
  // Has DOCTYPE anywhere
  if (doctypeIdx >= 0) {
    const closeHtml = content.lastIndexOf("</html>");
    const htmlContent = closeHtml > doctypeIdx 
      ? content.slice(doctypeIdx, closeHtml + 7) 
      : content.slice(doctypeIdx);
    if (htmlContent.length > 200) {
      return [{ name: "index.html", content: htmlContent, language: "html" }];
    }
  }
  
  // Has <html tag anywhere
  if (htmlTagIdx >= 0 && htmlTagIdx < content.length - 100) {
    const closeHtml = content.lastIndexOf("</html>");
    const htmlContent = closeHtml > htmlTagIdx 
      ? content.slice(htmlTagIdx, closeHtml + 7) 
      : content.slice(htmlTagIdx);
    if (htmlContent.length > 200) {
      return [{ name: "index.html", content: htmlContent, language: "html" }];
    }
  }
  
  // Has full HTML structure (head + body)
  const hasFullHtmlStructure = content.includes("<head>") && content.includes("</head>") &&
    content.includes("<body") && content.includes("</body>");
  if (hasFullHtmlStructure) {
    const start = htmlTagIdx >= 0 ? htmlTagIdx : 0;
    return [{ name: "index.html", content: content.slice(start), language: "html" }];
  }

  const fileInfo = extMap[agentId];
  if (!fileInfo) return [{ name: "output.txt", content: cleaned, language: "text" }];
  return [{ name: fileInfo.name, content: cleaned, language: fileInfo.lang }];
}

export { agentsRouter };
