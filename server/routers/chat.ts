import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb, chatMessages, projects } from "../db";
import { eq } from "drizzle-orm";

export const chatRouter = router({
  send: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(10000),
      projectId: z.number().optional(),
      lang: z.enum(["ar", "en"]).default("ar"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      // Save user message
      if (db && input.projectId) {
        await db.insert(chatMessages).values({
          userId: userId,
          projectId: input.projectId,
          role: "user",
          content: input.content,
        });
      }

      // Build system prompt
      const systemPrompt = input.lang === "ar"
        ? `أنت منصة وكيل ذكاء اصطناعي متكاملة. مهمتك تحليل طلبات المستخدم وبناء مشاريع كاملة. 
           أجب دائماً بالعربية ما لم يطلب المستخدم غير ذلك.
           عند استلام طلب، حلل المتطلبات وقسمها إلى مهام واضحة، واقترح التقنيات المناسبة.
           كن محدداً ومفصلاً في إجاباتك.`
        : `You are a comprehensive AI agent platform. Your task is to analyze user requests and build complete projects.
           Respond in English unless the user requests otherwise.
           When receiving a request, analyze requirements, break them into clear tasks, and suggest appropriate technologies.
           Be specific and detailed in your responses.`;

      // Call LLM
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content },
        ],
      });

      const assistantContent = response.choices?.[0]?.message?.content ?? "";

      // Save assistant message
      const assistantText = typeof assistantContent === "string" ? assistantContent : JSON.stringify(assistantContent);
      if (db && input.projectId) {
        await db.insert(chatMessages).values({
          userId: userId,
          projectId: input.projectId,
          role: "assistant",
          content: assistantText,
          tokensUsed: response.usage?.total_tokens ?? 0,
          model: response.model,
        });
      }

      // Generate workflow steps based on prompt analysis
      const steps = generateWorkflowSteps(input.content, input.lang);

      return {
        message: assistantText,
        steps,
        tokensUsed: response.usage?.total_tokens ?? 0,
      };
    }),

  getMessages: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(chatMessages)
        .where(eq(chatMessages.projectId, input.projectId));
    }),
});

function generateWorkflowSteps(prompt: string, lang: "ar" | "en") {
  const lower = prompt.toLowerCase();
  const steps = [];
  let order = 1;

  steps.push({ id: String(order++), agent: "planning", title: "Analyzing requirements", titleAr: "تحليل المتطلبات", status: "in_progress" as const, startedAt: Date.now() });
  steps.push({ id: String(order++), agent: "design", title: "Choosing design system", titleAr: "اختيار نظام التصميم", status: "pending" as const });
  steps.push({ id: String(order++), agent: "programming", title: "Writing frontend code", titleAr: "كتابة كود الواجهة", status: "pending" as const });

  if (lower.includes("متجر") || lower.includes("store") || lower.includes("shop") || lower.includes("ecommerce")) {
    steps.push({ id: String(order++), agent: "payments", title: "Setting up payment system", titleAr: "إعداد نظام الدفع", status: "pending" as const });
  }
  if (lower.includes("بوت") || lower.includes("bot") || lower.includes("telegram") || lower.includes("تليغرام")) {
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
