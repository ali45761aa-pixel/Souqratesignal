import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, apiKeys, aiSettings } from "../db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const adminRouter = router({
  // API Keys
  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, ctx.user.id));
    // Mask key values
    return keys.map(k => ({ ...k, keyValue: k.keyValue.slice(0, 8) + "••••••••" }));
  }),

  upsertApiKey: protectedProcedure
    .input(z.object({
      service: z.string(),
      keyValue: z.string().min(1),
      label: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select().from(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.service, input.service)))
        .limit(1);
      if (existing.length > 0) {
        await db.update(apiKeys).set({
          keyValue: input.keyValue,
          label: input.label,
          updatedAt: new Date(),
        }).where(eq(apiKeys.id, existing[0].id));
      } else {
        await db.insert(apiKeys).values({
          userId: ctx.user.id,
          service: input.service,
          keyValue: input.keyValue,
          label: input.label,
        });
      }
      return { success: true };
    }),

  deleteApiKey: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id)));
      return { success: true };
    }),

  // AI Settings
  getAiSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(aiSettings)
      .where(eq(aiSettings.userId, ctx.user.id)).limit(1);
    return result[0] ?? null;
  }),

  updateAiSettings: protectedProcedure
    .input(z.object({
      primaryModel: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(256).max(200000).optional(),
      systemPrompt: z.string().optional(),
      chainOfThought: z.boolean().optional(),
      useOllama: z.boolean().optional(),
      ollamaUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select().from(aiSettings)
        .where(eq(aiSettings.userId, ctx.user.id)).limit(1);
      if (existing.length > 0) {
        await db.update(aiSettings).set({ ...input, updatedAt: new Date() })
          .where(eq(aiSettings.id, existing[0].id));
      } else {
        await db.insert(aiSettings).values({ userId: ctx.user.id, ...input });
      }
      return { success: true };
    }),
});
