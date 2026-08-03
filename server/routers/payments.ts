import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

const MOCK_PAYMENTS: any[] = [];

function generateMemo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const CRYPTO_WALLETS: Record<string, string> = {
  USDT_TRC20: process.env.WALLET_USDT_TRC20 ?? "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  USDT_BEP20: process.env.WALLET_USDT_BEP20 ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxBEP20",
  USDT_ERC20: process.env.WALLET_USDT_ERC20 ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxERC20",
  TRX: process.env.WALLET_TRX ?? "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxTRX",
  BTC: process.env.WALLET_BTC ?? "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  ETH: process.env.WALLET_ETH ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxETH",
  TON: process.env.WALLET_TON ?? "UQxxxxxxxxxxxxxxxxxxxxxxxxxxxxTON",
  BNB: process.env.WALLET_BNB ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxBNB",
};

export const paymentsRouter = router({
  createCryptoInvoice: publicProcedure
    .input(z.object({
      amount: z.number().positive(),
      currency: z.string(),
      cryptoCurrency: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const memo = generateMemo();
      const payment = {
        id: MOCK_PAYMENTS.length + 1,
        userId: 1,
        method: "crypto",
        status: "pending",
        amount: input.amount,
        currency: input.currency,
        cryptoCurrency: input.cryptoCurrency,
        walletAddress: CRYPTO_WALLETS[input.cryptoCurrency] ?? "",
        memo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_PAYMENTS.push(payment);
      return payment;
    }),

  getPayments: publicProcedure.query(async () => MOCK_PAYMENTS),

  checkPaymentStatus: publicProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ input }) => MOCK_PAYMENTS.find(p => p.id === input.paymentId) ?? null),

  validateCoupon: publicProcedure
    .input(z.object({ code: z.string(), amount: z.number() }))
    .mutation(async ({ input }) => {
      const coupons: Record<string, number> = { "SAVE20": 20, "SAVE50": 50, "FREE100": 100 };
      const discount = coupons[input.code.toUpperCase()];
      if (!discount) return { valid: false, discount: 0, message: "كوبون غير صالح / Invalid coupon" };
      return { valid: true, discount: Math.min(discount, input.amount), message: `تم تطبيق خصم $${Math.min(discount, input.amount)}` };
    }),
});
