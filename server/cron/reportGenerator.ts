/**
 * Periodic Report Generator
 * Generates weekly and monthly reports
 */
import { getDb, projects, payments, clients } from "../db";
import { eq, gte, and } from "drizzle-orm";

export async function generateWeeklyReport(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [weekProjects, weekPayments] = await Promise.all([
    db.select().from(projects).where(
      and(eq(projects.userId, userId), gte(projects.createdAt, oneWeekAgo))
    ),
    db.select().from(payments).where(
      and(eq(payments.userId, userId), gte(payments.createdAt, oneWeekAgo))
    ),
  ]);

  const totalRevenue = weekPayments
    .filter((p: any) => p.status === "confirmed")
    .reduce((sum: any, p: any) => sum + p.amount, 0);

  const report = {
    period: "weekly",
    from: oneWeekAgo.toISOString(),
    to: new Date().toISOString(),
    projects: {
      total: weekProjects.length,
      completed: weekProjects.filter((p: any) => p.status === "completed").length,
      active: weekProjects.filter((p: any) => p.status === "active").length,
      failed: weekProjects.filter((p: any) => p.status === "failed").length,
    },
    payments: {
      total: weekPayments.length,
      confirmed: weekPayments.filter((p: any) => p.status === "confirmed").length,
      revenue: totalRevenue,
    },
    apiCost: weekProjects.reduce((sum: any, p: any) => sum + (p.totalCost ?? 0), 0),
    tokensUsed: weekProjects.reduce((sum: any, p: any) => sum + (p.tokensUsed ?? 0), 0),
    generatedAt: new Date().toISOString(),
  };

  return report;
}

export function startReportCron() {
  // Weekly report every Monday at 9 AM
  const checkWeekly = () => {
    const now = new Date();
    if (now.getDay() === 1 && now.getHours() === 9 && now.getMinutes() === 0) {
      console.log("[ReportCron] Generating weekly reports...");
      // Would iterate all users and generate reports
    }
  };
  setInterval(checkWeekly, 60 * 1000); // Check every minute
  console.log("[ReportCron] Report scheduler started");
}

