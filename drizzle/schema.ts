import {
  bigint,
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  language: varchar("language", { length: 8 }).default("ar").notNull(),
  theme: varchar("theme", { length: 16 }).default("dark").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  service: varchar("service", { length: 64 }).notNull(),
  keyValue: text("key_value").notNull(),
  label: varchar("label", { length: 128 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── AI Settings ─────────────────────────────────────────────────────────────
export const aiSettings = mysqlTable("ai_settings", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  primaryModel: varchar("primary_model", { length: 64 }).default("claude-sonnet-4-5").notNull(),
  temperature: float("temperature").default(0.7).notNull(),
  maxTokens: int("max_tokens").default(8192).notNull(),
  systemPrompt: text("system_prompt"),
  chainOfThought: boolean("chain_of_thought").default(true).notNull(),
  useOllama: boolean("use_ollama").default(false).notNull(),
  ollamaUrl: text("ollama_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Clients (CRM) ────────────────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 256 }),
  country: varchar("country", { length: 64 }),
  notes: text("notes"),
  tags: json("tags").$type<string[]>().default([]),
  totalPaid: float("total_paid").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Templates ────────────────────────────────────────────────────────────────
export const templates = mysqlTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  nameAr: varchar("name_ar", { length: 256 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: mysqlEnum("category", ["company_website", "ecommerce", "landing_page", "dashboard", "telegram_bot", "blog", "portfolio", "saas", "web_game", "mobile_game"]).notNull(),
  theme: varchar("theme", { length: 32 }).default("minimal"),
  previewImageUrl: text("preview_image_url"),
  storageKey: text("storage_key"),
  techStack: json("tech_stack").$type<string[]>().default([]),
  features: json("features").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: int("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  clientId: bigint("client_id", { mode: "number" }).references(() => clients.id),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  status: mysqlEnum("status", ["active", "completed", "failed", "paused"]).default("active").notNull(),
  projectType: varchar("project_type", { length: 64 }),
  techStack: json("tech_stack").$type<string[]>().default([]),
  templateId: bigint("template_id", { mode: "number" }).references(() => templates.id),
  previewUrl: text("preview_url"),
  exportUrl: text("export_url"),
  totalCost: float("total_cost").default(0).notNull(),
  tokensUsed: int("tokens_used").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  tags: json("tags").$type<string[]>().default([]),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  rating: int("rating"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Project Tasks ────────────────────────────────────────────────────────────
export const projectTasks = mysqlTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: "number" }).notNull().references(() => projects.id),
  agentType: mysqlEnum("agent_type", ["planning", "programming", "design", "content", "bots", "writing", "qa", "research", "marketing", "games", "payments"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  titleAr: varchar("title_ar", { length: 256 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "error"]).default("pending").notNull(),
  stepOrder: int("step_order").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  elapsedMs: int("elapsed_ms"),
  errorMessage: text("error_message"),
  output: text("output"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Project Files ────────────────────────────────────────────────────────────
export const projectFiles = mysqlTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: "number" }).notNull().references(() => projects.id),
  filename: varchar("filename", { length: 256 }).notNull(),
  filePath: text("file_path").notNull(),
  storageKey: text("storage_key").notNull(),
  storageUrl: text("storage_url").notNull(),
  mimeType: varchar("mime_type", { length: 128 }),
  sizeBytes: int("size_bytes"),
  fileType: varchar("file_type", { length: 32 }),
  language: varchar("language", { length: 32 }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Project Versions ─────────────────────────────────────────────────────────
export const projectVersions = mysqlTable("project_versions", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: "number" }).notNull().references(() => projects.id),
  versionNumber: int("version_number").notNull(),
  label: varchar("label", { length: 128 }),
  snapshot: json("snapshot").$type<Record<string, string>>(),
  storageKey: text("storage_key"),
  storageUrl: text("storage_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: "number" }).references(() => projects.id),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  attachments: json("attachments").$type<{name:string;url:string;type:string}[]>().default([]),
  tokensUsed: int("tokens_used").default(0),
  model: varchar("model", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Plugins ──────────────────────────────────────────────────────────────────
export const plugins = mysqlTable("plugins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  nameAr: varchar("name_ar", { length: 128 }),
  description: text("description"),
  version: varchar("version", { length: 32 }).default("1.0.0").notNull(),
  author: varchar("author", { length: 128 }),
  category: varchar("category", { length: 64 }),
  configSchema: json("config_schema"),
  entryPoint: text("entry_point"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  isBuiltin: boolean("is_builtin").default(false).notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  clientId: bigint("client_id", { mode: "number" }).references(() => clients.id),
  projectId: bigint("project_id", { mode: "number" }).references(() => projects.id),
  invoiceNumber: varchar("invoice_number", { length: 64 }).notNull().unique(),
  amount: float("amount").notNull(),
  currency: varchar("currency", { length: 16 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  pdfUrl: text("pdf_url"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  lineItems: json("line_items").$type<{description:string;qty:number;price:number}[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  invoiceId: bigint("invoice_id", { mode: "number" }).references(() => invoices.id),
  method: mysqlEnum("method", ["crypto", "stripe", "paymob"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  amount: float("amount").notNull(),
  currency: varchar("currency", { length: 16 }).notNull(),
  cryptoCurrency: mysqlEnum("crypto_currency", ["USDT_TRC20", "USDT_BEP20", "USDT_ERC20", "TRX", "BTC", "ETH", "TON", "BNB"]),
  walletAddress: text("wallet_address"),
  memo: varchar("memo", { length: 64 }),
  txHash: text("tx_hash"),
  externalId: text("external_id"),
  externalStatus: text("external_status"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  code: varchar("code", { length: 64 }).notNull().unique(),
  discountPercent: float("discount_percent"),
  discountFixed: float("discount_fixed"),
  currency: varchar("currency", { length: 16 }).default("USD"),
  maxUses: int("max_uses"),
  usedCount: int("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  clientId: bigint("client_id", { mode: "number" }).references(() => clients.id),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: varchar("priority", { length: 16 }).default("medium"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketReplies = mysqlTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: bigint("ticket_id", { mode: "number" }).notNull().references(() => tickets.id),
  userId: bigint("user_id", { mode: "number" }).references(() => users.id),
  message: text("message").notNull(),
  isAutoReply: boolean("is_auto_reply").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  titleAr: varchar("title_ar", { length: 256 }),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Prompt Library ───────────────────────────────────────────────────────────
export const promptLibrary = mysqlTable("prompt_library", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id),
  title: varchar("title", { length: 256 }).notNull(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 64 }),
  rating: int("rating").default(0),
  usageCount: int("usage_count").default(0).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: bigint("referrer_id", { mode: "number" }).notNull().references(() => users.id),
  referredId: bigint("referred_id", { mode: "number" }).references(() => users.id),
  code: varchar("code", { length: 32 }).notNull().unique(),
  rewardAmount: float("reward_amount").default(0),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Scheduled Jobs ───────────────────────────────────────────────────────────
export const scheduledJobs = mysqlTable("scheduled_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  jobType: varchar("job_type", { length: 64 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 64 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  lastStatus: varchar("last_status", { length: 32 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).references(() => users.id),
  action: varchar("action", { length: 128 }).notNull(),
  entity: varchar("entity", { length: 64 }),
  entityId: int("entity_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Plugin = typeof plugins.$inferSelect;
