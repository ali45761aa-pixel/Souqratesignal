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
          } catch (_e) { /* intentional */ }
        }
      }
    }

    // Extract JSON from response
    const jsonMatch = fullContent.match(/```json[\s\S]*?```/);
    if (jsonMatch) {
      try {
        const qaData = JSON.parse(jsonMatch[1]);
        res.write(`data: ${JSON.stringify({ type: "qa_data", data: qaData })}\n\n`);
      } catch (_e) { /* intentional */ }
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
          } catch (_e) { /* intentional */ }
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

// ── 5. HTML Reconstructor — final clean pass after all agents complete ───────
qaRouter.post("/reconstruct", async (req: Request, res: Response) => {
  const { html, projectName = "Website", lang = "en" } = req.body;
  if (!html) return res.status(400).json({ error: "html required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const ar = lang === "ar";

  // Extract what we can from the messy HTML first
  const extracted = extractCleanHtml(html);

  const prompt = ar
    ? `أنت مهندس HTML محترف. لديك كود HTML قد يحتوي على نصوص مختلطة أو أخطاء.

مهمتك: أعد كتابة هذا كـ HTML نظيف كامل ومتكامل.

القواعد الصارمة:
1. ابدأ بـ <!DOCTYPE html> مباشرة — لا نص قبله أبداً
2. احتفظ بكل CSS و JavaScript والمحتوى الأصلي
3. أصلح أي HTML tags مكسورة أو غير مغلقة
4. تأكد من وجود <html>, <head>, <body> بشكل صحيح
5. أزل أي نص عادي خارج الـ HTML tags
6. لا تغير التصميم أو المحتوى — فقط نظّف البنية

الكود المُدخَل:
${extracted.slice(0, 25000)}

أرجع HTML الكامل النظيف فقط — لا شرح، لا تعليق، لا markdown — فقط الكود مباشرة بدون \`\`\`html`
    : `You are a professional HTML engineer. You have HTML code that may contain mixed text or errors.

Your task: Rewrite this as a complete, clean, valid HTML document.

STRICT RULES:
1. Start with <!DOCTYPE html> immediately — NO text before it ever
2. Keep ALL CSS, JavaScript, and original content intact
3. Fix any broken or unclosed HTML tags
4. Ensure proper <html>, <head>, <body> structure
5. Remove any plain text that appears outside HTML tags
6. Do NOT change the design or content — only clean the structure

Input code:
${extracted.slice(0, 25000)}

Return ONLY the complete clean HTML — no explanation, no comments, no markdown — just the code directly without \`\`\`html`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 16000,
        temperature: 0.1, // low temperature for consistent clean output
      }),
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
            if (text) {
              fullContent += text;
              res.write(`data: ${JSON.stringify({ type: "chunk", content: text })}\n\n`);
            }
          } catch (_e) { /* intentional */ }
        }
      }
    }

    // Final validation — ensure output starts with <!DOCTYPE
    const finalHtml = finalizeHtml(fullContent);
    res.write(`data: ${JSON.stringify({ type: "final", html: finalHtml })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ type: "error", message: e.message })}\n\n`);
    res.end();
  }
});

// ── Helper: Extract the cleanest possible HTML from messy input ──────────────
function extractCleanHtml(raw: string): string {
  // Try to find <!DOCTYPE first
  const doctypeIdx = raw.indexOf("<!DOCTYPE");
  if (doctypeIdx >= 0) return raw.slice(doctypeIdx);

  // Try <html tag
  const htmlIdx = raw.indexOf("<html");
  if (htmlIdx >= 0) return raw.slice(htmlIdx);

  // Try <head tag
  const headIdx = raw.indexOf("<head");
  if (headIdx >= 0) return `<!DOCTYPE html>\n` + raw.slice(headIdx);

  // Try <body tag
  const bodyIdx = raw.indexOf("<body");
  if (bodyIdx >= 0) return `<!DOCTYPE html>\n<html lang="ar">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>\n` + raw.slice(bodyIdx);

  // Last resort: return as-is
  return raw;
}

// ── Helper: Final HTML validation ───────────────────────────────────────────
function finalizeHtml(html: string): string {
  // Remove any markdown code fences
  let clean = html.replace(/^```html\s*/i, "").replace(/```\s*$/i, "").trim();

  // Remove any text before <!DOCTYPE
  const doctypeIdx = clean.indexOf("<!DOCTYPE");
  if (doctypeIdx > 0) clean = clean.slice(doctypeIdx);

  // If still no DOCTYPE, add it
  if (!clean.startsWith("<!DOCTYPE") && !clean.startsWith("<html")) {
    const htmlStart = clean.indexOf("<html");
    if (htmlStart >= 0) clean = clean.slice(htmlStart);
    else clean = `<!DOCTYPE html>\n${clean}`;
  }

  return clean;
}

// ── Scoring System endpoint ────────────────────────────────────────────────
qaRouter.post("/score", async (req, res) => {
  const { html, prompt, lang } = req.body;
  if (!html) return res.status(400).json({ error: "html required" });

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || "https://api.deepseek.com";

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `You are a professional website quality evaluator. Score this HTML website on these criteria (0-100):

HTML to evaluate:
${html.slice(0, 8000)}

Rate each criterion and return ONLY valid JSON:
{
  "design": <0-100>,
  "ux": <0-100>,
  "codeQuality": <0-100>,
  "accessibility": <0-100>,
  "performance": <0-100>,
  "seo": <0-100>,
  "responsive": <0-100>,
  "multiPage": <0-100>,
  "overall": <0-100>,
  "issues": ["issue1", "issue2", "issue3"],
  "passed": <true if all scores >= 85>
}`
        }]
      })
    });
    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const scores = jsonMatch ? JSON.parse(jsonMatch[0]) : { overall: 70, passed: false, issues: [] };
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Scoring failed", overall: 70, passed: false, issues: [] });
  }
});

// ── Critic Loop endpoint ────────────────────────────────────────────────────
qaRouter.post("/critic-loop", async (req, res) => {
  const { html, scores, prompt, lang } = req.body;
  if (!html || !scores) return res.status(400).json({ error: "html and scores required" });

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || "https://api.deepseek.com";

  // Build improvement instructions based on low scores
  const improvements: string[] = [];
  if (scores.design < 85) improvements.push("تحسين التصميم البصري — ألوان أكثر تناسقاً وتباين أفضل");
  if (scores.ux < 85) improvements.push("تحسين تجربة المستخدم — CTAs أوضح ومسار تنقل أفضل");
  if (scores.multiPage < 85) improvements.push("إضافة صفحات متعددة بـ Alpine.js SPA Router");
  if (scores.accessibility < 85) improvements.push("إضافة aria-labels وalt text وfocus styles");
  if (scores.responsive < 85) improvements.push("تحسين التجاوب مع الموبايل");
  if (scores.seo < 85) improvements.push("إضافة meta tags وOpen Graph وStructured Data");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        max_tokens: 16000,
        stream: true,
        messages: [{
          role: "user",
          content: `أنت خبير تحسين مواقع. الموقع التالي حصل على هذه الدرجات:
Design: ${scores.design}/100, UX: ${scores.ux}/100, Multi-page: ${scores.multiPage}/100
Accessibility: ${scores.accessibility}/100, Responsive: ${scores.responsive}/100, SEO: ${scores.seo}/100

المشاكل المكتشفة: ${scores.issues?.join(', ') || 'لا توجد'}

التحسينات المطلوبة:
${improvements.map((imp, i) => `${i+1}. ${imp}`).join('\n')}

الكود الحالي:
${html.slice(0, 10000)}

أعد كتابة الكود بالكامل مع تطبيق جميع التحسينات.
⚠️ أرجع HTML كاملاً يبدأ بـ <!DOCTYPE html> وينتهي بـ </body></html>`
        }]
      })
    });

    let fullContent = "";
    const reader = (response.body as any)?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const token = parsed.choices?.[0]?.delta?.content || "";
          if (token) {
            fullContent += token;
            res.write(`data: ${JSON.stringify({ type: "chunk", content: token })}\n\n`);
          }
        } catch (_e) { /* intentional */ }
      }
    }

    const cleanedHtml = fullContent.match(/```html\s*([\s\S]*?)```/i)?.[1] ||
      (fullContent.includes("<!DOCTYPE") ? fullContent.slice(fullContent.indexOf("<!DOCTYPE")) : fullContent);

    res.write(`data: ${JSON.stringify({ type: "done", improvedHtml: cleanedHtml })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: "Critic loop failed" })}\n\n`);
    res.end();
  }
});
