import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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

let _pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({ uri: process.env.DATABASE_URL, ssl: {} });
      _db = drizzle(_pool) as any;
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
