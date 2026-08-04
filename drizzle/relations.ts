import { relations } from "drizzle-orm";
import {
  users, apiKeys, aiSettings, clients, templates, projects,
  projectTasks, projectFiles, projectVersions, chatMessages,
  invoices, payments, coupons, tickets, ticketReplies,
  notifications,
} from "./schema";

// ── users ────────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys:       many(apiKeys),
  aiSettings:    many(aiSettings),
  clients:       many(clients),
  projects:      many(projects),
  chatMessages:  many(chatMessages),
  invoices:      many(invoices),
  payments:      many(payments),
  coupons:       many(coupons),
  tickets:       many(tickets),
  ticketReplies: many(ticketReplies),
  notifications: many(notifications),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const aiSettingsRelations = relations(aiSettings, ({ one }) => ({
  user: one(users, { fields: [aiSettings.userId], references: [users.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user:     one(users,    { fields: [clients.userId],  references: [users.id] }),
  projects: many(projects),
  invoices: many(invoices),
  tickets:  many(tickets),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user:     one(users,     { fields: [projects.userId],     references: [users.id] }),
  client:   one(clients,   { fields: [projects.clientId],   references: [clients.id] }),
  template: one(templates, { fields: [projects.templateId], references: [templates.id] }),
  tasks:    many(projectTasks),
  files:    many(projectFiles),
  versions: many(projectVersions),
  messages: many(chatMessages),
  invoices: many(invoices),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, { fields: [projectTasks.projectId], references: [projects.id] }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, { fields: [projectFiles.projectId], references: [projects.id] }),
}));

export const projectVersionsRelations = relations(projectVersions, ({ one }) => ({
  project: one(projects, { fields: [projectVersions.projectId], references: [projects.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  project: one(projects, { fields: [chatMessages.projectId], references: [projects.id] }),
  user:    one(users,    { fields: [chatMessages.userId],    references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user:     one(users,    { fields: [invoices.userId],    references: [users.id] }),
  client:   one(clients,  { fields: [invoices.clientId],  references: [clients.id] }),
  project:  one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user:    one(users,    { fields: [payments.userId],    references: [users.id] }),
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  user: one(users, { fields: [coupons.userId], references: [users.id] }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user:    one(users,   { fields: [tickets.userId],   references: [users.id] }),
  client:  one(clients, { fields: [tickets.clientId], references: [clients.id] }),
  replies: many(ticketReplies),
}));

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketReplies.ticketId], references: [tickets.id] }),
  user:   one(users,   { fields: [ticketReplies.userId],   references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
