/**
 * Crypto Wallet Monitor - Runs every 30 seconds
 * Checks pending payments and confirms them based on Memo matching
 */
import { getDb, payments } from "../db";
import { eq, and } from "drizzle-orm";

// Supported blockchain APIs for checking transactions
const BLOCKCHAIN_APIS = {
  USDT_TRC20: "https://apilist.tronscanapi.com/api/transaction",
  TRX: "https://apilist.tronscanapi.com/api/transaction",
  BTC: "https://blockstream.info/api/address",
  ETH: "https://api.etherscan.io/api",
  TON: "https://toncenter.com/api/v2/getTransactions",
  BNB: "https://api.bscscan.com/api",
};

let isRunning = false;

export async function monitorCryptoWallets() {
  if (isRunning) return;
  isRunning = true;

  try {
    const db = await getDb();
    if (!db) return;

    // Get all pending crypto payments
    const pendingPayments = await db.select().from(payments)
      .where(and(
        eq(payments.method, "crypto"),
        eq(payments.status, "pending")
      ));

    if (pendingPayments.length === 0) return;

    console.log(`[WalletMonitor] Checking ${pendingPayments.length} pending payments...`);

    for (const payment of pendingPayments) {
      try {
        const confirmed = await checkPaymentOnChain(payment);
        if (confirmed) {
          await db.update(payments)
            .set({
              status: "confirmed",
              confirmedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));
          console.log(`[WalletMonitor] Payment ${payment.id} confirmed! Memo: ${payment.memo}`);
        }
      } catch (err) {
        console.error(`[WalletMonitor] Error checking payment ${payment.id}:`, err);
      }
    }
  } catch (err) {
    console.error("[WalletMonitor] Error:", err);
  } finally {
    isRunning = false;
  }
}

async function checkPaymentOnChain(payment: any): Promise<boolean> {
  // In production, this would call the actual blockchain API
  // For now, we implement the Memo matching logic structure
  if (!payment.walletAddress || !payment.memo) return false;

  const currency = payment.cryptoCurrency as string;

  try {
    if (currency === "USDT_TRC20" || currency === "TRX") {
      return await checkTRON(payment.walletAddress, payment.memo, payment.amount);
    } else if (currency === "ETH" || currency === "USDT_ERC20") {
      return await checkEthereum(payment.walletAddress, payment.memo, payment.amount);
    } else if (currency === "BTC") {
      return await checkBitcoin(payment.walletAddress, payment.amount);
    } else if (currency === "TON") {
      return await checkTON(payment.walletAddress, payment.memo, payment.amount);
    } else if (currency === "BNB" || currency === "USDT_BEP20") {
      return await checkBSC(payment.walletAddress, payment.memo, payment.amount);
    }
  } catch (err) {
    // API error - skip this check
  }

  return false;
}

async function checkTRON(address: string, memo: string, amount: number): Promise<boolean> {
  // TRON: Check TRC-20 USDT transfers with memo in transaction data
  const url = `https://apilist.tronscanapi.com/api/transaction?address=${address}&limit=20&start=0`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return false;
  const data = await res.json();
  const txs = data.data ?? [];
  return txs.some((tx: any) =>
    tx.contractData?.data?.includes(memo) &&
    Math.abs((tx.contractData?.amount ?? 0) / 1e6 - amount) < 0.01
  );
}

async function checkEthereum(address: string, memo: string, amount: number): Promise<boolean> {
  // ETH: Check transactions with memo in input data
  const apiKey = process.env.ETHERSCAN_API_KEY ?? "";
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return false;
  const data = await res.json();
  const txs = data.result ?? [];
  return txs.some((tx: any) =>
    tx.input?.includes(Buffer.from(memo).toString("hex")) &&
    Math.abs(parseInt(tx.value) / 1e18 - amount) < 0.001
  );
}

async function checkBitcoin(address: string, amount: number): Promise<boolean> {
  // BTC: Check unconfirmed/confirmed transactions
  const url = `https://blockstream.info/api/address/${address}/txs`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return false;
  const txs = await res.json();
  return txs.some((tx: any) =>
    tx.vout?.some((out: any) =>
      out.scriptpubkey_address === address &&
      Math.abs(out.value / 1e8 - amount) < 0.00001
    )
  );
}

async function checkTON(address: string, memo: string, amount: number): Promise<boolean> {
  // TON: Check transactions with memo (comment)
  const url = `https://toncenter.com/api/v2/getTransactions?address=${address}&limit=20`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return false;
  const data = await res.json();
  const txs = data.result ?? [];
  return txs.some((tx: any) => {
    const comment = tx.in_msg?.message ?? "";
    const value = parseInt(tx.in_msg?.value ?? "0") / 1e9;
    return comment.includes(memo) && Math.abs(value - amount) < 0.01;
  });
}

async function checkBSC(address: string, memo: string, amount: number): Promise<boolean> {
  // BSC: Similar to Ethereum
  const apiKey = process.env.BSCSCAN_API_KEY ?? "";
  const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return false;
  const data = await res.json();
  const txs = data.result ?? [];
  return txs.some((tx: any) =>
    tx.input?.includes(Buffer.from(memo).toString("hex"))
  );
}

// ─── Start Cron Job ───────────────────────────────────────────────────────────
export function startWalletMonitorCron() {
  // Only start if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.log("[WalletMonitor] Skipped — DATABASE_URL not configured");
    return;
  }
  console.log("[WalletMonitor] Starting wallet monitor (every 30 seconds)");
  // Run immediately
  monitorCryptoWallets();
  // Then every 30 seconds
  setInterval(monitorCryptoWallets, 30 * 1000);
}
