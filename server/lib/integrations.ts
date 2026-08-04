// ============================================================
// External Integrations — API keys stored in env
// ============================================================

import axios from 'axios';

// ── Unsplash ─────────────────────────────────────────────────
export async function searchUnsplashImages(query: string, count = 6): Promise<string[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    // Return curated fallback images by category
    return getFallbackImages(query, count);
  }
  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: count, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${key}` },
      timeout: 5000,
    });
    return res.data.results.map((p: any) => `${p.urls.regular}&w=800&q=80`);
  } catch {
    return getFallbackImages(query, count);
  }
}

function getFallbackImages(query: string, count: number): string[] {
  const q = query.toLowerCase();
  const categories: Record<string, string[]> = {
    business: ['1556761175-4b46a572b786','1507003211169-0a1dd7228f2d','1454165804606-c3d57bc86b40','1552664730-d307ca884978','1497366216548-37526070297c'],
    tech: ['1518770660439-4636190af475','1461749280684-dccba630e2f6','1504384308090-c894fdcc538d','1526374965328-7f61d4dc18c5','1550751827-4bd374173312'],
    food: ['1565299624946-b28f40a0ae38','1567620905732-2d1ec7ab7445','1504674900247-0877df9cc836','1540189549336-e6e99eb4b951','1476224203421-74177f19a8c8'],
    nature: ['1441974231531-c6227db76b6e','1506905925346-21bda4d32df4','1469474968028-56623f02e42e','1501854140801-50d01698950b','1518173946687-a4c8892bbd9f'],
    fashion: ['1558618666-fcd25c85cd64','1490481651871-ab68de25d43d','1539109136881-3be0616acf4b','1515886657613-9f3515b0c78f','1509631179647-0177331693ae'],
    real_estate: ['1560518883-ce09059eeffa','1570129477492-45c003edd2be','1449844908441-8d567a3717c6','1416331108676-a22ccb276e35','1512917774080-9991f1c4c750'],
    health: ['1559757148-5c350d0d3c56','1576091160399-112ba8d25d1d','1571019613454-1cb2f99b2d8b','1505751172876-fa1923c5c528','1498837167922-ddd27525d352'],
    education: ['1503676260728-1c00da094a0b','1523050854058-8df90110c9f1','1456513080510-7bf3a84b82f8','1434030216411-0b793f4b4173','1488190211105-8b0e65b80b4e'],
    default: ['1557804506-669a67965ba0','1551434678-e076c223a692','1460925895917-afdab827c52f','1486312338219-ce68d2c6f44d','1497366811353-6870744d04b2'],
  };

  let imgs = categories.default;
  for (const [cat, urls] of Object.entries(categories)) {
    if (q.includes(cat) || q.includes(cat.replace('_', ' '))) { imgs = urls; break; }
  }
  if (q.includes('متجر') || q.includes('shop') || q.includes('store')) imgs = categories.fashion;
  if (q.includes('مطعم') || q.includes('food') || q.includes('restaurant')) imgs = categories.food;
  if (q.includes('تقنية') || q.includes('برمجة') || q.includes('software')) imgs = categories.tech;
  if (q.includes('عقار') || q.includes('real estate') || q.includes('property')) imgs = categories.real_estate;
  if (q.includes('صحة') || q.includes('health') || q.includes('medical')) imgs = categories.health;
  if (q.includes('تعليم') || q.includes('education') || q.includes('school')) imgs = categories.education;

  return imgs.slice(0, count).map(id => `https://images.unsplash.com/photo-${id}?w=800&q=80`);
}

// ── Firecrawl ─────────────────────────────────────────────────
export async function scrapeWebsite(url: string): Promise<string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return `[Firecrawl not configured — add FIRECRAWL_API_KEY to env]`;
  try {
    const res = await axios.post('https://api.firecrawl.dev/v1/scrape', {
      url, formats: ['markdown'], onlyMainContent: true,
    }, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return res.data.data?.markdown?.slice(0, 3000) || 'No content extracted';
  } catch (e: any) {
    return `[Firecrawl error: ${e.message}]`;
  }
}

// ── Tavily Search ─────────────────────────────────────────────
// ── Serper Search (Google) ─────────────────────────────────────
export async function serperSearch(query: string, maxResults = 5): Promise<string> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return tavilySearch(query, maxResults); // fallback to Tavily
  try {
    const res = await axios.post('https://google.serper.dev/search', {
      q: query, num: maxResults, gl: 'sa', hl: 'ar',
    }, {
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    const answerBox = res.data.answerBox?.answer || res.data.answerBox?.snippet || '';
    const organic = (res.data.organic || []).slice(0, 4)
      .map((r: any) => `**${r.title}**\n${r.snippet || ''}`)
      .join('\n\n');
    const knowledgeGraph = res.data.knowledgeGraph?.description || '';
    return `${answerBox}\n${knowledgeGraph}\n\n${organic}`.trim().slice(0, 2000);
  } catch (e: any) {
    return tavilySearch(query, maxResults); // fallback on error
  }
}

export async function tavilySearch(query: string, maxResults = 5): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return `[Search not configured — add SERPER_API_KEY or TAVILY_API_KEY]`;
  try {
    const res = await axios.post('https://api.tavily.com/search', {
      api_key: key, query, max_results: maxResults,
      search_depth: 'advanced', include_answer: true,
    }, { timeout: 10000 });
    const answer = res.data.answer || '';
    const results = (res.data.results || []).slice(0, 3)
      .map((r: any) => `**${r.title}**\n${r.content?.slice(0, 300)}`)
      .join('\n\n');
    return `${answer}\n\n${results}`.slice(0, 2000);
  } catch (e: any) {
    return `[Search error: ${e.message}]`;
  }
}

// ── Vercel Deploy ─────────────────────────────────────────────
export async function deployToVercel(files: { name: string; content: string }[], projectName: string): Promise<{ url: string; deploymentId: string } | null> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return null;
  try {
    const fileMap: Record<string, { content: string; encoding: string }> = {};
    for (const f of files) {
      fileMap[f.name] = { content: Buffer.from(f.content).toString('base64'), encoding: 'base64' };
    }
    const res = await axios.post('https://api.vercel.com/v13/deployments', {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
      files: Object.entries(fileMap).map(([file, data]) => ({ file, ...data })),
      projectSettings: { framework: null },
      target: 'production',
    }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const url = `https://${res.data.url}`;
    return { url, deploymentId: res.data.id };
  } catch (e: any) {
    console.error('[Vercel Deploy Error]', e.message);
    return null;
  }
}

// ── GitHub Push ───────────────────────────────────────────────
export async function pushToGitHub(files: { name: string; content: string }[], repoName: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const headers = { Authorization: `token ${token}`, 'Content-Type': 'application/json' };
    // Create repo
    await axios.post('https://api.github.com/user/repos', {
      name: repoName, private: false, auto_init: false,
    }, { headers, timeout: 10000 });
    // Get user
    const user = await axios.get('https://api.github.com/user', { headers });
    const username = user.data.login;
    // Push files
    for (const file of files.slice(0, 10)) {
      await axios.put(`https://api.github.com/repos/${username}/${repoName}/contents/${file.name}`, {
        message: `Add ${file.name}`,
        content: Buffer.from(file.content).toString('base64'),
      }, { headers, timeout: 10000 });
    }
    return `https://github.com/${username}/${repoName}`;
  } catch (e: any) {
    return null;
  }
}
