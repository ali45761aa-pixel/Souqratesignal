import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { projects, projectFiles, projectVersions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";
import { COOKIE_NAME } from "@shared/const";

const saveProjectRouter = Router();
const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "fallback-secret-change-me");

// ── Get user from cookie ──────────────────────────────────────────────────────
async function getUserFromCookie(req: Request): Promise<number | null> {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as number;
  } catch {
    return null;
  }
}

// ── Save completed project ────────────────────────────────────────────────────
saveProjectRouter.post("/save-project", async (req: Request, res: Response) => {
  const { prompt, files, totalCost, tokensUsed, projectType } = req.body;
  if (!prompt || !files || !Array.isArray(files)) {
    res.status(400).json({ error: "prompt and files required" });
    return;
  }

  const userId = await getUserFromCookie(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const db = await getDb();

    // Generate project name from prompt
    const name = prompt.slice(0, 80).trim();

    // Insert project
    await (db as any).insert(projects).values({
      userId,
      name,
      prompt,
      status: "completed",
      projectType: projectType || "website",
      totalCost: totalCost || 0,
      tokensUsed: tokensUsed || 0,
      completedAt: new Date(),
    });

    // Get the inserted project ID
    const inserted = await (db as any).select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy((projects as any).createdAt)
      .limit(1);

    // We'll use a simpler approach: get latest project for this user
    const allProjects = await (db as any).select().from(projects)
      .where(eq(projects.userId, userId));
    const newProject = allProjects.sort((a: any, b: any) => b.id - a.id)[0];

    if (newProject) {
      // Save files
      for (const file of files.slice(0, 20)) {
        await (db as any).insert(projectFiles).values({
          projectId: newProject.id,
          filename: file.name || "index.html",
          filePath: file.name || "index.html",
          storageKey: `project_${newProject.id}_${file.name}`,
          storageUrl: "",
          language: file.language || "html",
          content: (file.content || "").slice(0, 65000),
          sizeBytes: (file.content || "").length,
        });
      }

      // Save version snapshot
      const snapshot: Record<string, string> = {};
      for (const file of files.slice(0, 10)) {
        snapshot[file.name] = (file.content || "").slice(0, 10000);
      }
      await (db as any).insert(projectVersions).values({
        projectId: newProject.id,
        versionNumber: 1,
        label: "Initial version",
        snapshot,
      });
    }

    res.json({ success: true, projectId: newProject?.id });
  } catch (err: any) {
    console.error("[SaveProject] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Get user's projects ───────────────────────────────────────────────────────
saveProjectRouter.get("/my-projects", async (req: Request, res: Response) => {
  const userId = await getUserFromCookie(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const db = await getDb();
    const userProjects = await (db as any).select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy((projects as any).createdAt);

    res.json({ projects: userProjects.reverse() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get project files ─────────────────────────────────────────────────────────
saveProjectRouter.get("/project-files/:projectId", async (req: Request, res: Response) => {
  const userId = await getUserFromCookie(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const projectId = parseInt(req.params.projectId);
  try {
    const db = await getDb();
    // Verify ownership
    const proj = await (db as any).select().from(projects)
      .where(eq(projects.id, projectId)).limit(1);
    if (!proj[0] || proj[0].userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const files = await (db as any).select().from(projectFiles)
      .where(eq(projectFiles.projectId, projectId));

    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default saveProjectRouter;
