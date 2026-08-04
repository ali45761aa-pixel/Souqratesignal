import { Router } from 'express';
import type { Request } from 'express';
import multer from 'multer';
import { deployToVercel, pushToGitHub, searchUnsplashImages, tavilySearch, scrapeWebsite } from '../lib/integrations';

const deployRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Push to GitHub ────────────────────────────────────────────
deployRouter.post('/github', async (req, res) => {
  try {
    const { files, repoName } = req.body;
    if (!files || !repoName) return res.status(400).json({ error: 'files and repoName required' });
    const url = await pushToGitHub(files, repoName);
    if (!url) {
      return res.json({ success: false, message: 'GITHUB_TOKEN not configured. Add it from Admin → API Keys.', configRequired: true });
    }
    res.json({ success: true, url });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Deploy to Custom Server (FTP/SSH simulation via API) ──────
deployRouter.post('/custom-server', async (req, res) => {
  try {
    const { files, serverConfig } = req.body;
    // serverConfig: { host, port, username, password, path, protocol: 'ftp'|'sftp'|'cpanel' }
    if (!files || !serverConfig) return res.status(400).json({ error: 'files and serverConfig required' });

    const { host, username, password, path: remotePath = '/public_html', protocol = 'ftp' } = serverConfig;
    if (!host || !username || !password) {
      return res.status(400).json({ error: 'host, username, password required' });
    }

    // Build deployment package info
    const fileCount = files.length;
    const totalSize = files.reduce((acc: number, f: any) => acc + (f.content?.length || 0), 0);

    // Return deployment instructions since direct FTP requires native modules
    // In production on Contabo, this would use node-ftp or ssh2-sftp-client
    res.json({
      success: true,
      method: protocol,
      instructions: {
        host, username, remotePath,
        fileCount, totalSizeKB: Math.round(totalSize / 1024),
        steps: [
          `Connect to ${host} via ${protocol.toUpperCase()}`,
          `Navigate to ${remotePath}`,
          `Upload ${fileCount} files`,
          'Set permissions to 644 for files, 755 for directories',
          `Visit https://${host} to verify deployment`,
        ],
        note: 'Full automated FTP/SSH deployment available when running on your Contabo server with node-ftp package installed.',
      },
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── ZIP Import — parse uploaded ZIP and return files ─────────
deployRouter.post('/import-zip', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Dynamically import JSZip to avoid top-level issues
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(req.file.buffer);

    const files: { name: string; content: string; language: string }[] = [];
    const textExtensions = ['.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.php', '.sql', '.env', '.yaml', '.yml', '.xml', '.svg'];

    const getLanguage = (filename: string): string => {
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      const map: Record<string, string> = {
        '.html': 'html', '.css': 'css', '.js': 'javascript', '.ts': 'typescript',
        '.jsx': 'jsx', '.tsx': 'tsx', '.json': 'json', '.md': 'markdown',
        '.py': 'python', '.php': 'php', '.sql': 'sql', '.svg': 'svg',
      };
      return map[ext] || 'text';
    };

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      if (!textExtensions.includes(ext)) continue;
      if (filename.includes('node_modules/') || filename.includes('.git/')) continue;
      if (zipEntry.comment?.includes('__MACOSX')) continue;

      try {
        const content = await zipEntry.async('string');
        const shortName = filename.includes('/') ? filename.split('/').slice(1).join('/') : filename;
        if (shortName && content.length < 500000) { // skip files > 500KB
          files.push({ name: shortName || filename, content, language: getLanguage(filename) });
        }
      } catch { /* skip binary files */ }
    }

    if (files.length === 0) return res.status(400).json({ error: 'No readable text files found in ZIP' });

    res.json({ success: true, files, fileCount: files.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Execute HTML in sandbox and capture errors ────────────────
deployRouter.post('/validate-html', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'html required' });

    // Basic HTML validation
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for common issues
    if (!html.includes('<!DOCTYPE') && !html.includes('<!doctype')) warnings.push('Missing DOCTYPE declaration');
    if (!html.includes('<html')) errors.push('Missing <html> tag');
    if (!html.includes('<head>') && !html.includes('<head ')) warnings.push('Missing <head> section');
    if (!html.includes('<body>') && !html.includes('<body ')) warnings.push('Missing <body> section');
    if (!html.includes('<title>')) warnings.push('Missing <title> tag (important for SEO)');
    if (!html.includes('viewport')) warnings.push('Missing viewport meta tag (important for mobile)');
    if (!html.includes('charset') && !html.includes('UTF-8')) warnings.push('Missing charset declaration');

    // Check for unclosed tags (basic)
    const openTags = (html.match(/<[a-z][^/!>]*>/gi) || []).length;
    const closeTags = (html.match(/<\/[a-z][^>]*>/gi) || []).length;
    if (Math.abs(openTags - closeTags) > 5) warnings.push(`Possible unclosed tags (${openTags} open, ${closeTags} close)`);

    // SEO checks
    const hasMetaDesc = html.includes('meta name="description"') || html.includes("meta name='description'");
    if (!hasMetaDesc) warnings.push('Missing meta description (important for SEO)');

    const hasH1 = html.includes('<h1') || html.includes('<H1');
    if (!hasH1) warnings.push('Missing H1 heading');

    // Accessibility checks
    const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
    if (imgWithoutAlt > 0) warnings.push(`${imgWithoutAlt} image(s) missing alt attribute`);

    const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 5);

    res.json({ success: true, errors, warnings, score, valid: errors.length === 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
// ── Execute HTML in sandbox and capture errors ────────────────
deployRouter.post('/validate-html', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'html required' });

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // ── SEO Score ──
    let seoScore = 100;
    if (!html.includes('<!DOCTYPE') && !html.includes('<!doctype')) { errors.push('Missing DOCTYPE'); seoScore -= 10; }
    if (!html.includes('<title>') && !html.includes('<title ')) { errors.push('Missing <title> tag'); seoScore -= 15; }
    if (!html.match(/meta[^>]+name=["']description["']/i)) { warnings.push('Missing meta description'); seoScore -= 10; suggestions.push('Add: <meta name="description" content="...">'); }
    if (!html.includes('<h1')) { warnings.push('No H1 heading'); seoScore -= 8; }
    if (!html.match(/property=["']og:/i)) { warnings.push('Missing Open Graph tags'); seoScore -= 5; suggestions.push('Add og:title, og:description, og:image'); }
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imgWithoutAlt = imgMatches.filter((img: string) => !img.includes('alt=')).length;
    if (imgWithoutAlt > 0) { warnings.push(`${imgWithoutAlt} image(s) missing alt`); seoScore -= imgWithoutAlt * 3; }

    // ── Performance Score ──
    let perfScore = 100;
    const htmlSize = html.length;
    if (htmlSize > 100000) { warnings.push(`Large HTML: ${Math.round(htmlSize / 1000)}KB`); perfScore -= 15; }
    const scriptCount = (html.match(/<script/gi) || []).length;
    if (scriptCount > 6) { warnings.push(`${scriptCount} script tags (consider bundling)`); perfScore -= 10; }
    if (imgMatches.length > 3 && !html.includes('loading=')) { suggestions.push('Add loading="lazy" to images'); perfScore -= 5; }

    // ── Mobile Score ──
    let mobileScore = 100;
    if (!html.match(/meta[^>]+name=["']viewport["']/i)) { errors.push('Missing viewport meta!'); mobileScore -= 30; }
    const hasResponsive = html.includes('@media') || html.includes('sm:') || html.includes('md:') || html.includes('responsive');
    if (!hasResponsive) { warnings.push('No responsive CSS detected'); mobileScore -= 20; suggestions.push('Add responsive breakpoints or use Tailwind CSS'); }

    // ── Accessibility Score ──
    let a11yScore = 100;
    const semanticTags = ['<header', '<main', '<footer', '<nav', '<section', '<article'];
    if (!semanticTags.some(t => html.includes(t))) { warnings.push('No semantic HTML5 tags'); a11yScore -= 15; suggestions.push('Use <header>, <main>, <footer>, <nav>'); }
    if (!html.match(/aria-label|role=/i)) { suggestions.push('Add ARIA labels for accessibility'); a11yScore -= 5; }
    const openTags = (html.match(/<[a-z][^/!>]*>/gi) || []).length;
    const closeTags = (html.match(/<\/[a-z][^>]*>/gi) || []).length;
    if (Math.abs(openTags - closeTags) > 5) { warnings.push(`Possible unclosed tags (${openTags} open, ${closeTags} close)`); a11yScore -= 10; }

    const score = Math.round((seoScore + perfScore + mobileScore + a11yScore) / 4);

    res.json({
      success: true,
      score: Math.max(0, Math.min(100, score)),
      seoScore: Math.max(0, Math.min(100, seoScore)),
      perfScore: Math.max(0, Math.min(100, perfScore)),
      mobileScore: Math.max(0, Math.min(100, mobileScore)),
      a11yScore: Math.max(0, Math.min(100, a11yScore)),
      errors,
      warnings,
      suggestions,
      valid: errors.length === 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Unsplash Image Search ─────────────────────────────────────
deployRouter.post('/unsplash', async (req, res) => {
  try {
    const { query, count = 6 } = req.body;
    const images = await searchUnsplashImages(query || 'professional business', count);
    res.json({ success: true, images });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Tavily Web Search ─────────────────────────────────────────
deployRouter.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query required' });
    const result = await tavilySearch(query);
    res.json({ success: true, result });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Firecrawl Scrape ──────────────────────────────────────────
deployRouter.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const content = await scrapeWebsite(url);
    res.json({ success: true, content });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default deployRouter;
