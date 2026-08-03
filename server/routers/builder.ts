import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

// ── DeepSeek direct call ──────────────────────────────────────────────────────
async function callDeepSeek(messages: { role: string; content: string }[], maxTokens = 8000): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY not set");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status} – ${await res.text()}`);
  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Project type detection ────────────────────────────────────────────────────
function detectProjectType(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("لعبة") || p.includes("game")) return "game";
  if (p.includes("بوت") || p.includes("bot") || p.includes("telegram")) return "bot";
  if (p.includes("متجر") || p.includes("store") || p.includes("shop") || p.includes("ecommerce")) return "ecommerce";
  if (p.includes("لوحة") || p.includes("dashboard") || p.includes("admin")) return "dashboard";
  if (p.includes("كتاب") || p.includes("book") || p.includes("مقال") || p.includes("article")) return "content";
  if (p.includes("landing") || p.includes("صفحة هبوط")) return "landing";
  return "website";
}

// ── System prompts per project type ──────────────────────────────────────────
function getSystemPrompt(type: string, lang: string): string {
  const base = lang === "ar"
    ? `أنت خبير في بناء المشاريع الرقمية. مهمتك توليد كود كامل وجاهز للتشغيل.
       قواعد مهمة جداً:
       - أرجع الكود فقط بدون أي شرح أو نص خارج الكود
       - الكود يجب أن يكون كاملاً وقابلاً للتشغيل مباشرة
       - استخدم تصميماً احترافياً وجميلاً
       - أضف محتوى عربياً حقيقياً ومناسباً
       - استخدم Tailwind CSS من CDN للتصميم
       - استخدم Alpine.js من CDN للتفاعل إذا لزم`
    : `You are an expert digital project builder. Generate complete, ready-to-run code.
       Important rules:
       - Return code only, no explanations outside the code
       - Code must be complete and immediately runnable
       - Use professional and beautiful design
       - Add real and appropriate content
       - Use Tailwind CSS from CDN for styling
       - Use Alpine.js from CDN for interactivity if needed`;

  const typeInstructions: Record<string, string> = {
    website: lang === "ar"
      ? "\n- ابنِ موقعاً كاملاً بـ HTML/CSS/JS في ملف واحد\n- أضف: Hero section, Features, About, Contact, Footer\n- اجعله متجاوباً مع الهاتف"
      : "\n- Build a complete website in a single HTML/CSS/JS file\n- Include: Hero section, Features, About, Contact, Footer\n- Make it mobile responsive",
    ecommerce: lang === "ar"
      ? "\n- ابنِ متجراً إلكترونياً كاملاً\n- أضف: منتجات، سلة تسوق، صفحة دفع، فلتر منتجات\n- اجعله جميلاً واحترافياً"
      : "\n- Build a complete e-commerce store\n- Include: products, shopping cart, checkout page, product filter\n- Make it beautiful and professional",
    game: lang === "ar"
      ? "\n- ابنِ لعبة ويب كاملة باستخدام HTML5 Canvas أو Phaser.js\n- اللعبة يجب أن تكون قابلة للتشغيل فوراً\n- أضف: نقاط، مستويات، تأثيرات صوتية بصرية"
      : "\n- Build a complete web game using HTML5 Canvas or vanilla JS\n- Game must be immediately playable\n- Include: score, levels, visual effects",
    dashboard: lang === "ar"
      ? "\n- ابنِ لوحة تحكم احترافية\n- أضف: إحصائيات، رسوم بيانية (Chart.js)، جداول، قائمة جانبية\n- استخدم ألواناً داكنة احترافية"
      : "\n- Build a professional dashboard\n- Include: statistics, charts (Chart.js), tables, sidebar\n- Use professional dark colors",
    landing: lang === "ar"
      ? "\n- ابنِ صفحة هبوط تسويقية احترافية\n- أضف: Hero مع CTA، مميزات، شهادات، أسعار، Footer\n- اجعلها مقنعة وجذابة"
      : "\n- Build a professional marketing landing page\n- Include: Hero with CTA, features, testimonials, pricing, Footer\n- Make it convincing and attractive",
    bot: lang === "ar"
      ? "\n- اكتب كود Python كامل لبوت تليغرام\n- أضف: أوامر أساسية، قوائم تفاعلية، معالجة الرسائل\n- أضف تعليقات توضيحية بالعربية"
      : "\n- Write complete Python code for a Telegram bot\n- Include: basic commands, interactive menus, message handling\n- Add explanatory comments",
    content: lang === "ar"
      ? "\n- اكتب المحتوى المطلوب بشكل كامل ومفصل\n- استخدم تنسيق Markdown\n- اجعله احترافياً وشاملاً"
      : "\n- Write the requested content completely and in detail\n- Use Markdown format\n- Make it professional and comprehensive",
  };

  return base + (typeInstructions[type] || typeInstructions.website);
}

// ── Main builder router ───────────────────────────────────────────────────────
export const builderRouter = router({

  // Build a complete project
  build: publicProcedure
    .input(z.object({
      prompt: z.string().min(1).max(5000),
      lang: z.enum(["ar", "en"]).default("ar"),
      projectType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const type = input.projectType || detectProjectType(input.prompt);
      const systemPrompt = getSystemPrompt(type, input.lang);

      // Step 1: Planning
      const planPrompt = input.lang === "ar"
        ? `قم بتحليل هذا الطلب وأنشئ خطة بناء مفصلة: "${input.prompt}"\n\nأرجع خطة نقطية موجزة (5-8 نقاط) فقط.`
        : `Analyze this request and create a detailed build plan: "${input.prompt}"\n\nReturn a brief bullet plan (5-8 points) only.`;

      const plan = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: planPrompt },
      ], 500);

      // Step 2: Generate the actual code
      const codePrompt = input.lang === "ar"
        ? `ابنِ هذا المشروع بالكامل: "${input.prompt}"\n\nأرجع الكود الكامل فقط. لا تضف أي شرح خارج الكود.`
        : `Build this project completely: "${input.prompt}"\n\nReturn the complete code only. Do not add any explanation outside the code.`;

      const code = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: codePrompt },
      ], 8000);

      // Clean the code (remove markdown code blocks if present)
      const cleanCode = code
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/^```\n?/gm, "")
        .trim();

      // Determine file extension
      const ext = type === "bot" ? "py" : type === "content" ? "md" : "html";
      const filename = `project.${ext}`;

      return {
        success: true,
        projectType: type,
        plan,
        code: cleanCode,
        filename,
        language: ext === "py" ? "python" : ext === "md" ? "markdown" : "html",
      };
    }),

  // Improve/iterate on existing code
  improve: publicProcedure
    .input(z.object({
      code: z.string(),
      instruction: z.string(),
      lang: z.enum(["ar", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      const prompt = input.lang === "ar"
        ? `عدّل هذا الكود بناءً على التعليمات التالية: "${input.instruction}"\n\nالكود الحالي:\n${input.code}\n\nأرجع الكود المعدّل فقط.`
        : `Modify this code based on: "${input.instruction}"\n\nCurrent code:\n${input.code}\n\nReturn the modified code only.`;

      const improved = await callDeepSeek([
        { role: "system", content: "You are an expert code editor. Return only the modified code, no explanations." },
        { role: "user", content: prompt },
      ], 8000);

      const cleanCode = improved
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/^```\n?/gm, "")
        .trim();

      return { success: true, code: cleanCode };
    }),
});
