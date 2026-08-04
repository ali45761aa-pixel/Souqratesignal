import { Router, Request, Response } from "express";

const qaRouter = Router();

// ── 1. HTML Quality Analysis (Lighthouse-style without browser) ─────────────
qaRouter.post("/analyze", async (req: Request, res: Response) => {
  const { html, lang = "en" } = req.body;
  if (!html) return res.status(400).json({ error: "html required" });

  try {
    // Analyze HTML statically for quality metrics
    const analysis = analyzeHtmlQuality(html);
    res.json(analysis);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── 2. AI Visual QA — analyzes HTML as if seeing it visually ───────────────
qaRouter.post("/visual-qa", async (req: Request, res: Response) => {
  const { html, lang = "en" } = req.body;
  if (!html) return res.status(400).json({ error: "html required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const ar = lang === "ar";
  const prompt = ar
    ? `أنت وكيل QA متخصص. حلّل هذا الكود HTML كأنك تراه بصرياً في متصفح حقيقي.

افحص:
1. **الروابط والأزرار**: هل كل <a href> و<button> لها وجهة منطقية؟
2. **النماذج**: هل <form> لها action أو معالج JS؟
3. **الصور**: هل كل <img> لها src حقيقي وalt text؟
4. **التصميم المتسق**: هل الألوان والخطوط متسقة؟
5. **المحتوى**: هل يوجد نص placeholder أو Lorem ipsum؟
6. **الأداء**: هل scripts في نهاية body؟ هل الصور لها loading="lazy"؟
7. **Accessibility**: هل يوجد alt text لكل صورة؟ aria-labels للأزرار؟
8. **الموبايل**: هل viewport meta موجود؟ هل هناك media queries؟

الكود:
\`\`\`html
${html.slice(0, 15000)}
\`\`\`

أخرج تقريراً منظماً:
## 🔴 مشاكل حرجة (تكسر الموقع)
## 🟡 تحسينات مطلوبة
## 🟢 ملاحظات
## ⭐ التقييم: [X]/100

ثم أخرج JSON في نهاية التقرير:
\`\`\`json
{"score": 85, "critical": 2, "improvements": 5, "notes": 3, "issues": [{"type": "critical", "element": "button#submit", "issue": "No click handler", "fix": "Add onclick or form submit"}]}
\`\`\``
    : `You are a specialized QA Agent. Analyze this HTML code as if you're viewing it visually in a real browser.

Check:
1. **Links & Buttons**: Does every <a href> and <button> have a logical destination?
2. **Forms**: Does every <form> have an action or JS handler?
3. **Images**: Does every <img> have a real src and alt text?
4. **Design Consistency**: Are colors and fonts consistent throughout?
5. **Content**: Any placeholder text or Lorem ipsum?
6. **Performance**: Are scripts at end of body? Do images have loading="lazy"?
7. **Accessibility**: Alt text for all images? aria-labels for buttons?
8. **Mobile**: Is viewport meta present? Are there media queries?

HTML Code:
\`\`\`html
${html.slice(0, 15000)}
\`\`\`

Output a structured report:
## 🔴 Critical Issues (break the site)
## 🟡 Required Improvements
## 🟢 Notes
## ⭐ Score: [X]/100

Then output JSON at the end:
\`\`\`json
{"score": 85, "critical": 2, "improvements": 5, "notes": 3, "issues": [{"type": "critical", "element": "button#submit", "issue": "No click handler", "fix": "Add onclick or form submit"}]}
\`\`\``;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], stream: true, max_tokens: 3000 }),
    });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const text = parsed.choices?.[0]?.delta?.content || "";
            if (text) { fullContent += text; res.write(`data: ${JSON.stringify({ type: "chunk", content: text })}\n\n`); }
          } catch {}
        }
      }
    }

    // Extract JSON from response
    const jsonMatch = fullContent.match(/```json[\s\S]*?```/);
    if (jsonMatch) {
      try {
        const qaData = JSON.parse(jsonMatch[1]);
        res.write(`data: ${JSON.stringify({ type: "qa_data", data: qaData })}\n\n`);
      } catch {}
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: e.message })}\n\n`);
    res.end();
  }
});

// ── 3. Interactive QA — check links, buttons, forms in HTML ─────────────────
qaRouter.post("/interactive-check", async (req: Request, res: Response) => {
  const { html } = req.body;
  if (!html) return res.status(400).json({ error: "html required" });

  try {
    const results = interactiveCheck(html);
    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── 4. Auto-fix based on QA issues ──────────────────────────────────────────
qaRouter.post("/auto-fix", async (req: Request, res: Response) => {
  const { html, issues, lang = "en" } = req.body;
  if (!html || !issues) return res.status(400).json({ error: "html and issues required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const ar = lang === "ar";
  const issuesList = issues.map((i: any) => `- [${i.type.toUpperCase()}] ${i.element}: ${i.issue} → Fix: ${i.fix}`).join("\n");

  const prompt = ar
    ? `أنت مطور خبير. صحّح هذه المشاكل في الكود:

المشاكل المكتشفة:
${issuesList}

الكود الحالي:
\`\`\`html
${html.slice(0, 20000)}
\`\`\`

أرجع الكود HTML الكامل المُصحَّح فقط داخل \`\`\`html ... \`\`\``
    : `You are an expert developer. Fix these issues in the code:

Detected Issues:
${issuesList}

Current Code:
\`\`\`html
${html.slice(0, 20000)}
\`\`\`

Return ONLY the complete fixed HTML inside \`\`\`html ... \`\`\``;

  try {
    const response2 = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], stream: true, max_tokens: 16000 }),
    });
    const reader2 = response2.body?.getReader();
    const decoder2 = new TextDecoder();
    if (reader2) {
      while (true) {
        const { done, value } = await reader2.read();
        if (done) break;
        for (const line of decoder2.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const text = parsed.choices?.[0]?.delta?.content || "";
            if (text) res.write(`data: ${JSON.stringify({ type: "chunk", content: text })}\n\n`);
          } catch {}
        }
      }
    }
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: e.message })}\n\n`);
    res.end();
  }
});

// ── Helper: Static HTML Quality Analysis ────────────────────────────────────
function analyzeHtmlQuality(html: string) {
  const scores: Record<string, number> = {};
  const issues: string[] = [];
  const warnings: string[] = [];
  const passes: string[] = [];

  // Performance checks
  let perfScore = 100;
  if (!html.includes('loading="lazy"')) { perfScore -= 15; warnings.push("Images missing loading='lazy'"); }
  if (html.match(/<script[^>]*src[^>]*>/)?.length && !html.includes('defer') && !html.includes('async')) { perfScore -= 10; warnings.push("Scripts not deferred"); }
  if (html.includes('<link') && html.includes('stylesheet') && html.includes('</head>')) passes.push("CSS in head");
  scores.performance = Math.max(0, perfScore);

  // SEO checks
  let seoScore = 100;
  if (!html.includes('<meta name="description"')) { seoScore -= 20; issues.push("Missing meta description"); }
  if (!html.includes('<meta property="og:')) { seoScore -= 10; warnings.push("Missing Open Graph tags"); }
  if (!html.match(/<h1[^>]*>/)) { seoScore -= 15; issues.push("Missing H1 tag"); }
  if (!html.includes('<title>') || html.includes('<title></title>')) { seoScore -= 20; issues.push("Missing or empty title"); }
  if (html.includes('<title>') && !html.includes('<title></title>')) passes.push("Title present");
  scores.seo = Math.max(0, seoScore);

  // Accessibility checks
  let a11yScore = 100;
  const imgTags = html.match(/<img[^>]*>/g) || [];
  const imgsWithoutAlt = imgTags.filter(img => !img.includes('alt=')).length;
  if (imgsWithoutAlt > 0) { a11yScore -= imgsWithoutAlt * 5; warnings.push(`${imgsWithoutAlt} images missing alt text`); }
  if (!html.includes('viewport')) { a11yScore -= 20; issues.push("Missing viewport meta"); }
  if (html.includes('role=') || html.includes('aria-')) passes.push("ARIA attributes present");
  scores.accessibility = Math.max(0, a11yScore);

  // Mobile checks
  let mobileScore = 100;
  if (!html.includes('viewport')) { mobileScore -= 30; issues.push("No viewport meta tag"); }
  if (!html.includes('@media') && !html.includes('responsive')) { mobileScore -= 20; warnings.push("No media queries found"); }
  if (html.includes('flex') || html.includes('grid')) passes.push("Flexbox/Grid layout used");
  scores.mobile = Math.max(0, mobileScore);

  // Content checks
  const hasLorem = html.toLowerCase().includes('lorem ipsum');
  const hasPlaceholder = html.includes('[placeholder]') || html.includes('placeholder text');
  if (hasLorem) { warnings.push("Lorem ipsum text found"); }
  if (hasPlaceholder) { warnings.push("Placeholder text found"); }

  // Libraries check
  const hasAOS = html.includes('aos.js') || html.includes('aos@');
  const hasAlpine = html.includes('alpinejs') || html.includes('alpine');
  const hasLucide = html.includes('lucide');
  if (hasAOS) passes.push("AOS animations library");
  if (hasAlpine) passes.push("Alpine.js interactions");
  if (hasLucide) passes.push("Lucide icons");

  const overall = Math.round((scores.performance + scores.seo + scores.accessibility + scores.mobile) / 4);

  return {
    overall,
    scores,
    issues,
    warnings,
    passes,
    hasAOS,
    hasAlpine,
    hasLucide,
    imgCount: imgTags.length,
    imgsWithoutAlt,
    hasLorem,
  };
}

// ── Helper: Interactive HTML Check ──────────────────────────────────────────
function interactiveCheck(html: string) {
  const results: { type: string; element: string; issue: string; fix: string }[] = [];

  // Check links
  const links = html.match(/<a[^>]*href[^>]*>/g) || [];
  links.forEach(link => {
    if (link.includes('href="#"') || link.includes("href='#'")) {
      results.push({ type: "warning", element: link.slice(0, 50), issue: "Empty anchor href='#'", fix: "Add real URL or scroll target" });
    }
    if (link.includes('href=""') || link.includes("href=''")) {
      results.push({ type: "critical", element: link.slice(0, 50), issue: "Empty href", fix: "Add destination URL" });
    }
  });

  // Check buttons
  const buttons = html.match(/<button[^>]*>[^<]*<\/button>/g) || [];
  buttons.forEach(btn => {
    if (!btn.includes('onclick') && !btn.includes('@click') && !btn.includes('type="submit"') && !btn.includes("type='submit'")) {
      results.push({ type: "warning", element: btn.slice(0, 60).replace(/\s+/g, ' '), issue: "Button with no click handler", fix: "Add onclick, @click, or type='submit'" });
    }
  });

  // Check images
  const imgs = html.match(/<img[^>]*>/g) || [];
  imgs.forEach(img => {
    if (!img.includes('alt=')) {
      results.push({ type: "warning", element: img.slice(0, 60), issue: "Image missing alt text", fix: "Add descriptive alt='...'" });
    }
    if (!img.includes('loading=')) {
      results.push({ type: "note", element: img.slice(0, 60), issue: "Image missing loading='lazy'", fix: "Add loading='lazy'" });
    }
  });

  // Check forms
  const forms = html.match(/<form[^>]*>/g) || [];
  forms.forEach(form => {
    if (!form.includes('action=') && !form.includes('@submit') && !form.includes('onsubmit')) {
      results.push({ type: "warning", element: form.slice(0, 60), issue: "Form with no action or submit handler", fix: "Add action URL or onsubmit handler" });
    }
  });

  // Check for placeholder content
  if (html.toLowerCase().includes('lorem ipsum')) {
    results.push({ type: "critical", element: "Content", issue: "Lorem ipsum placeholder text found", fix: "Replace with real content" });
  }

  // Check meta tags
  if (!html.includes('<meta name="description"')) {
    results.push({ type: "warning", element: "<head>", issue: "Missing meta description", fix: "Add <meta name='description' content='...'>" });
  }

  const critical = results.filter(r => r.type === "critical").length;
  const warnings = results.filter(r => r.type === "warning").length;
  const notes = results.filter(r => r.type === "note").length;

  return { results, critical, warnings, notes, total: results.length };
}

export { qaRouter };
