import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { chatRouter } from "./routers/chat";
import { projectsRouter } from "./routers/projects";
import { adminRouter } from "./routers/admin";
import { paymentsRouter } from "./routers/payments";
import { crmRouter } from "./routers/crm";
import { templatesRouter } from "./routers/templates";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  chat: chatRouter,
  projects: projectsRouter,
  admin: adminRouter,
  payments: paymentsRouter,
  crm: crmRouter,
  templates: templatesRouter,
});

export type AppRouter = typeof appRouter;
