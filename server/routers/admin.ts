import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, apiKeys, aiSettings } from "../db";
import { eq, and } from "drizzle-orm";

const MOCK_API_KEYS: Record<string, { key: string; label?: string }> = {};
const MOCK_AI_SETTINGS = {
  primaryModel: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 8000,
  systemPrompt: "",
  chainOfThought: true,
  useOllama: false,
  ollamaUrl: "",
};

export const adminRouter = router({
  getApiKeys: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) {
      return Object.entries(MOCK_API_KEYS).map(([service, data], i) => ({
        id: i + 1, service, keyValue: "***" + data.key.slice(-4), label: data.label, isActive: true,
      }));
    }
    try {
      const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
      return keys.map(k => ({ ...k, keyValue: "***" + k.keyValue.slice(-4) }));
    } catch { return []; }
  }),

  setApiKey: publicProcedure
    .input(z.object({ service: z.string(), keyValue: z.string(), label: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) {
        MOCK_API_KEYS[input.service] = { key: input.keyValue, label: input.label };
        return { success: true };
      }
      try {
        await db.delete(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.service, input.service)));
        await db.insert(apiKeys).values({ userId, service: input.service, keyValue: input.keyValue, label: input.label });
        return { success: true };
      } catch (e: any) { return { success: false, error: e.message }; }
    }),

  deleteApiKey: publicProcedure
    .input(z.object({ service: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) { delete MOCK_API_KEYS[input.service]; return { success: true }; }
      try {
        await db.delete(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.service, input.service)));
        return { success: true };
      } catch { return { success: false }; }
    }),

  getAiSettings: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) return MOCK_AI_SETTINGS;
    try {
      const rows = await db.select().from(aiSettings).where(eq(aiSettings.userId, userId)).limit(1);
      return rows[0] ?? MOCK_AI_SETTINGS;
    } catch { return MOCK_AI_SETTINGS; }
  }),

  updateAiSettings: publicProcedure
    .input(z.object({
      primaryModel: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      systemPrompt: z.string().optional(),
      chainOfThought: z.boolean().optional(),
      useOllama: z.boolean().optional(),
      ollamaUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) { Object.assign(MOCK_AI_SETTINGS, input); return MOCK_AI_SETTINGS; }
      try {
        const existing = await db.select({ id: aiSettings.id }).from(aiSettings).where(eq(aiSettings.userId, userId)).limit(1);
        if (existing.length > 0) {
          const rows = await db.update(aiSettings).set({ ...input, updatedAt: new Date() }).where(eq(aiSettings.userId, userId)).returning();
          return rows[0];
        } else {
          const rows = await db.insert(aiSettings).values({ userId, ...input } as any).returning();
          return rows[0];
        }
      } catch { Object.assign(MOCK_AI_SETTINGS, input); return MOCK_AI_SETTINGS; }
    }),

  getKeyValue: publicProcedure
    .input(z.object({ service: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) {
        const data = MOCK_API_KEYS[input.service];
        return data ? { keyValue: data.key } : null;
      }
      try {
        const rows = await db.select({ keyValue: apiKeys.keyValue }).from(apiKeys)
          .where(and(eq(apiKeys.userId, userId), eq(apiKeys.service, input.service))).limit(1);
        return rows[0] ?? null;
      } catch { return null; }
    }),
});
