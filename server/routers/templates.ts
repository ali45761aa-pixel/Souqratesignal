import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb, templates, plugins } from "../db";
import { eq, desc } from "drizzle-orm";

export const templatesRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const all = await db.select().from(templates).where(eq(templates.isActive, true)).orderBy(desc(templates.usageCount));
      if (input?.category) return all.filter(t => t.category === input.category);
      return all;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(templates).where(eq(templates.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  // Plugins
  listPlugins: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(plugins).orderBy(desc(plugins.createdAt));
  }),

  togglePlugin: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["active","inactive"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(plugins).set({ status: input.status }).where(eq(plugins.id, input.id));
      return { success: true };
    }),
});
