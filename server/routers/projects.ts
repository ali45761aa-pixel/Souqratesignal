import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

// Mock data for demo
const MOCK_PROJECTS = [
  { id: 1, userId: 1, name: "متجر عطور", projectType: "ecommerce", status: "completed", createdAt: new Date(), updatedAt: new Date(), totalCost: 150.50, tokensUsed: 45000, isFavorite: true, tags: ["ecommerce", "عطور"], prompt: "ابني لي متجر عطور" },
  { id: 2, userId: 1, name: "بوت تليغرام", projectType: "bot", status: "active", createdAt: new Date(), updatedAt: new Date(), totalCost: 75.00, tokensUsed: 30000, isFavorite: false, tags: ["bot", "تليغرام"], prompt: "اصنع بوت تليغرام" },
  { id: 3, userId: 1, name: "موقع شركة", projectType: "company", status: "completed", createdAt: new Date(), updatedAt: new Date(), totalCost: 225.00, tokensUsed: 50000, isFavorite: true, tags: ["company", "موقع"], prompt: "ابني موقع شركة" },
];

export const projectsRouter = router({
  list: publicProcedure.query(async () => {
    return MOCK_PROJECTS;
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return MOCK_PROJECTS.find(p => p.id === input.id) ?? null;
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(256),
      prompt: z.string().min(1),
      projectType: z.string().optional(),
      templateId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const newProject = {
        id: MOCK_PROJECTS.length + 1,
        userId: 1,
        name: input.name,
        projectType: input.projectType ?? "custom",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCost: 0,
        tokensUsed: 0,
        isFavorite: false,
        tags: [] as string[],
        prompt: input.prompt,
      };
      MOCK_PROJECTS.push(newProject);
      return newProject;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["active","completed","failed","paused"]).optional(),
      isFavorite: z.boolean().optional(),
      rating: z.number().min(1).max(5).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const project = MOCK_PROJECTS.find(p => p.id === input.id);
      if (project && input.status) {
        project.status = input.status;
        project.updatedAt = new Date();
      }
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const index = MOCK_PROJECTS.findIndex(p => p.id === input.id);
      if (index !== -1) {
        MOCK_PROJECTS.splice(index, 1);
      }
      return { success: true };
    }),

  getTasks: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => {
      return [
        { id: 1, projectId: 1, stepOrder: 1, title: "التخطيط", status: "completed", elapsed: 120 },
        { id: 2, projectId: 1, stepOrder: 2, title: "البرمجة", status: "completed", elapsed: 450 },
        { id: 3, projectId: 1, stepOrder: 3, title: "الاختبار", status: "completed", elapsed: 180 },
      ];
    }),

  getVersions: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => {
      return [
        { id: 1, projectId: 1, versionNumber: 3, label: "إضافة نظام الدفع", createdAt: new Date() },
        { id: 2, projectId: 1, versionNumber: 2, label: "تصميم الواجهة", createdAt: new Date() },
        { id: 3, projectId: 1, versionNumber: 1, label: "الإنشاء الأولي", createdAt: new Date() },
      ];
    }),

  stats: publicProcedure.query(async () => {
    return {
      total: MOCK_PROJECTS.length,
      active: MOCK_PROJECTS.filter(p => p.status === "active").length,
      completed: MOCK_PROJECTS.filter(p => p.status === "completed").length,
      failed: MOCK_PROJECTS.filter(p => p.status === "failed").length,
      totalCost: MOCK_PROJECTS.reduce((s, p) => s + (p.totalCost ?? 0), 0),
      tokensUsed: MOCK_PROJECTS.reduce((s, p) => s + (p.tokensUsed ?? 0), 0),
    };
  }),
});
