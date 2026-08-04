CREATE TABLE `ai_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`primary_model` varchar(64) NOT NULL DEFAULT 'claude-sonnet-4-5',
	`temperature` float NOT NULL DEFAULT 0.7,
	`max_tokens` int NOT NULL DEFAULT 8192,
	`system_prompt` text,
	`chain_of_thought` boolean NOT NULL DEFAULT true,
	`use_ollama` boolean NOT NULL DEFAULT false,
	`ollama_url` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`service` varchar(64) NOT NULL,
	`key_value` text NOT NULL,
	`label` varchar(128),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`action` varchar(128) NOT NULL,
	`entity` varchar(64),
	`entity_id` bigint unsigned,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`project_id` bigint unsigned,
	`user_id` bigint unsigned NOT NULL,
	`role` varchar(16) NOT NULL,
	`content` text NOT NULL,
	`attachments` json DEFAULT NULL,
	`tokens_used` int DEFAULT 0,
	`model` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`company` varchar(256),
	`country` varchar(64),
	`notes` text,
	`tags` json DEFAULT NULL,
	`total_paid` float NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`code` varchar(64) NOT NULL,
	`discount_percent` float,
	`discount_fixed` float,
	`currency` varchar(16) DEFAULT 'USD',
	`max_uses` int,
	`used_count` int NOT NULL DEFAULT 0,
	`expires_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`client_id` bigint unsigned,
	`project_id` bigint unsigned,
	`invoice_number` varchar(64) NOT NULL,
	`amount` float NOT NULL,
	`currency` varchar(16) NOT NULL DEFAULT 'USD',
	`status` enum('pending','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`pdf_url` text,
	`due_date` timestamp,
	`paid_at` timestamp,
	`notes` text,
	`line_items` json DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
	`title` varchar(256) NOT NULL,
	`title_ar` varchar(256),
	`message` text NOT NULL,
	`message_ar` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`link` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`method` enum('crypto','stripe','paymob') NOT NULL,
	`status` enum('pending','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`amount` float NOT NULL,
	`currency` varchar(16) NOT NULL,
	`crypto_currency` enum('USDT_TRC20','USDT_BEP20','USDT_ERC20','TRX','BTC','ETH','TON','BNB'),
	`wallet_address` text,
	`memo` varchar(64),
	`tx_hash` text,
	`external_id` text,
	`external_status` text,
	`confirmed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`name_ar` varchar(128),
	`description` text,
	`version` varchar(32) NOT NULL DEFAULT '1.0.0',
	`author` varchar(128),
	`category` varchar(64),
	`config_schema` json,
	`entry_point` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`is_builtin` boolean NOT NULL DEFAULT false,
	`icon_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_files` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`filename` varchar(256) NOT NULL,
	`file_path` text NOT NULL,
	`storage_key` text NOT NULL,
	`storage_url` text NOT NULL,
	`mime_type` varchar(128),
	`size_bytes` int,
	`file_type` varchar(32),
	`language` varchar(32),
	`content` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`agent_type` enum('planning','programming','design','content','bots','writing','qa','research','marketing','games','payments') NOT NULL,
	`title` varchar(256) NOT NULL,
	`title_ar` varchar(256),
	`description` text,
	`status` enum('pending','in_progress','completed','error') NOT NULL DEFAULT 'pending',
	`step_order` int NOT NULL,
	`started_at` timestamp,
	`completed_at` timestamp,
	`elapsed_ms` int,
	`error_message` text,
	`output` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_versions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`version_number` int NOT NULL,
	`label` varchar(128),
	`snapshot` json,
	`storage_key` text,
	`storage_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`client_id` bigint unsigned,
	`name` varchar(256) NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`status` enum('active','completed','failed','paused') NOT NULL DEFAULT 'active',
	`project_type` varchar(64),
	`tech_stack` json DEFAULT NULL,
	`template_id` bigint unsigned,
	`preview_url` text,
	`export_url` text,
	`total_cost` float NOT NULL DEFAULT 0,
	`tokens_used` int NOT NULL DEFAULT 0,
	`completed_at` timestamp,
	`tags` json DEFAULT NULL,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`rating` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prompt_library` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`title` varchar(256) NOT NULL,
	`prompt` text NOT NULL,
	`category` varchar(64),
	`rating` int DEFAULT 0,
	`usage_count` int NOT NULL DEFAULT 0,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`tags` json DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prompt_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`referrer_id` bigint unsigned NOT NULL,
	`referred_id` bigint unsigned,
	`code` varchar(32) NOT NULL,
	`reward_amount` float DEFAULT 0,
	`is_paid` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_jobs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`cron_expression` varchar(64),
	`is_active` boolean NOT NULL DEFAULT true,
	`last_run_at` timestamp,
	`next_run_at` timestamp,
	`last_status` varchar(32),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`name_ar` varchar(256),
	`description` text,
	`description_ar` text,
	`category` enum('company_website','ecommerce','landing_page','dashboard','telegram_bot','blog','portfolio','saas','web_game','mobile_game') NOT NULL,
	`theme` varchar(32) DEFAULT 'minimal',
	`preview_image_url` text,
	`storage_key` text,
	`tech_stack` json DEFAULT NULL,
	`features` json DEFAULT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`usage_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_replies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ticket_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`message` text NOT NULL,
	`is_auto_reply` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`client_id` bigint unsigned,
	`subject` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` varchar(16) DEFAULT 'medium',
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`open_id` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`login_method` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`language` varchar(8) NOT NULL DEFAULT 'ar',
	`theme` varchar(16) NOT NULL DEFAULT 'dark',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`last_signed_in` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_open_id_unique` UNIQUE(`open_id`)
);
--> statement-breakpoint
ALTER TABLE `ai_settings` ADD CONSTRAINT `ai_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupons` ADD CONSTRAINT `coupons_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_versions` ADD CONSTRAINT `project_versions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_template_id_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prompt_library` ADD CONSTRAINT `prompt_library_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_users_id_fk` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_replies` ADD CONSTRAINT `ticket_replies_ticket_id_tickets_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_replies` ADD CONSTRAINT `ticket_replies_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;