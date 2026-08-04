import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, payments, invoices, coupons } from "../db";
import { eq, and, desc } from "drizzle-orm";

const MOCK_PAYMENTS: any[] = [];

function generateMemo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const CRYPTO_WALLETS: Record<string, string> = {
  USDT_TRC20: process.env.WALLET_USDT_TRC20 ?? "",
  USDT_BEP20: process.env.WALLET_USDT_BEP20 ?? "",
  USDT_ERC20: process.env.WALLET_USDT_ERC20 ?? "",
  TRX:        process.env.WALLET_TRX ?? "",
  BTC:        process.env.WALLET_BTC ?? "",
  ETH:        process.env.WALLET_ETH ?? "",
  TON:        process.env.WALLET_TON ?? "",
  BNB:        process.env.WALLET_BNB ?? "",
};

export const paymentsRouter = router({
  createCryptoInvoice: publicProcedure
    .input(z.object({
      amount: z.number().positive(),
      currency: z.string(),
      cryptoCurrency: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const memo = generateMemo();
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      const walletAddress = CRYPTO_WALLETS[input.cryptoCurrency] ?? "";

      if (!db) {
        const payment = { id: MOCK_PAYMENTS.length + 1, userId, method: "crypto", status: "pending", amount: input.amount, currency: input.currency, cryptoCurrency: input.cryptoCurrency, walletAddress, memo, createdAt: new Date(), updatedAt: new Date() };
        MOCK_PAYMENTS.push(payment);
        return payment;
      }
      try {
        const rows = await db.insert(payments).values({
          userId, method: "crypto" as any, status: "pending" as any,
          amount: input.amount, currency: input.currency,
          cryptoCurrency: input.cryptoCurrency as any,
          walletAddress, memo,
        }).returning();
        return rows[0];
      } catch {
        const payment = { id: MOCK_PAYMENTS.length + 1, userId, method: "crypto", status: "pending", amount: input.amount, currency: input.currency, cryptoCurrency: input.cryptoCurrency, walletAddress, memo, createdAt: new Date(), updatedAt: new Date() };
        MOCK_PAYMENTS.push(payment);
        return payment;
      }
    }),

  getPayments: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) return MOCK_PAYMENTS;
    try {
      return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
    } catch { return MOCK_PAYMENTS; }
  }),

  checkPaymentStatus: publicProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return MOCK_PAYMENTS.find(p => p.id === input.paymentId) ?? null;
      try {
        const rows = await db.select().from(payments).where(eq(payments.id, input.paymentId)).limit(1);
        return rows[0] ?? null;
      } catch { return null; }
    }),

  validateCoupon: publicProcedure
    .input(z.object({ code: z.string(), amount: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        const hardcoded: Record<string, number> = { "SAVE20": 20, "SAVE50": 50, "FREE100": 100 };
        const discount = hardcoded[input.code.toUpperCase()];
        if (!discount) return { valid: false, discount: 0, message: "كوبون غير صالح / Invalid coupon" };
        return { valid: true, discount: Math.min(discount, input.amount), message: `تم تطبيق خصم $${Math.min(discount, input.amount)}` };
      }
      try {
        const rows = await db.select().from(coupons).where(eq(coupons.code, input.code.toUpperCase())).limit(1);
        const coupon = rows[0];
        if (!coupon || !coupon.isActive) return { valid: false, discount: 0, message: "كوبون غير صالح" };
        const discount = coupon.discountPercent
          ? (input.amount * coupon.discountPercent) / 100
          : (coupon.discountFixed ?? 0);
        return { valid: true, discount: Math.min(discount, input.amount), message: `تم تطبيق خصم $${Math.min(discount, input.amount).toFixed(2)}` };
      } catch {
        return { valid: false, discount: 0, message: "خطأ في التحقق من الكوبون" };
      }
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) {
      const total = MOCK_PAYMENTS.reduce((s, p) => s + (p.amount ?? 0), 0);
      const confirmed = MOCK_PAYMENTS.filter(p => p.status === "confirmed").length;
      const pending = MOCK_PAYMENTS.filter(p => p.status === "pending").length;
      return { total, confirmed, pending };
    }
    try {
      const all = await db.select().from(payments).where(eq(payments.userId, userId));
      return {
        total: all.filter(p => p.status === "confirmed").reduce((s, p) => s + (p.amount ?? 0), 0),
        confirmed: all.filter(p => p.status === "confirmed").length,
        pending: all.filter(p => p.status === "pending").length,
      };
    } catch { return { total: 0, confirmed: 0, pending: 0 }; }
  }),
});
