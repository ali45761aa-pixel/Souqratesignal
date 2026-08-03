import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

const MOCK_CLIENTS: any[] = [
  { id: 1, userId: 1, name: "أحمد محمد", email: "ahmed@example.com", phone: "+966501234567", company: "شركة التقنية", status: "active", totalSpent: 1500, projectsCount: 3, createdAt: new Date() },
  { id: 2, userId: 1, name: "سارة علي", email: "sara@example.com", phone: "+966509876543", company: "مؤسسة الإبداع", status: "active", totalSpent: 850, projectsCount: 2, createdAt: new Date() },
];
const MOCK_INVOICES: any[] = [
  { id: 1, userId: 1, clientId: 1, invoiceNumber: "INV-001", amount: 500, currency: "USD", status: "paid", dueDate: new Date(), createdAt: new Date() },
  { id: 2, userId: 1, clientId: 2, invoiceNumber: "INV-002", amount: 850, currency: "USD", status: "pending", dueDate: new Date(Date.now() + 7 * 86400000), createdAt: new Date() },
];
const MOCK_TICKETS: any[] = [
  { id: 1, userId: 1, clientId: 1, subject: "استفسار عن الخدمة", message: "أريد معرفة المزيد", status: "open", priority: "medium", createdAt: new Date() },
];

export const crmRouter = router({
  listClients: publicProcedure.query(async () => MOCK_CLIENTS),

  createClient: publicProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(), company: z.string().optional(), country: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const client = { id: MOCK_CLIENTS.length + 1, userId: 1, ...input, status: "active", totalSpent: 0, projectsCount: 0, createdAt: new Date() };
      MOCK_CLIENTS.push(client);
      return client;
    }),

  updateClient: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const c = MOCK_CLIENTS.find(c => c.id === input.id);
      if (c) Object.assign(c, input);
      return { success: true };
    }),

  listInvoices: publicProcedure.query(async () => MOCK_INVOICES),

  createInvoice: publicProcedure
    .input(z.object({ clientId: z.number().optional(), projectId: z.number().optional(), amount: z.number().positive(), currency: z.string().default("USD"), notes: z.string().optional(), dueDate: z.number().optional(), lineItems: z.array(z.object({ description: z.string(), qty: z.number(), price: z.number() })).optional() }))
    .mutation(async ({ input }) => {
      const invoice = { id: MOCK_INVOICES.length + 1, userId: 1, invoiceNumber: `INV-${String(MOCK_INVOICES.length + 1).padStart(3, "0")}`, ...input, status: "pending", createdAt: new Date() };
      MOCK_INVOICES.push(invoice);
      return invoice;
    }),

  listTickets: publicProcedure.query(async () => MOCK_TICKETS),

  createTicket: publicProcedure
    .input(z.object({ subject: z.string().min(1), message: z.string().min(1), priority: z.enum(["low","medium","high"]).default("medium"), clientId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const ticket = { id: MOCK_TICKETS.length + 1, userId: 1, ...input, status: "open", createdAt: new Date() };
      MOCK_TICKETS.push(ticket);
      return ticket;
    }),
});
