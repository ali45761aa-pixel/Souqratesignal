import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, clients, invoices, tickets, ticketReplies } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const crmRouter = router({
  // Clients
  listClients: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(clients).where(eq(clients.userId, ctx.user.id)).orderBy(desc(clients.createdAt));
  }),

  createClient: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      country: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(clients).values({ userId: ctx.user.id, ...input }).returning();
      return result[0];
    }),

  updateClient: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(clients).set({ ...updates, updatedAt: new Date() })
        .where(and(eq(clients.id, id), eq(clients.userId, ctx.user.id)));
      return { success: true };
    }),

  // Invoices
  listInvoices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(invoices).where(eq(invoices.userId, ctx.user.id)).orderBy(desc(invoices.createdAt));
  }),

  createInvoice: protectedProcedure
    .input(z.object({
      clientId: z.number().optional(),
      projectId: z.number().optional(),
      amount: z.number().positive(),
      currency: z.string().default("USD"),
      notes: z.string().optional(),
      dueDate: z.number().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        qty: z.number(),
        price: z.number(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const invoiceNumber = `INV-${Date.now()}-${nanoid(4).toUpperCase()}`;
      const result = await db.insert(invoices).values({
        userId: ctx.user.id,
        clientId: input.clientId,
        projectId: input.projectId,
        invoiceNumber,
        amount: input.amount,
        currency: input.currency,
        notes: input.notes,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        lineItems: input.lineItems ?? [],
      }).returning();
      return result[0];
    }),

  // Tickets
  listTickets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tickets).where(eq(tickets.userId, ctx.user.id)).orderBy(desc(tickets.createdAt));
  }),

  createTicket: protectedProcedure
    .input(z.object({
      subject: z.string().min(1),
      message: z.string().min(1),
      priority: z.enum(["low","medium","high"]).default("medium"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(tickets).values({ userId: ctx.user.id, ...input }).returning();
      return result[0];
    }),
});
