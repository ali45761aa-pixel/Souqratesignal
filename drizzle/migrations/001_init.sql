-- AI Agent Platform - Initial Database Migration
-- Compatible with PostgreSQL (Supabase / self-hosted)

-- Enums
CREATE TYPE IF NOT EXISTS "user_role" AS ENUM('user', 'admin');
CREATE TYPE IF NOT EXISTS "project_status" AS ENUM('active', 'completed', 'failed', 'paused');
CREATE TYPE IF NOT EXISTS "task_status" AS ENUM('pending', 'in_progress', 'completed', 'error');
CREATE TYPE IF NOT EXISTS "agent_type" AS ENUM('planning', 'programming', 'design', 'content', 'bots', 'writing', 'qa', 'research', 'marketing', 'games', 'payments');
CREATE TYPE IF NOT EXISTS "payment_status" AS ENUM('pending', 'confirmed', 'failed', 'refunded');
CREATE TYPE IF NOT EXISTS "payment_method" AS ENUM('crypto', 'stripe', 'paymob');
CREATE TYPE IF NOT EXISTS "crypto_currency" AS ENUM('USDT_TRC20', 'USDT_BEP20', 'USDT_ERC20', 'TRX', 'BTC', 'ETH', 'TON', 'BNB');
CREATE TYPE IF NOT EXISTS "template_category" AS ENUM('company_website', 'ecommerce', 'landing_page', 'dashboard', 'telegram_bot', 'blog', 'portfolio', 'saas', 'web_game', 'mobile_game');
CREATE TYPE IF NOT EXISTS "ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE IF NOT EXISTS "notification_type" AS ENUM('info', 'success', 'warning', 'error');
CREATE TYPE IF NOT EXISTS "plugin_status" AS ENUM('active', 'inactive');

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "open_id" VARCHAR(64) NOT NULL UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320),
  "login_method" VARCHAR(64),
  "role" "user_role" NOT NULL DEFAULT 'user',
  "language" VARCHAR(8) NOT NULL DEFAULT 'ar',
  "theme" VARCHAR(16) NOT NULL DEFAULT 'dark',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_signed_in" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "service" VARCHAR(64) NOT NULL,
  "key_value" TEXT NOT NULL,
  "label" VARCHAR(128),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Settings
CREATE TABLE IF NOT EXISTS "ai_settings" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "primary_model" VARCHAR(64) NOT NULL DEFAULT 'claude-sonnet-4-5',
  "temperature" REAL NOT NULL DEFAULT 0.7,
  "max_tokens" INTEGER NOT NULL DEFAULT 8192,
  "system_prompt" TEXT,
  "chain_of_thought" BOOLEAN NOT NULL DEFAULT TRUE,
  "use_ollama" BOOLEAN NOT NULL DEFAULT FALSE,
  "ollama_url" TEXT,
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS "clients" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "name" VARCHAR(256) NOT NULL,
  "email" VARCHAR(320),
  "phone" VARCHAR(32),
  "company" VARCHAR(256),
  "country" VARCHAR(64),
  "notes" TEXT,
  "tags" JSON DEFAULT '[]',
  "total_paid" REAL NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Templates
CREATE TABLE IF NOT EXISTS "templates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(256) NOT NULL,
  "name_ar" VARCHAR(256),
  "description" TEXT,
  "description_ar" TEXT,
  "category" "template_category" NOT NULL,
  "theme" VARCHAR(32) DEFAULT 'minimal',
  "preview_image_url" TEXT,
  "storage_key" TEXT,
  "tech_stack" JSON DEFAULT '[]',
  "features" JSON DEFAULT '[]',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS "projects" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "client_id" INTEGER REFERENCES "clients"("id"),
  "name" VARCHAR(256) NOT NULL,
  "description" TEXT,
  "prompt" TEXT NOT NULL,
  "status" "project_status" NOT NULL DEFAULT 'active',
  "project_type" VARCHAR(64),
  "tech_stack" JSON DEFAULT '[]',
  "template_id" INTEGER REFERENCES "templates"("id"),
  "preview_url" TEXT,
  "export_url" TEXT,
  "total_cost" REAL NOT NULL DEFAULT 0,
  "tokens_used" INTEGER NOT NULL DEFAULT 0,
  "completed_at" TIMESTAMP,
  "tags" JSON DEFAULT '[]',
  "is_favorite" BOOLEAN NOT NULL DEFAULT FALSE,
  "rating" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Project Tasks
CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id"),
  "agent_type" "agent_type" NOT NULL,
  "title" VARCHAR(256) NOT NULL,
  "title_ar" VARCHAR(256),
  "description" TEXT,
  "status" "task_status" NOT NULL DEFAULT 'pending',
  "step_order" INTEGER NOT NULL,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "elapsed_ms" INTEGER,
  "error_message" TEXT,
  "output" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Project Files
CREATE TABLE IF NOT EXISTS "project_files" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id"),
  "filename" VARCHAR(256) NOT NULL,
  "file_path" TEXT NOT NULL,
  "storage_key" TEXT NOT NULL,
  "storage_url" TEXT NOT NULL,
  "mime_type" VARCHAR(128),
  "size_bytes" INTEGER,
  "file_type" VARCHAR(32),
  "language" VARCHAR(32),
  "content" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Project Versions
CREATE TABLE IF NOT EXISTS "project_versions" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id"),
  "version_number" INTEGER NOT NULL,
  "label" VARCHAR(128),
  "snapshot" JSON,
  "storage_key" TEXT,
  "storage_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "projects"("id"),
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "role" VARCHAR(16) NOT NULL,
  "content" TEXT NOT NULL,
  "attachments" JSON DEFAULT '[]',
  "tokens_used" INTEGER DEFAULT 0,
  "model" VARCHAR(64),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plugins
CREATE TABLE IF NOT EXISTS "plugins" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(128) NOT NULL,
  "name_ar" VARCHAR(128),
  "description" TEXT,
  "version" VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  "author" VARCHAR(128),
  "category" VARCHAR(64),
  "config_schema" JSON,
  "entry_point" TEXT,
  "status" "plugin_status" NOT NULL DEFAULT 'inactive',
  "is_builtin" BOOLEAN NOT NULL DEFAULT FALSE,
  "icon_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "client_id" INTEGER REFERENCES "clients"("id"),
  "project_id" INTEGER REFERENCES "projects"("id"),
  "invoice_number" VARCHAR(64) NOT NULL UNIQUE,
  "amount" REAL NOT NULL,
  "currency" VARCHAR(16) NOT NULL DEFAULT 'USD',
  "status" "payment_status" NOT NULL DEFAULT 'pending',
  "pdf_url" TEXT,
  "due_date" TIMESTAMP,
  "paid_at" TIMESTAMP,
  "notes" TEXT,
  "line_items" JSON DEFAULT '[]',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS "payments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "invoice_id" INTEGER REFERENCES "invoices"("id"),
  "method" "payment_method" NOT NULL,
  "status" "payment_status" NOT NULL DEFAULT 'pending',
  "amount" REAL NOT NULL,
  "currency" VARCHAR(16) NOT NULL,
  "crypto_currency" "crypto_currency",
  "wallet_address" TEXT,
  "memo" VARCHAR(64),
  "tx_hash" TEXT,
  "external_id" TEXT,
  "external_status" TEXT,
  "confirmed_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "discount_percent" REAL,
  "discount_fixed" REAL,
  "currency" VARCHAR(16) DEFAULT 'USD',
  "max_uses" INTEGER,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS "tickets" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "client_id" INTEGER REFERENCES "clients"("id"),
  "subject" VARCHAR(256) NOT NULL,
  "message" TEXT NOT NULL,
  "status" "ticket_status" NOT NULL DEFAULT 'open',
  "priority" VARCHAR(16) DEFAULT 'medium',
  "resolved_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ticket_replies" (
  "id" SERIAL PRIMARY KEY,
  "ticket_id" INTEGER NOT NULL REFERENCES "tickets"("id"),
  "user_id" INTEGER REFERENCES "users"("id"),
  "message" TEXT NOT NULL,
  "is_auto_reply" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "type" "notification_type" NOT NULL DEFAULT 'info',
  "title" VARCHAR(256) NOT NULL,
  "title_ar" VARCHAR(256),
  "message" TEXT NOT NULL,
  "message_ar" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "link" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Prompt Library
CREATE TABLE IF NOT EXISTS "prompt_library" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "title" VARCHAR(256) NOT NULL,
  "prompt" TEXT NOT NULL,
  "category" VARCHAR(64),
  "rating" INTEGER DEFAULT 0,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "is_favorite" BOOLEAN NOT NULL DEFAULT FALSE,
  "tags" JSON DEFAULT '[]',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" SERIAL PRIMARY KEY,
  "referrer_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "referred_id" INTEGER REFERENCES "users"("id"),
  "code" VARCHAR(32) NOT NULL UNIQUE,
  "reward_amount" REAL DEFAULT 0,
  "is_paid" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scheduled Jobs
CREATE TABLE IF NOT EXISTS "scheduled_jobs" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(128) NOT NULL,
  "job_type" VARCHAR(64) NOT NULL,
  "cron_expression" VARCHAR(64),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "last_run_at" TIMESTAMP,
  "next_run_at" TIMESTAMP,
  "last_status" VARCHAR(32),
  "metadata" JSON,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "action" VARCHAR(128) NOT NULL,
  "entity" VARCHAR(64),
  "entity_id" INTEGER,
  "metadata" JSON,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_memo ON payments(memo);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
