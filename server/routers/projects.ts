import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, projects, projectVersions } from "../db";
import { eq, desc, and } from "drizzle-orm";

// Fallback mock data when DB is not connected
const MOCK_PROJECTS: any[] = [
  { id: 1, userId: 1, name: "متجر عطور", projectType: "ecommerce", status: "completed", createdAt: new Date(), updatedAt: new Date(), totalCost: 150.50, tokensUsed: 45000, isFavorite: true, tags: ["ecommerce"], prompt: "ابني لي متجر عطور" },
  { id: 2, userId: 1, name: "بوت تليغرام", projectType: "bot", status: "active", createdAt: new Date(), updatedAt: new Date(), totalCost: 75.00, tokensUsed: 30000, isFavorite: false, tags: ["bot"], prompt: "اصنع بوت تليغرام" },
  { id: 3, userId: 1, name: "موقع شركة", projectType: "company", status: "completed", createdAt: new Date(), updatedAt: new Date(), totalCost: 225.00, tokensUsed: 50000, isFavorite: true, tags: ["company"], prompt: "ابني موقع شركة" },
];

export const projectsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return MOCK_PROJECTS;
    try {
      const userId = (ctx as any).user?.id ?? 1;
      return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
    } catch { return MOCK_PROJECTS; }
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return MOCK_PROJECTS.find(p => p.id === input.id) ?? null;
      try {
        const rows = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
        return rows[0] ?? null;
      } catch { return null; }
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
      if (!db) {
        const newProject = { id: MOCK_PROJECTS.length + 1, userId, ...input, status: input.status ?? "active", totalCost: input.totalCost ?? 0, tokensUsed: input.tokensUsed ?? 0, isFavorite: false, tags: [], createdAt: new Date(), updatedAt: new Date() };
        MOCK_PROJECTS.unshift(newProject);
        return newProject;
      }
      try {
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
      } catch (e) {
        const newProject = { id: MOCK_PROJECTS.length + 1, userId, ...input, status: input.status ?? "active", totalCost: input.totalCost ?? 0, tokensUsed: input.tokensUsed ?? 0, isFavorite: false, tags: [], createdAt: new Date(), updatedAt: new Date() };
        MOCK_PROJECTS.unshift(newProject);
        return newProject;
      }
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
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        const p = MOCK_PROJECTS.find(p => p.id === input.id);
        if (p) Object.assign(p, input);
        return p;
      }
      try {
        const { id, ...updates } = input;
        const rows = await db.update(projects).set({ ...updates, updatedAt: new Date() }).where(eq(projects.id, id)) as any;
        return rows[0];
      } catch { return null; }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        const idx = MOCK_PROJECTS.findIndex(p => p.id === input.id);
        if (idx >= 0) MOCK_PROJECTS.splice(idx, 1);
        return { success: true };
      }
      try {
        await db.delete(projects).where(eq(projects.id, input.id));
        return { success: true };
      } catch { return { success: false }; }
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      const all = MOCK_PROJECTS;
      return {
        total: all.length,
        active: all.filter(p => p.status === "active").length,
        completed: all.filter(p => p.status === "completed").length,
        failed: all.filter(p => p.status === "failed").length,
        totalCost: all.reduce((s, p) => s + (p.totalCost ?? 0), 0),
        tokensUsed: all.reduce((s, p) => s + (p.tokensUsed ?? 0), 0),
      };
    }
    try {
      const userId = (ctx as any).user?.id ?? 1;
      const all = await db.select().from(projects).where(eq(projects.userId, userId));
      return {
        total: all.length,
        active: all.filter(p => p.status === "active").length,
        completed: all.filter(p => p.status === "completed").length,
        failed: all.filter(p => p.status === "failed").length,
        totalCost: all.reduce((s, p) => s + (p.totalCost ?? 0), 0),
        tokensUsed: all.reduce((s, p) => s + (p.tokensUsed ?? 0), 0),
      };
    } catch { return { total: 0, active: 0, completed: 0, failed: 0, totalCost: 0, tokensUsed: 0 }; }
  }),

  toggleFavorite: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        const p = MOCK_PROJECTS.find(p => p.id === input.id);
        if (p) p.isFavorite = !p.isFavorite;
        return p;
      }
      try {
        const rows = await db.select({ isFavorite: projects.isFavorite }).from(projects).where(eq(projects.id, input.id)).limit(1);
        const current = rows[0]?.isFavorite ?? false;
        const updated = await db.update(projects).set({ isFavorite: !current }).where(eq(projects.id, input.id)) as any;
        return updated[0];
      } catch { return null; }
    }),
});
