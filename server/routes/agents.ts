import { Router, Request, Response } from "express";

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
  const plan = generatePlan(prompt, lang);
  res.json({ plan, totalSteps: plan.length });
});

// ── Execute single agent step with streaming ─────────────────────────────────
agentsRouter.post("/execute-step", async (req: Request, res: Response) => {
  const { prompt, stepId, agentId, lang = "ar", projectContext = "", conversationHistory = [] } = req.body;
  if (!prompt || !agentId) { res.status(400).json({ error: "prompt and agentId required" }); return; }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) { res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" }); return; }

  const agent = AGENTS[agentId as keyof typeof AGENTS];
  if (!agent) { res.status(400).json({ error: "Unknown agent" }); return; }

  const systemPrompt = buildAgentPrompt(agentId, prompt, lang, projectContext);

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
    const useReasoner = ["analyzer", "designer", "security", "tester", "optimizer"].includes(agentId);
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
      ? `أنت مطور Frontend خبير. ابنِ كود HTML/CSS/JavaScript احترافياً كاملاً:
- استخدم Tailwind CSS من CDN
- استخدم Alpine.js للتفاعل
- أضف animations سلسة
- اجعله متجاوباً 100% مع الهاتف
- أضف محتوى عربياً حقيقياً ومناسباً
- اجعل التصميم احترافياً وجميلاً
أرجع الكود الكامل فقط بدون شرح خارجه${ctx}`
      : `You are an expert Frontend developer. Build complete professional HTML/CSS/JavaScript:
- Use Tailwind CSS from CDN
- Use Alpine.js for interactivity
- Add smooth animations
- Make it 100% mobile responsive
- Add real and appropriate content
- Make design professional and beautiful
Return complete code only without external explanation${ctx}`,

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
  };

  return prompts[agentId] || prompts.frontend;
}

// ── Extract files from agent output ──────────────────────────────────────────
function extractFiles(content: string, agentId: string): { name: string; content: string; language: string }[] {
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
    seo: { name: "seo.html", lang: "html" },
    mobile: { name: "index.html", lang: "html" },
    optimizer: { name: "index.html", lang: "html" },
    tester: { name: "index.html", lang: "html" },
  };
  const fileInfo = extMap[agentId];
  if (!fileInfo) return [];
  return [{ name: fileInfo.name, content: cleaned, language: fileInfo.lang }];
}

export { agentsRouter };
