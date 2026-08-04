-- ─── AI Agent Platform — PostgreSQL Migration (Supabase) ─────────────────────
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql

-- ── Enums ──────────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'failed', 'paused');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'error');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('crypto', 'stripe', 'paymob');
CREATE TYPE crypto_currency AS ENUM ('USDT_TRC20','USDT_BEP20','USDT_ERC20','TRX','BTC','ETH','TON','BNB');
CREATE TYPE template_category AS ENUM ('company_website','ecommerce','landing_page','dashboard','telegram_bot','blog','portfolio','saas','web_game','mobile_game');
CREATE TYPE ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE notification_type AS ENUM ('info','success','warning','error');
CREATE TYPE plugin_status AS ENUM ('active','inactive');

-- ── Users ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role user_role NOT NULL DEFAULT 'user',
  language VARCHAR(8) NOT NULL DEFAULT 'ar',
  theme VARCHAR(16) NOT NULL DEFAULT 'dark',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── API Keys ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service VARCHAR(64) NOT NULL,
  key_value TEXT NOT NULL,
  label VARCHAR(128),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── AI Settings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  primary_model VARCHAR(64) NOT NULL DEFAULT 'claude-sonnet-4-5',
  temperature REAL NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 8192,
  system_prompt TEXT,
  chain_of_thought BOOLEAN NOT NULL DEFAULT true,
  use_ollama BOOLEAN NOT NULL DEFAULT false,
  ollama_url TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Templates ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  name_ar VARCHAR(128),
  description TEXT,
  description_ar TEXT,
  category template_category NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT,
  tech_stack JSON,
  tags JSON,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Clients ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(128) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(32),
  company VARCHAR(128),
  country VARCHAR(64),
  notes TEXT,
  total_paid REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Projects ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER REFERENCES clients(id),
  template_id INTEGER REFERENCES templates(id),
  name VARCHAR(256) NOT NULL,
  description TEXT,
  prompt TEXT,
  project_type VARCHAR(64),
  status project_status NOT NULL DEFAULT 'active',
  tech_stack JSON,
  tags JSON,
  html_content TEXT,
  css_content TEXT,
  js_content TEXT,
  files JSON,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  rating INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Project Tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  agent_type VARCHAR(64) NOT NULL,
  title VARCHAR(256) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  output TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Chat Messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  attachments JSON,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Invoices ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER REFERENCES clients(id),
  project_id INTEGER REFERENCES projects(id),
  invoice_number VARCHAR(32) NOT NULL UNIQUE,
  amount REAL NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  line_items JSON,
  notes TEXT,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Payments ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  invoice_id INTEGER REFERENCES invoices(id),
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  amount REAL NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  crypto_currency crypto_currency,
  wallet_address TEXT,
  memo VARCHAR(16),
  tx_hash TEXT,
  external_id TEXT,
  external_status TEXT,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Notifications ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type notification_type NOT NULL DEFAULT 'info',
  title VARCHAR(256) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Plugins ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plugins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  name_ar VARCHAR(128),
  description TEXT,
  description_ar TEXT,
  version VARCHAR(16) NOT NULL DEFAULT '1.0.0',
  author VARCHAR(128),
  status plugin_status NOT NULL DEFAULT 'inactive',
  config JSON,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Coupons ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  code VARCHAR(32) NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Project Versions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_versions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  version_number INTEGER NOT NULL DEFAULT 1,
  label VARCHAR(256),
  snapshot JSON,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Project Files ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  filename VARCHAR(256) NOT NULL,
  content TEXT,
  file_type VARCHAR(32),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Prompt Library ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prompt_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(256) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(64),
  tags JSON,
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Tickets ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER REFERENCES clients(id),
  subject VARCHAR(256) NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority VARCHAR(16) NOT NULL DEFAULT 'medium',
  assigned_to INTEGER,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Ticket Replies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_replies (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Referrals ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  reward_amount REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Scheduled Jobs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  cron_expression VARCHAR(64) NOT NULL,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  result TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Audit Log ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(128) NOT NULL,
  entity VARCHAR(64),
  entity_id INTEGER,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Indexes for performance ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_memo ON payments(memo);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ✅ Migration complete!
SELECT 'Migration complete! Tables created: ' || count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
