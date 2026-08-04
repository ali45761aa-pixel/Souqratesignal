import { Router, Request, Response } from "express";

import { detectTheme, generateDesignSystemCSS, getDesignInstructions, DESIGN_THEMES } from '../lib/designSystem';
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

  return basePlan;
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
- agentId: أحد الوكلاء التالية فقط: analyzer, designer, frontend, backend, database, security, content, bot, game, payment, analytics, seo, mobile, tester, docs, deployer, optimizer, memory
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
- agentId: one of: analyzer, designer, frontend, backend, database, security, content, bot, game, payment, analytics, seo, mobile, tester, docs, deployer, optimizer, memory
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
    } catch {
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
  const { prompt, stepId, agentId, lang = "ar", projectContext = "", conversationHistory = [], previousFiles = [] } = req.body;
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

  const systemPrompt = buildAgentPrompt(agentId, prompt, lang, richContext);

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
    const useReasoner = ["analyzer", "designer", "security", "tester", "optimizer", "strategy", "ux", "brand", "solutions", "architect", "research", "innovation", "auditor"].includes(agentId);
    const model = useReasoner ? "deepseek-reasoner" : "deepseek-chat";

    // Send thinking start event
    res.write(`data: ${JSON.stringify({ type: "thinking_start", model })}\n\n`);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_tokens: useReasoner ? 8000 : 6000, temperature: useReasoner ? 0.6 : 0.7, stream: true }),
    });

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
          const delta = parsed.choices?.[0]?.delta;
          // Handle reasoning_content (thinking phase from deepseek-reasoner)
          if (delta?.reasoning_content) {
            thinkingContent += delta.reasoning_content;
            if (!isInThinking) {
              isInThinking = true;
            }
            res.write(`data: ${JSON.stringify({ type: "thinking", content: delta.reasoning_content })}\n\n`);
          }
          // Handle actual content
          if (delta?.content) {
            if (isInThinking) {
              isInThinking = false;
              res.write(`data: ${JSON.stringify({ type: "thinking_done", thinkingLength: thinkingContent.length })}\n\n`);
            }
            fullContent += delta.content;
            res.write(`data: ${JSON.stringify({ type: "chunk", content: delta.content })}\n\n`);
          }
        } catch {}
      }
    }

    // Extract code files from content
    const files = extractFiles(fullContent, agentId);
    res.write(`data: ${JSON.stringify({ type: "done", content: fullContent, files, agentId, stepId, hadThinking: thinkingContent.length > 0 })}\n\n`);
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
        } catch {}
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
function buildAgentPrompt(agentId: string, prompt: string, lang: string, context: string): string {
  const ar = lang === "ar";
  const ctx = context ? `\n\nسياق المشروع حتى الآن:\n${context.slice(0, 2000)}` : "";

  const themeKey = detectTheme(prompt);
  const designCSS = generateDesignSystemCSS(themeKey);
  const designInstructions = getDesignInstructions(themeKey, prompt);
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
      ? `أنت مطور Frontend خبير بمستوى عالمي. أنشئ موقعاً احترافياً مذهلاً يُباع بآلاف الدولارات.

${designInstructions}

متطلبات صارمة:
1. ابدأ بـ <!DOCTYPE html> كامل
2. ادمج CSS Design System كاملاً في <style> (الـ CSS المُعرَّف في designCSS)
3. استخدم CSS variables المُعرَّفة: var(--primary), var(--bg), var(--gradient), إلخ
4. كل قسم مكتمل: Hero + Features + Stats + Testimonials + CTA + Footer
5. أضف JavaScript: mobile menu, smooth scroll, IntersectionObserver للـ animations
6. استخدم صور Unsplash حقيقية: https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80
7. أضف محتوى عربياً حقيقياً ومناسباً للمشروع
8. gradient text للعناوين، glow effects للأزرار، glassmorphism للبطاقات
9. RTL كامل، dir="rtl" على html
10. أرجع الكود الكامل فقط — لا شرح${ctx}`
      : `You are a world-class Frontend developer. Build a stunning website worth thousands of dollars.

${designInstructions}

STRICT REQUIREMENTS:
1. Start with complete <!DOCTYPE html>
2. Embed full CSS Design System in <style> tag (the CSS from designCSS variable)
3. Use CSS variables EXACTLY: var(--primary), var(--bg), var(--gradient), etc.
4. Every section complete: Hero + Features + Stats + Testimonials + CTA + Footer
5. Add JavaScript: mobile menu, smooth scroll, IntersectionObserver for scroll animations
6. Use real Unsplash images: https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80
7. Add real, relevant content matching the project
8. gradient text on headings, glow on buttons, glassmorphism cards
9. Return COMPLETE code only — no explanation${ctx}`,
    backend: ar
      ? `أنت مطور Backend خبير. اكتب كود Node.js + Express كاملاً:
- RESTful API endpoints
- Middleware (cors, helmet, morgan)
- Error handling
- Environment variables
- اكتب الكود في ملف server.js مع تعليقات واضحة${ctx}`
      : `You are an expert Backend developer. Write complete Node.js + Express code:
- RESTful API endpoints
- Middleware (cors, helmet, morgan)
- Error handling
- Environment variables
- Write code in server.js with clear comments${ctx}`,

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
      ? `أنت وكيل المراجعة المتخصص. راجع الكود بالكامل وأصلح كل مشكلة.
1. تحقق من الروابط والأزرار
2. تحقق من عدم وجود أخطاء JS
3. تحقق من CSS على كل الأجهزة
4. أصلح أي خطأ فوراً
إذا وجدت خطأ: "⚠️ خطأ: [الوصف]" ثم "✅ الإصلاح: [ما فعلته]"
أرجع الكود المُصحَّح.${ctx}`
      : `You are the Review Agent. Review ALL code and fix every issue. Check links, buttons, JS errors, CSS, forms. For each bug: "⚠️ Bug: [desc]" then "✅ Fix: [action]". Return corrected code.${ctx}`,
    auditor: ar
      ? `أنت وكيل التدقيق العميق — أقوى وكيل. لا تتسامح مع أي خلل.
دقّق في:
🔐 الأمان: XSS, SQL Injection, CSRF
⚡ الأداء: حجم الملفات, render blocking
🎨 UX: أزرار 44px, تباين WCAG AA, loading/empty/error states
♿ Accessibility: alt text, aria-labels, keyboard nav
📱 Responsive: يعمل على 320px, لا overflow
🧹 Clean Code: لا تكرار, تسمية واضحة
لكل مشكلة: "🔴 حرجة" / "🟡 تحسين" / "🟢 ملاحظة"
أرجع الكود المدقق. تقييم من 10.${ctx}`
      : `You are the Deep Audit Agent — most powerful. Tolerate ZERO defects.
Audit: Security (XSS/CSRF/SQLi), Performance, UX (44px buttons, WCAG AA), Accessibility, Responsive (320px), Clean Code.
For each: "🔴 Critical" / "🟡 Improvement" / "🟢 Note". Return audited code. Score /10.${ctx}`,

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

  return prompts[agentId] || prompts.frontend;
}

// ── Extract files from agent output ──────────────────────────────────────────
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
        if (existing >= 0) { namedBlocks[existing] = { name: fileInfo.name, content: blockContent, language: fileInfo.lang }; }
        else { namedBlocks.push({ name: fileInfo.name, content: blockContent, language: fileInfo.lang }); }
      }
    }
  }

  if (namedBlocks.length > 0) return namedBlocks;

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

  // If content contains HTML tags, treat as HTML
  if (content.includes("<!DOCTYPE") || content.includes("<html") || content.includes("<body")) {
    const htmlStart = content.indexOf("<!DOCTYPE") >= 0 ? content.indexOf("<!DOCTYPE") : content.indexOf("<html");
    if (htmlStart >= 0) {
      return [{ name: "index.html", content: content.slice(htmlStart), language: "html" }];
    }
  }

  const fileInfo = extMap[agentId];
  if (!fileInfo) return [{ name: "output.txt", content: cleaned, language: "text" }];
  return [{ name: fileInfo.name, content: cleaned, language: fileInfo.lang }];
}

export { agentsRouter };
