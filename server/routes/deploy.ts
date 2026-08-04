import { Router } from 'express';
import { deployToVercel, pushToGitHub, searchUnsplashImages, tavilySearch, scrapeWebsite } from '../lib/integrations';

const deployRouter = Router();

// ── Deploy to Vercel ──────────────────────────────────────────
deployRouter.post('/vercel', async (req, res) => {
  try {
    const { files, projectName } = req.body;
    if (!files || !projectName) return res.status(400).json({ error: 'files and projectName required' });

    const result = await deployToVercel(files, projectName);
    if (!result) {
      return res.json({
        success: false,
        message: 'VERCEL_TOKEN not configured. Add it from Admin → API Keys to enable auto-deploy.',
        configRequired: true,
      });
    }
    res.json({ success: true, url: result.url, deploymentId: result.deploymentId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Push to GitHub ────────────────────────────────────────────
deployRouter.post('/github', async (req, res) => {
  try {
    const { files, repoName } = req.body;
    if (!files || !repoName) return res.status(400).json({ error: 'files and repoName required' });

    const url = await pushToGitHub(files, repoName);
    if (!url) {
      return res.json({
        success: false,
        message: 'GITHUB_TOKEN not configured. Add it from Admin → API Keys.',
        configRequired: true,
      });
    }
    res.json({ success: true, url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Unsplash Image Search ─────────────────────────────────────
deployRouter.post('/unsplash', async (req, res) => {
  try {
    const { query, count = 6 } = req.body;
    const images = await searchUnsplashImages(query || 'professional business', count);
    res.json({ success: true, images });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Tavily Web Search ─────────────────────────────────────────
deployRouter.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query required' });
    const result = await tavilySearch(query);
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Firecrawl Scrape ──────────────────────────────────────────
deployRouter.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const content = await scrapeWebsite(url);
    res.json({ success: true, content });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default deployRouter;
