import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, projects, projectTasks, projectFiles, projectVersions, chatMessages } from "../db";
import { eq, desc, and } from "drizzle-orm";

export const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .orderBy(desc(projects.createdAt));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)))
        .limit(1);
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(256),
      prompt: z.string().min(1),
      projectType: z.string().optional(),
      templateId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(projects).values({
        userId: ctx.user.id,
        name: input.name,
        prompt: input.prompt,
        projectType: input.projectType,
        templateId: input.templateId,
        status: "active",
      }).returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["active","completed","failed","paused"]).optional(),
      isFavorite: z.boolean().optional(),
      rating: z.number().min(1).max(5).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(projects)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(projects.id, id), eq(projects.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
      return { success: true };
    }),

  getTasks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(projectTasks)
        .where(eq(projectTasks.projectId, input.projectId))
        .orderBy(projectTasks.stepOrder);
    }),

  getVersions: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(projectVersions)
        .where(eq(projectVersions.projectId, input.projectId))
        .orderBy(desc(projectVersions.versionNumber));
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { active: 0, completed: 0, failed: 0, totalCost: 0, tokensUsed: 0 };
    const all = await db.select().from(projects).where(eq(projects.userId, ctx.user.id));
    return {
      active: all.filter(p => p.status === "active").length,
      completed: all.filter(p => p.status === "completed").length,
      failed: all.filter(p => p.status === "failed").length,
      totalCost: all.reduce((s, p) => s + (p.totalCost ?? 0), 0),
      tokensUsed: all.reduce((s, p) => s + (p.tokensUsed ?? 0), 0),
      total: all.length,
    };
  }),
});
