import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

// ── DeepSeek direct call (independent from Manus Forge) ──────────────────────
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY not set");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek error: ${res.status} – ${err}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content ?? "";
}

export const chatRouter = router({
  send: publicProcedure
    .input(z.object({
      content: z.string().min(1).max(10000),
      projectId: z.number().optional(),
      lang: z.enum(["ar", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = input.lang === "ar"
        ? `أنت منصة وكيل ذكاء اصطناعي متكاملة. مهمتك تحليل طلبات المستخدم وبناء مشاريع كاملة.
           أجب دائماً بالعربية ما لم يطلب المستخدم غير ذلك.
           عند استلام طلب، حلل المتطلبات وقسمها إلى مهام واضحة، واقترح التقنيات المناسبة.
           كن محدداً ومفصلاً في إجاباتك.`
        : `You are a comprehensive AI agent platform. Analyze user requests and build complete projects.
           Be specific and detailed in your responses.`;

      let assistantText = "";
      try {
        assistantText = await callDeepSeek([
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content },
        ]);
        const steps = generateWorkflowSteps(input.content, input.lang);
        return { message: assistantText, steps, tokensUsed: 0 };
      } catch (err) {
        // No API key configured - return helpful message
        const steps = generateWorkflowSteps(input.content, input.lang);
        const fallback = input.lang === "ar"
          ? `مرحباً! تم استلام طلبك: "${input.content}"\n\nلتفعيل الذكاء الاصطناعي الكامل، يرجى إضافة مفتاح API من لوحة الإدارة (Admin → API Keys).\n\nالمفاتيح المدعومة: Anthropic Claude, OpenAI GPT-4, DeepSeek`
          : `Hello! Your request was received: "${input.content}"\n\nTo enable full AI functionality, please add an API key from the Admin panel (Admin → API Keys).\n\nSupported: Anthropic Claude, OpenAI GPT-4, DeepSeek`;
        return { message: fallback, steps, tokensUsed: 0 };
      }
    }),

  getMessages: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => []),
});

function generateWorkflowSteps(prompt: string, lang: "ar" | "en") {
  const lower = prompt.toLowerCase();
  const steps: any[] = [];
  let order = 1;

  steps.push({ id: String(order++), agent: "planning", title: "Analyzing requirements", titleAr: "تحليل المتطلبات", status: "in_progress" as const, startedAt: Date.now() });
  steps.push({ id: String(order++), agent: "design", title: "Choosing design system", titleAr: "اختيار نظام التصميم", status: "pending" as const });
  steps.push({ id: String(order++), agent: "programming", title: "Writing frontend code", titleAr: "كتابة كود الواجهة", status: "pending" as const });

  if (lower.includes("متجر") || lower.includes("store") || lower.includes("shop")) {
    steps.push({ id: String(order++), agent: "payments", title: "Setting up payment system", titleAr: "إعداد نظام الدفع", status: "pending" as const });
  }
  if (lower.includes("بوت") || lower.includes("bot") || lower.includes("telegram")) {
    steps.push({ id: String(order++), agent: "bots", title: "Building Telegram bot", titleAr: "بناء بوت تليغرام", status: "pending" as const });
  }
  if (lower.includes("كتاب") || lower.includes("book")) {
    steps.push({ id: String(order++), agent: "writing", title: "Writing book chapters", titleAr: "كتابة فصول الكتاب", status: "pending" as const });
  }
  if (lower.includes("لعبة") || lower.includes("game")) {
    steps.push({ id: String(order++), agent: "games", title: "Building game", titleAr: "بناء اللعبة", status: "pending" as const });
  }

  steps.push({ id: String(order++), agent: "content", title: "Generating content & SEO", titleAr: "توليد المحتوى و SEO", status: "pending" as const });
  steps.push({ id: String(order++), agent: "qa", title: "Testing & validation", titleAr: "الاختبار والتحقق", status: "pending" as const });

  return steps;
}
