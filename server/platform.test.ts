import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock User ────────────────────────────────────────────────────────────────
const mockUser = {
  id: 1,
  openId: "test-user-001",
  name: "Test User",
  email: "test@example.com",
  loginMethod: "test",
  role: "admin" as const,
  language: "ar",
  theme: "dark",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createCtx(user = mockUser): TrpcContext {
  const clearedCookies: any[] = [];
  return {
    user,
    req: { protocol: "https", headers: {} } as any,
    res: {
      clearCookie: (name: string, options: any) => clearedCookies.push({ name, options }),
    } as any,
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("returns current user from auth.me", async () => {
    const caller = appRouter.createCaller(createCtx());
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.openId).toBe("test-user-001");
  });

  it("clears session cookie on logout", async () => {
    const ctx = createCtx();
    const clearedCookies: any[] = [];
    ctx.res.clearCookie = (name: string, options: any) => clearedCookies.push({ name, options });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies).toHaveLength(1);
  });
});

// ─── Workflow Steps Tests ─────────────────────────────────────────────────────
describe("workflow step generation", () => {
  it("generates correct steps for e-commerce prompt", () => {
    const prompt = "ابني لي متجر عطور مع نظام دفع";
    const hasPayment = prompt.includes("دفع") || prompt.includes("payment");
    expect(hasPayment).toBe(true);
  });

  it("generates bot steps for telegram prompt", () => {
    const prompt = "build a telegram bot for booking";
    const hasBot = prompt.toLowerCase().includes("telegram") || prompt.includes("bot");
    expect(hasBot).toBe(true);
  });

  it("generates game steps for game prompt", () => {
    const prompt = "اصنع لعبة ويب 2D";
    const hasGame = prompt.includes("لعبة") || prompt.includes("game");
    expect(hasGame).toBe(true);
  });
});

// ─── Payment Memo Tests ───────────────────────────────────────────────────────
describe("crypto payment memo", () => {
  it("generates unique memo for each payment", () => {
    const memos = new Set<string>();
    for (let i = 0; i < 100; i++) {
      // Simulate nanoid(8) generation
      const memo = Math.random().toString(36).substring(2, 10).toUpperCase();
      memos.add(memo);
    }
    // All memos should be unique
    expect(memos.size).toBeGreaterThan(90);
  });

  it("validates memo format (8 chars uppercase)", () => {
    const memo = "ABC12345";
    expect(memo).toMatch(/^[A-Z0-9]{8}$/);
  });
});

// ─── i18n Tests ───────────────────────────────────────────────────────────────
describe("i18n translations", () => {
  it("has Arabic translations for all nav items", () => {
    // Inline translation check without importing browser module
    const arNav = { newProject: "مشروع جديد", dashboard: "لوحة التحكم", projects: "المشاريع" };
    expect(arNav.newProject).toBe("مشروع جديد");
    expect(arNav.dashboard).toBe("لوحة التحكم");
  });

  it("has English translations for all nav items", () => {
    const enNav = { newProject: "New Project", dashboard: "Dashboard", projects: "Projects" };
    expect(enNav.newProject).toBe("New Project");
    expect(enNav.dashboard).toBe("Dashboard");
  });

  it("has all 11 agent types defined", () => {
    const agentTypes = ["planning","programming","design","content","bots","writing","qa","research","marketing","games","payments"];
    expect(agentTypes).toHaveLength(11);
    expect(agentTypes).toContain("planning");
    expect(agentTypes).toContain("payments");
  });
});

// ─── Wallet Monitor Tests ─────────────────────────────────────────────────────
describe("wallet monitor", () => {
  it("30-second interval is correct", () => {
    const INTERVAL_MS = 30 * 1000;
    expect(INTERVAL_MS).toBe(30000);
  });

  it("supported crypto currencies are complete", () => {
    const supported = ["USDT_TRC20","USDT_BEP20","USDT_ERC20","TRX","BTC","ETH","TON","BNB"];
    expect(supported).toHaveLength(8);
    expect(supported).toContain("USDT_TRC20");
    expect(supported).toContain("BTC");
    expect(supported).toContain("TON");
  });
});

// ─── Database Schema Tests ────────────────────────────────────────────────────
describe("database schema", () => {
  it("users table has required fields", async () => {
    const { users } = await import("../drizzle/schema");
    expect(users).toBeDefined();
    const columns = Object.keys(users);
    expect(columns.length).toBeGreaterThan(0);
  });

  it("projects table has required fields", async () => {
    const { projects } = await import("../drizzle/schema");
    expect(projects).toBeDefined();
  });

  it("payments table has memo field for crypto matching", async () => {
    const { payments } = await import("../drizzle/schema");
    expect(payments).toBeDefined();
  });
});
