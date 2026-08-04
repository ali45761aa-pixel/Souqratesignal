// ============================================================
// Professional Design System Library v2.0
// Fixed: rgba() on hex vars, stronger themes, detailed instructions
// ============================================================

export const DESIGN_THEMES = {
  luxury: {
    name: "Luxury & Premium",
    palette: {
      bg: "#0A0A0B", surface: "#111113", surfaceHover: "#1A1A1F",
      border: "#2A2A35", primary: "#C9A84C", primaryHover: "#E0BC6A",
      accent: "#8B6914", text: "#F5F0E8", textMuted: "#9A9080",
      gradient: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
      glowColor: "201,168,76",
      primaryRgb: "201,168,76",
    },
    fonts: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap",
    borderRadius: "4px",
    shadows: "0 4px 24px rgba(0,0,0,0.4)",
    style: "Elegant, sophisticated, high-end. Thin borders, generous whitespace, gold accents.",
    keywords: ["luxury", "premium", "gold", "elegant", "high-end", "exclusive", "jewelry", "fashion", "hotel", "real estate", "عقار", "فاخر", "ذهب", "مجوهرات"],
  },
  tech: {
    name: "Tech & SaaS",
    palette: {
      bg: "#050508", surface: "#0D0D14", surfaceHover: "#141420",
      border: "#1E1E2E", primary: "#6366F1", primaryHover: "#818CF8",
      accent: "#8B5CF6", text: "#E2E8F0", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      glowColor: "99,102,241",
      primaryRgb: "99,102,241",
    },
    fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
    borderRadius: "8px",
    shadows: "0 4px 32px rgba(99,102,241,0.15)",
    style: "Clean, modern, data-driven. Purple/indigo palette, glassmorphism cards, sharp typography.",
    keywords: ["tech", "saas", "software", "app", "startup", "ai", "platform", "dashboard", "analytics", "cloud", "تقنية", "برمجة", "تطبيق", "ذكاء اصطناعي"],
  },
  minimal: {
    name: "Minimal & Clean",
    palette: {
      bg: "#FAFAFA", surface: "#FFFFFF", surfaceHover: "#F5F5F5",
      border: "#E5E7EB", primary: "#111827", primaryHover: "#374151",
      accent: "#6B7280", text: "#111827", textMuted: "#6B7280",
      gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
      glowColor: "17,24,39",
      primaryRgb: "17,24,39",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "6px",
    shadows: "0 1px 8px rgba(0,0,0,0.08)",
    style: "Ultra-clean, whitespace-focused, editorial. Black/white with subtle grays.",
    keywords: ["minimal", "clean", "portfolio", "blog", "writer", "consultant", "agency", "design studio", "بورتفوليو", "مدونة"],
  },
  bold: {
    name: "Bold & Creative",
    palette: {
      bg: "#0F0F0F", surface: "#1A1A1A", surfaceHover: "#252525",
      border: "#333333", primary: "#FF3366", primaryHover: "#FF6B8A",
      accent: "#FF6B35", text: "#FFFFFF", textMuted: "#999999",
      gradient: "linear-gradient(135deg, #FF3366 0%, #FF6B35 100%)",
      glowColor: "255,51,102",
      primaryRgb: "255,51,102",
    },
    fonts: { heading: "'Syne', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "0px",
    shadows: "0 8px 40px rgba(255,51,102,0.2)",
    style: "Bold, expressive, creative. Sharp edges, vibrant colors, large typography.",
    keywords: ["creative", "agency", "art", "music", "entertainment", "gaming", "youth", "bold", "fashion brand", "إبداع", "وكالة"],
  },
  nature: {
    name: "Nature & Organic",
    palette: {
      bg: "#F7F4EF", surface: "#FFFFFF", surfaceHover: "#F0EDE6",
      border: "#D4C9B5", primary: "#2D6A4F", primaryHover: "#40916C",
      accent: "#74C69D", text: "#1B1B1B", textMuted: "#6B6B5A",
      gradient: "linear-gradient(135deg, #2D6A4F 0%, #74C69D 100%)",
      glowColor: "45,106,79",
      primaryRgb: "45,106,79",
    },
    fonts: { heading: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "12px",
    shadows: "0 4px 20px rgba(45,106,79,0.1)",
    style: "Organic, warm, earthy. Green palette, rounded corners, natural textures.",
    keywords: ["nature", "organic", "eco", "food", "health", "wellness", "farm", "green", "sustainable", "restaurant", "طبيعي", "عضوي", "مطعم", "صحة"],
  },
  corporate: {
    name: "Corporate & Professional",
    palette: {
      bg: "#F8FAFC", surface: "#FFFFFF", surfaceHover: "#F1F5F9",
      border: "#E2E8F0", primary: "#1E40AF", primaryHover: "#2563EB",
      accent: "#0EA5E9", text: "#0F172A", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)",
      glowColor: "30,64,175",
      primaryRgb: "30,64,175",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "6px",
    shadows: "0 2px 16px rgba(0,0,0,0.08)",
    style: "Professional, trustworthy, structured. Blue palette, clean grid, formal typography.",
    keywords: ["corporate", "business", "law", "finance", "bank", "insurance", "consulting", "enterprise", "B2B", "شركة", "قانون", "مالية", "بنك"],
  },
  ecommerce: {
    name: "E-Commerce & Retail",
    palette: {
      bg: "#FFFFFF", surface: "#F9FAFB", surfaceHover: "#F3F4F6",
      border: "#E5E7EB", primary: "#DC2626", primaryHover: "#EF4444",
      accent: "#F59E0B", text: "#111827", textMuted: "#6B7280",
      gradient: "linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)",
      glowColor: "220,38,38",
      primaryRgb: "220,38,38",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "8px",
    shadows: "0 2px 12px rgba(0,0,0,0.08)",
    style: "Conversion-focused, product-centric. High contrast CTAs, product cards, trust badges.",
    keywords: ["shop", "store", "ecommerce", "product", "buy", "sell", "marketplace", "retail", "fashion store", "perfume", "متجر", "تسوق", "منتجات", "عطور"],
  },
  dark_elegant: {
    name: "Dark Elegant",
    palette: {
      bg: "#080B14", surface: "#0E1220", surfaceHover: "#141828",
      border: "#1E2535", primary: "#38BDF8", primaryHover: "#7DD3FC",
      accent: "#818CF8", text: "#F0F4FF", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
      glowColor: "56,189,248",
      primaryRgb: "56,189,248",
    },
    fonts: { heading: "'Outfit', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "10px",
    shadows: "0 8px 40px rgba(0,0,0,0.4)",
    style: "Dark, sophisticated, futuristic. Sky blue/indigo on deep dark, glassmorphism.",
    keywords: ["dark", "night", "cyber", "futuristic", "crypto", "web3", "nft", "gaming platform", "streaming", "كريبتو", "مستقبلي", "ألعاب"],
  },
};

export type ThemeKey = keyof typeof DESIGN_THEMES;

// Auto-detect best theme based on project description
export function detectTheme(prompt: string): ThemeKey {
  const lower = prompt.toLowerCase();
  for (const [key, theme] of Object.entries(DESIGN_THEMES)) {
    if (theme.keywords.some(kw => lower.includes(kw))) {
      return key as ThemeKey;
    }
  }
  return "tech"; // default
}

// Generate a complete CSS Design System — FIXED: uses rgb() values correctly
export function generateDesignSystemCSS(themeKey: ThemeKey): string {
  const t = DESIGN_THEMES[themeKey];
  const p = t.palette;
  return `
/* ═══════════════════════════════════════════════════
   PROFESSIONAL DESIGN SYSTEM — ${t.name}
   Generated by Nexus AI v2.0
═══════════════════════════════════════════════════ */
@import url('${t.googleFonts}');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: ${p.bg};
  --surface: ${p.surface};
  --surface-hover: ${p.surfaceHover};
  --border: ${p.border};
  --primary: ${p.primary};
  --primary-hover: ${p.primaryHover};
  --primary-rgb: ${p.primaryRgb};
  --accent: ${p.accent};
  --text: ${p.text};
  --text-muted: ${p.textMuted};
  --gradient: ${p.gradient};
  --glow: 0 0 40px rgba(${p.glowColor}, 0.2);
  --glow-strong: 0 0 80px rgba(${p.glowColor}, 0.35);
  --radius: ${t.borderRadius};
  --radius-lg: calc(${t.borderRadius} * 2.5);
  --shadow: ${t.shadows};
  --font-heading: ${t.fonts.heading};
  --font-body: ${t.fonts.body};
  --font-mono: ${t.fonts.mono};
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 16px; line-height: 1.6; overflow-x: hidden; }

/* ── Typography ── */
h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); font-weight: 700; line-height: 1.15; color: var(--text); }
h1 { font-size: clamp(2.8rem, 7vw, 5.5rem); letter-spacing: -0.04em; }
h2 { font-size: clamp(2rem, 4.5vw, 3.2rem); letter-spacing: -0.025em; }
h3 { font-size: clamp(1.3rem, 2.5vw, 1.8rem); letter-spacing: -0.01em; }
h4 { font-size: 1.2rem; }
p { color: var(--text-muted); line-height: 1.75; }
a { color: var(--primary); text-decoration: none; transition: var(--transition-fast); }
a:hover { color: var(--primary-hover); }

/* ── Gradient Text ── */
.gradient-text {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Layout ── */
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
.container-sm { max-width: 800px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
.section { padding: clamp(5rem, 10vw, 9rem) 0; }
.section-sm { padding: clamp(3rem, 6vw, 5rem) 0; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.75rem; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.flex { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-col { display: flex; flex-direction: column; }
.gap-1 { gap: 0.5rem; } .gap-2 { gap: 1rem; } .gap-3 { gap: 1.5rem; } .gap-4 { gap: 2rem; } .gap-6 { gap: 3rem; }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.font-mono { font-family: var(--font-mono); }

/* ── Cards ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  transition: var(--transition);
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}
.card:hover {
  background: var(--surface-hover);
  border-color: rgba(var(--primary-rgb), 0.4);
  transform: translateY(-3px);
  box-shadow: var(--glow);
}
.card-glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius);
  padding: 2rem;
  transition: var(--transition);
}
.card-glass:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(var(--primary-rgb), 0.3);
  transform: translateY(-2px);
}

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.8rem 2rem; border-radius: var(--radius);
  font-family: var(--font-body); font-size: 0.95rem; font-weight: 600;
  cursor: pointer; border: none; transition: var(--transition);
  text-decoration: none; white-space: nowrap; letter-spacing: 0.01em;
  position: relative; overflow: hidden;
}
.btn::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,0.1);
  opacity: 0; transition: var(--transition-fast);
}
.btn:hover::after { opacity: 1; }
.btn:active { transform: scale(0.97); }
.btn-primary {
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.35);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.5);
  filter: brightness(1.08);
}
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1.5px solid var(--border);
}
.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: rgba(var(--primary-rgb), 0.5);
  color: var(--primary);
}
.btn-ghost {
  background: rgba(var(--primary-rgb), 0.08);
  color: var(--primary);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
}
.btn-ghost:hover { background: rgba(var(--primary-rgb), 0.15); }
.btn-lg { padding: 1rem 2.5rem; font-size: 1.05rem; }
.btn-sm { padding: 0.5rem 1.25rem; font-size: 0.85rem; }
.btn-icon { padding: 0.75rem; border-radius: 50%; }

/* ── Navigation ── */
nav {
  position: sticky; top: 0; z-index: 100;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  transition: var(--transition);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
.nav-logo {
  font-family: var(--font-heading);
  font-size: 1.4rem; font-weight: 800;
  color: var(--text);
  text-decoration: none;
  flex-shrink: 0;
}
.nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
.nav-links a { color: var(--text-muted); font-weight: 500; font-size: 0.9rem; transition: var(--transition-fast); }
.nav-links a:hover { color: var(--text); }
.nav-actions { display: flex; align-items: center; gap: 0.75rem; }
.nav-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--text); padding: 0.5rem; }

/* ── Hero ── */
.hero {
  padding: clamp(6rem, 14vw, 12rem) 0 clamp(5rem, 10vw, 9rem);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 80vw;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(var(--primary-rgb), 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.25);
  color: var(--primary);
  padding: 0.4rem 1.1rem;
  border-radius: 100px;
  font-size: 0.82rem; font-weight: 600;
  margin-bottom: 1.75rem;
  letter-spacing: 0.02em;
}
.hero-badge::before { content: '●'; font-size: 0.6rem; animation: pulse 2s infinite; }
.hero-title { margin-bottom: 1.5rem; }
.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-muted);
  max-width: 580px;
  margin: 0 auto 2.75rem;
  line-height: 1.8;
}
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
.hero-image {
  margin-top: 4rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--glow-strong), 0 40px 80px rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  position: relative;
}
.hero-image img { width: 100%; display: block; }

/* ── Section Headers ── */
.section-header { text-align: center; margin-bottom: 4rem; }
.section-label {
  display: inline-block;
  font-size: 0.8rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 0.75rem;
}
.section-title { margin-bottom: 1rem; }
.section-subtitle { color: var(--text-muted); max-width: 560px; margin: 0 auto; font-size: 1.05rem; }

/* ── Feature Cards ── */
.feature-icon {
  width: 52px; height: 52px;
  border-radius: var(--radius);
  background: rgba(var(--primary-rgb), 0.12);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin-bottom: 1.25rem;
  transition: var(--transition);
}
.card:hover .feature-icon {
  background: var(--gradient);
  box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.3);
  transform: scale(1.05);
}
.feature-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--text); }
.feature-desc { font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 2rem; }
.stat { text-align: center; padding: 2rem 1rem; }
.stat-number {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.stat-label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }

/* ── Testimonials ── */
.testimonial-card { padding: 2.5rem; }
.testimonial-text { font-size: 1rem; color: var(--text); line-height: 1.8; margin-bottom: 1.5rem; font-style: italic; }
.testimonial-text::before { content: '"'; font-size: 3rem; color: var(--primary); line-height: 0; vertical-align: -0.5rem; margin-right: 0.25rem; }
.testimonial-author { display: flex; align-items: center; gap: 0.75rem; }
.testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(var(--primary-rgb), 0.3); }
.testimonial-name { font-weight: 700; font-size: 0.9rem; color: var(--text); }
.testimonial-role { font-size: 0.8rem; color: var(--text-muted); }
.stars { color: #F59E0B; font-size: 0.85rem; margin-bottom: 1rem; letter-spacing: 0.1em; }

/* ── Pricing ── */
.pricing-card { text-align: center; padding: 2.5rem 2rem; }
.pricing-card.featured { border-color: rgba(var(--primary-rgb), 0.5); box-shadow: var(--glow); }
.pricing-badge { display: inline-block; background: var(--gradient); color: #fff; padding: 0.3rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; margin-bottom: 1.5rem; }
.pricing-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.pricing-price { font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 0.25rem; }
.pricing-price span { font-size: 1.2rem; font-weight: 500; color: var(--text-muted); vertical-align: super; }
.pricing-period { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem; }
.pricing-features { list-style: none; text-align: start; margin-bottom: 2rem; }
.pricing-features li { padding: 0.6rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.75rem; }
.pricing-features li::before { content: '✓'; color: var(--primary); font-weight: 700; flex-shrink: 0; }

/* ── Form ── */
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text); font-size: 0.875rem; }
.form-input {
  width: 100%; padding: 0.8rem 1.1rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  color: var(--text); font-family: var(--font-body); font-size: 0.95rem;
  transition: var(--transition-fast); outline: none;
}
.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.12);
  background: var(--surface-hover);
}
.form-input::placeholder { color: var(--text-muted); opacity: 0.6; }
textarea.form-input { resize: vertical; min-height: 120px; }

/* ── Badges & Tags ── */
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.78rem; font-weight: 600; }
.badge-primary { background: rgba(var(--primary-rgb), 0.12); color: var(--primary); border: 1px solid rgba(var(--primary-rgb), 0.2); }
.badge-success { background: rgba(34,197,94,0.12); color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }
.badge-warning { background: rgba(245,158,11,0.12); color: #F59E0B; border: 1px solid rgba(245,158,11,0.2); }
.badge-error { background: rgba(239,68,68,0.12); color: #EF4444; border: 1px solid rgba(239,68,68,0.2); }

/* ── Divider ── */
.divider { height: 1px; background: var(--border); margin: 3rem 0; }

/* ── Footer ── */
footer {
  border-top: 1px solid var(--border);
  padding: 4rem 0 2rem;
  background: var(--surface);
}
.footer-grid { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 3rem; margin-bottom: 3rem; }
.footer-brand p { margin-top: 0.75rem; font-size: 0.875rem; max-width: 280px; line-height: 1.7; }
.footer-col h4 { color: var(--text); font-size: 0.875rem; font-weight: 700; margin-bottom: 1.25rem; letter-spacing: 0.04em; text-transform: uppercase; }
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
.footer-col a { color: var(--text-muted); font-size: 0.875rem; transition: var(--transition-fast); }
.footer-col a:hover { color: var(--text); }
.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.82rem; color: var(--text-muted);
}
.social-links { display: flex; gap: 0.75rem; }
.social-link {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-size: 0.9rem;
  transition: var(--transition-fast);
  text-decoration: none;
}
.social-link:hover { background: rgba(var(--primary-rgb), 0.12); border-color: rgba(var(--primary-rgb), 0.3); color: var(--primary); }

/* ── Animations ── */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fadeInRight { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-fade-in-up { animation: fadeInUp 0.65s cubic-bezier(0.4,0,0.2,1) both; }
.animate-fade-in { animation: fadeIn 0.5s ease both; }
.animate-fade-in-left { animation: fadeInLeft 0.65s cubic-bezier(0.4,0,0.2,1) both; }
.animate-fade-in-right { animation: fadeInRight 0.65s cubic-bezier(0.4,0,0.2,1) both; }
.animate-float { animation: float 5s ease-in-out infinite; }
.animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.4,0,0.2,1) both; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }

/* ── Scroll Reveal (JS-driven) ── */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.4,0,0.2,1); }
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open { display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--surface); border-bottom: 1px solid var(--border); padding: 1.5rem; gap: 1rem; }
  .nav-toggle { display: flex; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
  .hero-actions { flex-direction: column; align-items: stretch; }
  .hero-actions .btn { text-align: center; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary); }

/* ── Selection ── */
::selection { background: rgba(var(--primary-rgb), 0.25); color: var(--text); }
`;
}

// Get detailed theme prompt instructions for the frontend agent
export function getDesignInstructions(themeKey: ThemeKey, prompt: string): string {
  const t = DESIGN_THEMES[themeKey];
  const p = t.palette;
  return `
═══════════════════════════════════════════════════
DESIGN SYSTEM: ${t.name.toUpperCase()}
Style: ${t.style}
═══════════════════════════════════════════════════

EXACT COLOR VALUES (use these in inline styles when needed):
- Background: ${p.bg}
- Surface: ${p.surface}
- Primary: ${p.primary}
- Text: ${p.text}
- Text Muted: ${p.textMuted}
- Gradient: ${p.gradient}
- Border Radius: ${t.borderRadius}
- Heading Font: ${t.fonts.heading}
- Body Font: ${t.fonts.body}

CSS CLASSES AVAILABLE (use them):
- .gradient-text → gradient colored text
- .card → styled card with hover effects
- .card-glass → glassmorphism card
- .btn-primary → gradient button with glow
- .btn-secondary → outline button
- .btn-ghost → subtle button
- .hero → hero section with radial glow background
- .hero-badge → animated badge with pulse dot
- .section-header → centered section header
- .section-label → uppercase label above title
- .feature-icon → icon container with hover gradient
- .stat-number → gradient large number
- .testimonial-card → testimonial with quote styling
- .pricing-card → pricing card (add .featured for highlighted)
- .reveal → scroll-reveal animation (needs JS observer)
- .animate-fade-in-up → entrance animation
- .delay-1 through .delay-6 → staggered delays

MANDATORY JAVASCRIPT TO INCLUDE:
\`\`\`javascript
// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => { if (el.isIntersecting) { el.target.classList.add('visible'); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Animated counters
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target.toLocaleString() + (el.dataset.suffix || ''); clearInterval(timer); }
    else { el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || ''); }
  }, 16);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => { if (el.isIntersecting) { animateCounter(el.target); counterObserver.unobserve(el.target); } });
});
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// Mobile menu
const toggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (toggle) toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
\`\`\`

PROJECT: ${prompt}
`;
}

