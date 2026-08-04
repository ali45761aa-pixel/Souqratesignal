import { z } from "zod";
import bcrypt from "bcryptjs";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";
import { parse as parseCookieHeader } from "cookie";

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "fallback-secret-change-me");

async function signToken(payload: { userId: number; username: string; role: string }) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export const localAuthRouter = router({
  // ── Register ──────────────────────────────────────────────────────────────
  register: publicProcedure
    .input(z.object({
      username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
      password: z.string().min(6).max(128),
      name: z.string().min(1).max(64).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Check if username exists
      const existing = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);
      const openId = `local_${input.username}_${Date.now()}`;

      // Create user
      await db.insert(users).values({
        openId,
        username: input.username,
        passwordHash,
        name: input.name || input.username,
        loginMethod: "local",
        role: "user",
      } as any);

      const newUser = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (!newUser[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });

      // Sign JWT and set cookie
      const token = await signToken({ userId: newUser[0].id, username: input.username, role: newUser[0].role });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return { success: true, user: { id: newUser[0].id, username: input.username, name: newUser[0].name, role: newUser[0].role } };
    }),

  // ── Login ─────────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Find user by username
      const found = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (!found[0] || !(found[0] as any).passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      // Verify password
      const valid = await bcrypt.compare(input.password, (found[0] as any).passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      // Sign JWT and set cookie
      const token = await signToken({ userId: found[0].id, username: (found[0] as any).username!, role: found[0].role });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, found[0].id));

      return { success: true, user: { id: found[0].id, username: (found[0] as any).username, name: found[0].name, role: found[0].role } };
    }),

  // ── Me (check session) ────────────────────────────────────────────────────
  meLocal: publicProcedure
    .query(async ({ ctx }) => {
      // Parse cookies manually — works without cookie-parser middleware
      const rawCookies = parseCookieHeader(ctx.req.headers.cookie ?? "");
      const token = rawCookies[COOKIE_NAME] ?? ctx.req.cookies?.[COOKIE_NAME];
      if (!token) return null;

      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const db = await getDb();
        const found = await db.select().from(users).where(eq(users.id, payload.userId as number)).limit(1);
        if (!found[0]) return null;
        return { id: found[0].id, username: (found[0] as any).username, name: found[0].name, role: found[0].role, openId: found[0].openId };
      } catch {
        return null;
      }
    }),

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutLocal: publicProcedure
    .mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
});
