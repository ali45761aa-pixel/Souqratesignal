import { eq } from "drizzle-orm";
// ── Auto-detect database type from DATABASE_URL ───────────────────────────────
// Supports: PostgreSQL (Supabase) and MySQL (TiDB)
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import mysql from "mysql2/promise";
import { Pool as PgPool } from "pg";
import {
  InsertUser,
  users,
  projects,
  projectTasks,
  chatMessages,
  apiKeys,
  aiSettings,
  clients,
  invoices,
  payments,
  notifications,
  templates,
  plugins,
  promptLibrary,
  projectVersions,
  projectFiles,
  tickets,
  ticketReplies,
  coupons,
  scheduledJobs,
  auditLog,
  referrals,
} from "../drizzle/schema";

let _pool: mysql.Pool | PgPool | null = null;
let _db: any = null;

function isPostgres(url: string): boolean {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const url = process.env.DATABASE_URL;
      if (isPostgres(url)) {
        // PostgreSQL (Supabase)
        _pool = new PgPool({ connectionString: url, ssl: { rejectUnauthorized: false } });
        _db = drizzlePg(_pool as PgPool) as any;
        console.log("[Database] Connected to PostgreSQL (Supabase)");
      } else {
        // MySQL (TiDB)
        _pool = mysql.createPool({ uri: url, ssl: {} });
        _db = drizzleMysql(_pool as mysql.Pool) as any;
        console.log("[Database] Connected to MySQL (TiDB)");
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    await db.insert(users).values({
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? "user",
      lastSignedIn: user.lastSignedIn ?? new Date(),
    }).onDuplicateKeyUpdate({
      set: {
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function getChatMessages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.projectId, projectId));
}

// ─── API Keys ─────────────────────────────────────────────────────────────────
export async function getApiKeysByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId));
}

// ─── Clients ─────────────────────────────────────────────────────────────────
export async function getClientsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}

// ─── Templates ───────────────────────────────────────────────────────────────
export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).where(eq(templates.isActive, true));
}

// ─── Plugins ─────────────────────────────────────────────────────────────────
export async function getAllPlugins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(plugins);
}

// Re-export tables for use in routers
export {
  users, projects, projectTasks, chatMessages, apiKeys, aiSettings,
  clients, invoices, payments, notifications, templates, plugins,
  promptLibrary, projectVersions, projectFiles, tickets, ticketReplies,
  coupons, scheduledJobs, auditLog, referrals,
};
