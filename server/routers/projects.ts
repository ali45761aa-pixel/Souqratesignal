import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, projects } from "../db";
import { eq, desc } from "drizzle-orm";

export const projectsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(256),
      prompt: z.string().min(1),
      projectType: z.string().optional(),
      templateId: z.number().optional(),
      totalCost: z.number().optional(),
      tokensUsed: z.number().optional(),
      status: z.enum(["active", "completed", "failed", "paused"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      const rows = await db.insert(projects).values({
        userId,
        name: input.name,
        prompt: input.prompt,
        projectType: input.projectType,
        templateId: input.templateId,
        status: (input.status ?? "active") as any,
        totalCost: input.totalCost ?? 0,
        tokensUsed: input.tokensUsed ?? 0,
      }).$returningId();
      return rows[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["active", "completed", "failed", "paused"]).optional(),
      isFavorite: z.boolean().optional(),
      totalCost: z.number().optional(),
      tokensUsed: z.number().optional(),
      previewUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      await db.update(projects).set({ ...updates, updatedAt: new Date() }).where(eq(projects.id, id));
      const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return rows[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    const all = await db.select().from(projects).where(eq(projects.userId, userId));
    return {
      total: all.length,
      active: all.filter((p: any) => p.status === "active").length,
      completed: all.filter((p: any) => p.status === "completed").length,
      failed: all.filter((p: any) => p.status === "failed").length,
      totalCost: all.reduce((s: number, p: any) => s + (p.totalCost ?? 0), 0),
      tokensUsed: all.reduce((s: number, p: any) => s + (p.tokensUsed ?? 0), 0),
    };
  }),

  toggleFavorite: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const rows = await db.select({ isFavorite: projects.isFavorite }).from(projects).where(eq(projects.id, input.id)).limit(1);
      const current = rows[0]?.isFavorite ?? false;
      await db.update(projects).set({ isFavorite: !current }).where(eq(projects.id, input.id));
      return { success: true, isFavorite: !current };
    }),
});
