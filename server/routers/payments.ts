import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, payments, invoices, coupons } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Crypto wallet addresses (configured via API keys in admin)
const CRYPTO_WALLETS: Record<string, string> = {
  USDT_TRC20: process.env.WALLET_USDT_TRC20 ?? "",
  USDT_BEP20: process.env.WALLET_USDT_BEP20 ?? "",
  USDT_ERC20: process.env.WALLET_USDT_ERC20 ?? "",
  TRX: process.env.WALLET_TRX ?? "",
  BTC: process.env.WALLET_BTC ?? "",
  ETH: process.env.WALLET_ETH ?? "",
  TON: process.env.WALLET_TON ?? "",
  BNB: process.env.WALLET_BNB ?? "",
};

export const paymentsRouter = router({
  createCryptoInvoice: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      currency: z.enum(["USDT_TRC20","USDT_BEP20","USDT_ERC20","TRX","BTC","ETH","TON","BNB"]),
      invoiceId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const memo = nanoid(8).toUpperCase();
      const walletAddress = CRYPTO_WALLETS[input.currency];
      const result = await db.insert(payments).values({
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        method: "crypto",
        status: "pending",
        amount: input.amount,
        currency: input.currency,
        cryptoCurrency: input.currency as any,
        walletAddress,
        memo,
      }).returning();
      return { ...result[0], walletAddress, memo };
    }),

  getPayments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(payments)
      .where(eq(payments.userId, ctx.user.id))
      .orderBy(desc(payments.createdAt));
  }),

  checkPaymentStatus: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(payments)
        .where(and(eq(payments.id, input.paymentId), eq(payments.userId, ctx.user.id)))
        .limit(1);
      return result[0] ?? null;
    }),

  // Coupons
  validateCoupon: protectedProcedure
    .input(z.object({ code: z.string(), amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(coupons)
        .where(and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true)))
        .limit(1);
      const coupon = result[0];
      if (!coupon) return { valid: false, message: "Invalid coupon" };
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, message: "Coupon expired" };
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, message: "Coupon limit reached" };
      const discount = coupon.discountPercent
        ? input.amount * (coupon.discountPercent / 100)
        : (coupon.discountFixed ?? 0);
      return { valid: true, discount, finalAmount: input.amount - discount, coupon };
    }),
});
