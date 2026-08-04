import { Router, Request, Response } from "express";

const streamRouter = Router();

// ── System prompts ────────────────────────────────────────────────────────────
function getSystemPrompt(type: string, lang: string): string {
  const isAr = lang === "ar";
  const base = isAr
    ? `أنت مطور Frontend بمستوى Awwwards. مهمتك بناء موقع احترافي مذهل يُباع بآلاف الدولارات.

قواعد إلزامية:
1. ابدأ بـ <!DOCTYPE html><html lang="ar" dir="rtl"> مع meta charset وviewport وtitle حقيقي
2. استخدم Google Fonts (Cairo أو Tajawal) من CDN
3. اكتب CSS مخصصاً احترافياً مع متغيرات CSS
4. الأقسام الإلزامية: NAV sticky + HERO + STATS + FEATURES + HOW IT WORKS + TESTIMONIALS + PRICING + CTA + FOOTER
5. JavaScript إلزامي: Scroll Reveal + Counter Animation + Mobile Menu + Smooth Scroll
6. محتوى عربي حقيقي مناسب للمشروع — لا Lorem ipsum أبداً
7. استخدم rgba(var(--primary-rgb), 0.1) للشفافية
8. أضف class="reveal" لكل section رئيسي
⚠️ أرجع HTML الكامل فقط داخل \`\`\`html ... \`\`\` — أول حرف في ردك يجب أن يكون \`\`\`html`
    : `You are a world-class Frontend developer at Awwwards level. Build a stunning professional website.

MANDATORY RULES:
1. Start with <!DOCTYPE html><html lang="en"> with real meta charset, viewport, title
2. Use Google Fonts (Inter or Poppins) from CDN
3. Write custom professional CSS with CSS variables
4. MANDATORY SECTIONS: sticky NAV + HERO + STATS + FEATURES + HOW IT WORKS + TESTIMONIALS + PRICING + CTA + FOOTER
5. MANDATORY JS: Scroll Reveal + Counter Animation + Mobile Menu + Smooth Scroll
6. Real relevant content — NO Lorem ipsum EVER
7. Use rgba(var(--primary-rgb), 0.1) for transparency
8. Add class="reveal" to every major section
⚠️ Return ONLY complete HTML inside \`\`\`html ... \`\`\` — first character MUST be \`\`\`html`;

  const extras: Record<string, string> = {
    fullstack: isAr
      ? `\nابنِ تطبيقاً Full-stack كاملاً:
- Frontend: HTML/CSS/JS احترافي في ملف index.html
- Backend: Node.js + Express في ملف server.js
- قاعدة بيانات: SQL schema في ملف schema.sql
- README.md: تعليمات التثبيت والتشغيل
- package.json: جميع التبعيات
أرجع كل ملف مع header واضح: === FILE: filename ===`
      : `\nBuild a complete Full-stack application:
- Frontend: Professional HTML/CSS/JS in index.html
- Backend: Node.js + Express in server.js
- Database: SQL schema in schema.sql
- README.md: Installation and run instructions
- package.json: All dependencies
Return each file with clear header: === FILE: filename ===`,
    ecommerce: isAr
      ? `\nابنِ متجراً إلكترونياً كاملاً مع:
- صفحة رئيسية مع Hero section جذاب
- عرض المنتجات مع فلتر وبحث
- سلة تسوق تفاعلية (Alpine.js)
- صفحة تفاصيل المنتج
- نموذج الدفع
- تصميم احترافي مع ألوان متناسقة`
      : `\nBuild a complete e-commerce store with:
- Homepage with attractive Hero section
- Product display with filter and search
- Interactive shopping cart (Alpine.js)
- Product detail page
- Payment form
- Professional design with harmonious colors`,
    game: isAr
      ? `\nابنِ لعبة ويب كاملة مع:
- HTML5 Canvas أو DOM للعبة
- نظام نقاط ومستويات
- تأثيرات بصرية وصوتية
- شاشة بداية ونهاية
- تعليمات اللعب
- تصميم جذاب`
      : `\nBuild a complete web game with:
- HTML5 Canvas or DOM for game
- Score and level system
- Visual and sound effects
- Start and end screens
- Game instructions
- Attractive design`,
    dashboard: isAr
      ? `\nابنِ لوحة تحكم احترافية مع:
- Sidebar قابل للطي
- إحصائيات مع أرقام متحركة
- رسوم بيانية (Chart.js من CDN)
- جداول بيانات مع فلتر
- Dark mode افتراضي
- تصميم احترافي`
      : `\nBuild a professional dashboard with:
- Collapsible sidebar
- Statistics with animated numbers
- Charts (Chart.js from CDN)
- Data tables with filter
- Dark mode by default
- Professional design`,
    landing: isAr
      ? `\nابنِ صفحة هبوط تسويقية احترافية مع:
- Hero section مع CTA قوي
- قسم المميزات مع أيقونات
- شهادات العملاء
- جدول الأسعار
- FAQ
- Footer احترافي
- Scroll animations`
      : `\nBuild a professional marketing landing page with:
- Hero section with strong CTA
- Features section with icons
- Customer testimonials
- Pricing table
- FAQ
- Professional footer
- Scroll animations`,
    bot: isAr
      ? `\nاكتب كود Python كامل لبوت تليغرام مع:
- استخدام python-telegram-bot library
- أوامر أساسية (/start, /help, /menu)
- قوائم تفاعلية (InlineKeyboard)
- معالجة الرسائل النصية
- نظام حالات (ConversationHandler)
- تعليقات توضيحية بالعربية
- ملف requirements.txt
- README.md للتثبيت`
      : `\nWrite complete Python code for a Telegram bot with:
- python-telegram-bot library
- Basic commands (/start, /help, /menu)
- Interactive menus (InlineKeyboard)
- Text message handling
- State system (ConversationHandler)
- Explanatory comments
- requirements.txt
- README.md for installation`,
    website: isAr
      ? `\nابنِ موقعاً كاملاً مع:
- Header مع navigation
- Hero section جذاب
- قسم الخدمات/المنتجات
- قسم "من نحن"
- شهادات العملاء
- نموذج تواصل
- Footer احترافي
- Smooth scroll animations`
      : `\nBuild a complete website with:
- Header with navigation
- Attractive Hero section
- Services/Products section
- About us section
- Customer testimonials
- Contact form
- Professional footer
- Smooth scroll animations`,
  };

  return base + (extras[type] || extras.website);
}

function detectType(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("full-stack") || p.includes("fullstack") || p.includes("تطبيق كامل") || p.includes("full stack")) return "fullstack";
  if (p.includes("لعبة") || p.includes("game")) return "game";
  if (p.includes("بوت") || p.includes("bot") || p.includes("telegram") || p.includes("تليغرام")) return "bot";
  if (p.includes("متجر") || p.includes("store") || p.includes("shop") || p.includes("ecommerce") || p.includes("تجارة")) return "ecommerce";
  if (p.includes("لوحة") || p.includes("dashboard") || p.includes("admin") || p.includes("إدارة")) return "dashboard";
  if (p.includes("landing") || p.includes("هبوط") || p.includes("تسويق")) return "landing";
  return "website";
}

// ── Streaming endpoint ────────────────────────────────────────────────────────
streamRouter.post("/stream-build", async (req: Request, res: Response) => {
  const { prompt, lang = "ar", conversationHistory = [] } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt required" });
    return;
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" });
    return;
  }

  const type = detectType(prompt);
  const systemPrompt = getSystemPrompt(type, lang);

  // Build messages with conversation history for multi-turn
  const messages: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: prompt },
  ];

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    // Send project type info first
    res.write(`data: ${JSON.stringify({ type: "meta", projectType: type })}\n\n`);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        max_tokens: 16000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.write(`data: ${JSON.stringify({ type: "error", message: err })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ type: "error", message: "No response body" })}\n\n`);
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`);
            }
          } catch (_e) { /* intentional */ }
        }
      }
    }

    // Clean HTML output — extract only the HTML part
    let cleanCode = fullContent;
    const htmlBlock = fullContent.match(/```html\s*([\s\S]*?)```/i);
    if (htmlBlock) {
      cleanCode = htmlBlock[1].trim();
    } else {
      const anyBlock = fullContent.match(/```\w*\s*(<!DOCTYPE[\s\S]*?)```/i);
      if (anyBlock) {
        cleanCode = anyBlock[1].trim();
      } else {
        const doctypeIdx = fullContent.indexOf("<!DOCTYPE");
        if (doctypeIdx >= 0) {
          const closeHtml = fullContent.lastIndexOf("</html>");
          cleanCode = closeHtml > doctypeIdx ? fullContent.slice(doctypeIdx, closeHtml + 7) : fullContent.slice(doctypeIdx);
        } else {
          cleanCode = fullContent.replace(/^```[\w]*\n?/gm, "").replace(/^```\n?/gm, "").trim();
        }
      }
    }

    // Parse multi-file output
    const files = parseFiles(cleanCode, type);

    res.write(`data: ${JSON.stringify({ type: "done", files, projectType: type })}\n\n`);
    res.end();

  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

// ── Parse multi-file output ───────────────────────────────────────────────────
function parseFiles(code: string, type: string): { name: string; content: string; language: string }[] {
  // Inject SEO meta tags into HTML files
  const injectSEO = (html: string, prompt: string): string => {
    if (!html.includes("<head>") && !html.includes("<HEAD>")) return html;
    const title = prompt.slice(0, 60);
    const desc = prompt.slice(0, 160);
    const seoTags = `
  <!-- SEO Auto-generated -->
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${prompt.split(" ").slice(0, 10).join(", ")}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <link rel="canonical" href="/">
  <!-- End SEO -->`;
    return html.replace(/<head>/i, `<head>${seoTags}`);
  };

  const files: { name: string; content: string; language: string }[] = [];

  // Check if output has file markers
  if (code.includes("=== FILE:")) {
    const parts = code.split(/=== FILE: (.+?) ===/);
    for (let i = 1; i < parts.length; i += 2) {
      const filename = parts[i].trim();
      const content = (parts[i + 1] || "").trim();
      files.push({
        name: filename,
        content,
        language: getLanguage(filename),
      });
    }
  } else {
    // Single file
    const ext = type === "bot" ? "py" : "html";
    files.push({
      name: `index.${ext}`,
      content: code,
      language: ext === "py" ? "python" : "html",
    });
  }

  return files.length > 0 ? files : [{ name: "index.html", content: code, language: "html" }];
}

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    html: "html", css: "css", js: "javascript", ts: "typescript",
    py: "python", json: "json", md: "markdown", sql: "sql",
    sh: "bash", yml: "yaml", yaml: "yaml",
  };
  return map[ext] || "text";
}

export { streamRouter };
