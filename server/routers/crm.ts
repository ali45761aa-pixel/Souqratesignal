import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, clients, invoices, tickets, ticketReplies } from "../db";
import { eq, and, desc } from "drizzle-orm";

const MOCK_CLIENTS: any[] = [];
const MOCK_INVOICES: any[] = [];
const MOCK_TICKETS: any[] = [];

export const crmRouter = router({
  listClients: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) return MOCK_CLIENTS;
    try { return await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt)); }
    catch { return MOCK_CLIENTS; }
  }),

  createClient: publicProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(), company: z.string().optional(), country: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) {
        const client = { id: MOCK_CLIENTS.length + 1, userId, ...input, totalPaid: 0, createdAt: new Date(), updatedAt: new Date() };
        MOCK_CLIENTS.push(client); return client;
      }
      try {
        const rows = await db.insert(clients).values({ userId, name: input.name, email: input.email, phone: input.phone, company: input.company, country: input.country, notes: input.notes }).returning();
        return rows[0];
      } catch {
        const client = { id: MOCK_CLIENTS.length + 1, userId, ...input, totalPaid: 0, createdAt: new Date(), updatedAt: new Date() };
        MOCK_CLIENTS.push(client); return client;
      }
    }),

  updateClient: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) { const c = MOCK_CLIENTS.find(c => c.id === input.id); if (c) Object.assign(c, input); return c; }
      try {
        const { id, ...updates } = input;
        const rows = await db.update(clients).set({ ...updates, updatedAt: new Date() }).where(eq(clients.id, id)).returning();
        return rows[0];
      } catch { return null; }
    }),

  deleteClient: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) { const idx = MOCK_CLIENTS.findIndex(c => c.id === input.id); if (idx >= 0) MOCK_CLIENTS.splice(idx, 1); return { success: true }; }
      try { await db.delete(clients).where(eq(clients.id, input.id)); return { success: true }; }
      catch { return { success: false }; }
    }),

  listInvoices: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) return MOCK_INVOICES;
    try { return await db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt)); }
    catch { return MOCK_INVOICES; }
  }),

  createInvoice: publicProcedure
    .input(z.object({ clientId: z.number().optional(), amount: z.number(), currency: z.string().default("USD"), description: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      if (!db) {
        const inv = { id: MOCK_INVOICES.length + 1, userId, invoiceNumber, ...input, status: "pending", createdAt: new Date() };
        MOCK_INVOICES.push(inv); return inv;
      }
      try {
        const rows = await db.insert(invoices).values({ userId, invoiceNumber, clientId: input.clientId, amount: input.amount, currency: input.currency, notes: input.description, status: "pending" as any, dueDate: input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 30 * 86400000) }).returning();
        return rows[0];
      } catch {
        const inv = { id: MOCK_INVOICES.length + 1, userId, invoiceNumber, ...input, status: "pending", createdAt: new Date() };
        MOCK_INVOICES.push(inv); return inv;
      }
    }),

  listTickets: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = (ctx as any).user?.id ?? 1;
    if (!db) return MOCK_TICKETS;
    try { return await db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt)); }
    catch { return MOCK_TICKETS; }
  }),

  createTicket: publicProcedure
    .input(z.object({ subject: z.string().min(1), message: z.string().min(1), priority: z.enum(["low","medium","high","urgent"]).default("medium"), clientId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = (ctx as any).user?.id ?? 1;
      if (!db) {
        const ticket = { id: MOCK_TICKETS.length + 1, userId, ...input, status: "open", createdAt: new Date() };
        MOCK_TICKETS.push(ticket); return ticket;
      }
      try {
        const rows = await db.insert(tickets).values({ userId, subject: input.subject, message: input.message, priority: input.priority as any, clientId: input.clientId, status: "open" as any }).returning();
        return rows[0];
      } catch {
        const ticket = { id: MOCK_TICKETS.length + 1, userId, ...input, status: "open", createdAt: new Date() };
        MOCK_TICKETS.push(ticket); return ticket;
      }
    }),

  updateTicketStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.enum(["open","in_progress","resolved","closed"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) { const t = MOCK_TICKETS.find(t => t.id === input.id); if (t) t.status = input.status; return t; }
      try {
        const rows = await db.update(tickets).set({ status: input.status as any }).where(eq(tickets.id, input.id)).returning();
        return rows[0];
      } catch { return null; }
    }),
});
