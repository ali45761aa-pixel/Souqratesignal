// ============================================================
// Professional Design System Library
// Used by the brand & designer agents to produce world-class output
// ============================================================

export const DESIGN_THEMES = {
  luxury: {
    name: "Luxury & Premium",
    palette: {
      bg: "#0A0A0B", surface: "#111113", surfaceHover: "#1A1A1F",
      border: "#2A2A35", primary: "#C9A84C", primaryHover: "#E0BC6A",
      accent: "#8B6914", text: "#F5F0E8", textMuted: "#9A9080",
      gradient: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
      glow: "0 0 40px rgba(201,168,76,0.15)",
    },
    fonts: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap",
    borderRadius: "4px",
    shadows: "0 4px 24px rgba(0,0,0,0.4)",
    style: "Elegant, sophisticated, high-end. Thin borders, generous whitespace, gold accents.",
    keywords: ["luxury", "premium", "gold", "elegant", "high-end", "exclusive", "jewelry", "fashion", "hotel", "real estate"],
  },
  tech: {
    name: "Tech & SaaS",
    palette: {
      bg: "#050508", surface: "#0D0D14", surfaceHover: "#141420",
      border: "#1E1E2E", primary: "#6366F1", primaryHover: "#818CF8",
      accent: "#8B5CF6", text: "#E2E8F0", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      glow: "0 0 60px rgba(99,102,241,0.2)",
    },
    fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
    borderRadius: "8px",
    shadows: "0 4px 32px rgba(99,102,241,0.15)",
    style: "Clean, modern, data-driven. Purple/indigo palette, glassmorphism cards, sharp typography.",
    keywords: ["tech", "saas", "software", "app", "startup", "ai", "platform", "dashboard", "analytics", "cloud"],
  },
  minimal: {
    name: "Minimal & Clean",
    palette: {
      bg: "#FAFAFA", surface: "#FFFFFF", surfaceHover: "#F5F5F5",
      border: "#E5E7EB", primary: "#111827", primaryHover: "#374151",
      accent: "#6B7280", text: "#111827", textMuted: "#6B7280",
      gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
      glow: "0 4px 24px rgba(0,0,0,0.08)",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "6px",
    shadows: "0 1px 8px rgba(0,0,0,0.08)",
    style: "Ultra-clean, whitespace-focused, editorial. Black/white with subtle grays.",
    keywords: ["minimal", "clean", "portfolio", "blog", "writer", "consultant", "agency", "design studio"],
  },
  bold: {
    name: "Bold & Creative",
    palette: {
      bg: "#0F0F0F", surface: "#1A1A1A", surfaceHover: "#252525",
      border: "#333333", primary: "#FF3366", primaryHover: "#FF6B8A",
      accent: "#FF6B35", text: "#FFFFFF", textMuted: "#999999",
      gradient: "linear-gradient(135deg, #FF3366 0%, #FF6B35 100%)",
      glow: "0 0 60px rgba(255,51,102,0.25)",
    },
    fonts: { heading: "'Syne', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "0px",
    shadows: "0 8px 40px rgba(255,51,102,0.2)",
    style: "Bold, expressive, creative. Sharp edges, vibrant colors, large typography.",
    keywords: ["creative", "agency", "art", "music", "entertainment", "gaming", "youth", "bold", "fashion brand"],
  },
  nature: {
    name: "Nature & Organic",
    palette: {
      bg: "#F7F4EF", surface: "#FFFFFF", surfaceHover: "#F0EDE6",
      border: "#D4C9B5", primary: "#2D6A4F", primaryHover: "#40916C",
      accent: "#74C69D", text: "#1B1B1B", textMuted: "#6B6B5A",
      gradient: "linear-gradient(135deg, #2D6A4F 0%, #74C69D 100%)",
      glow: "0 4px 24px rgba(45,106,79,0.15)",
    },
    fonts: { heading: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "12px",
    shadows: "0 4px 20px rgba(45,106,79,0.1)",
    style: "Organic, warm, earthy. Green palette, rounded corners, natural textures.",
    keywords: ["nature", "organic", "eco", "food", "health", "wellness", "farm", "green", "sustainable", "restaurant"],
  },
  corporate: {
    name: "Corporate & Professional",
    palette: {
      bg: "#F8FAFC", surface: "#FFFFFF", surfaceHover: "#F1F5F9",
      border: "#E2E8F0", primary: "#1E40AF", primaryHover: "#2563EB",
      accent: "#0EA5E9", text: "#0F172A", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)",
      glow: "0 4px 24px rgba(30,64,175,0.12)",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "6px",
    shadows: "0 2px 16px rgba(0,0,0,0.08)",
    style: "Professional, trustworthy, structured. Blue palette, clean grid, formal typography.",
    keywords: ["corporate", "business", "law", "finance", "bank", "insurance", "consulting", "enterprise", "B2B"],
  },
  ecommerce: {
    name: "E-Commerce & Retail",
    palette: {
      bg: "#FFFFFF", surface: "#F9FAFB", surfaceHover: "#F3F4F6",
      border: "#E5E7EB", primary: "#DC2626", primaryHover: "#EF4444",
      accent: "#F59E0B", text: "#111827", textMuted: "#6B7280",
      gradient: "linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)",
      glow: "0 4px 24px rgba(220,38,38,0.12)",
    },
    fonts: { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "8px",
    shadows: "0 2px 12px rgba(0,0,0,0.08)",
    style: "Conversion-focused, product-centric. High contrast CTAs, product cards, trust badges.",
    keywords: ["shop", "store", "ecommerce", "product", "buy", "sell", "marketplace", "retail", "fashion store", "perfume"],
  },
  dark_elegant: {
    name: "Dark Elegant",
    palette: {
      bg: "#080B14", surface: "#0E1220", surfaceHover: "#141828",
      border: "#1E2535", primary: "#38BDF8", primaryHover: "#7DD3FC",
      accent: "#818CF8", text: "#F0F4FF", textMuted: "#64748B",
      gradient: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
      glow: "0 0 80px rgba(56,189,248,0.15)",
    },
    fonts: { heading: "'Outfit', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    googleFonts: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    borderRadius: "10px",
    shadows: "0 8px 40px rgba(0,0,0,0.4)",
    style: "Dark, sophisticated, futuristic. Sky blue/indigo on deep dark, glassmorphism.",
    keywords: ["dark", "night", "cyber", "futuristic", "crypto", "web3", "nft", "gaming platform", "streaming"],
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

// Generate a complete CSS Design System for any theme
export function generateDesignSystemCSS(themeKey: ThemeKey): string {
  const t = DESIGN_THEMES[themeKey];
  const p = t.palette;
  return `
/* ═══════════════════════════════════════════════════
   PROFESSIONAL DESIGN SYSTEM — ${t.name}
   Generated by Nexus AI
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
  --accent: ${p.accent};
  --text: ${p.text};
  --text-muted: ${p.textMuted};
  --gradient: ${p.gradient};
  --glow: ${p.glow};
  --radius: ${t.borderRadius};
  --shadow: ${t.shadows};
  --font-heading: ${t.fonts.heading};
  --font-body: ${t.fonts.body};
  --font-mono: ${t.fonts.mono};
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 16px; line-height: 1.6; }

/* Typography */
h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); font-weight: 700; line-height: 1.2; color: var(--text); }
h1 { font-size: clamp(2.5rem, 6vw, 5rem); letter-spacing: -0.03em; }
h2 { font-size: clamp(1.8rem, 4vw, 3rem); letter-spacing: -0.02em; }
h3 { font-size: clamp(1.3rem, 2.5vw, 1.8rem); }
p { color: var(--text-muted); line-height: 1.7; }
a { color: var(--primary); text-decoration: none; transition: var(--transition-fast); }
a:hover { color: var(--primary-hover); }

/* Layout */
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1rem, 4vw, 2rem); }
.section { padding: clamp(4rem, 8vw, 8rem) 0; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.flex { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-col { display: flex; flex-direction: column; }
.gap-1 { gap: 0.5rem; } .gap-2 { gap: 1rem; } .gap-3 { gap: 1.5rem; } .gap-4 { gap: 2rem; }
.text-center { text-align: center; }

/* Cards */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  transition: var(--transition);
  box-shadow: var(--shadow);
}
.card:hover { background: var(--surface-hover); border-color: var(--primary); transform: translateY(-2px); box-shadow: var(--glow); }
.card-glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius);
  padding: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.75rem; border-radius: var(--radius);
  font-family: var(--font-body); font-size: 0.95rem; font-weight: 600;
  cursor: pointer; border: none; transition: var(--transition);
  text-decoration: none; white-space: nowrap;
}
.btn-primary { background: var(--gradient); color: #fff; box-shadow: var(--glow); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: var(--glow), 0 8px 30px rgba(0,0,0,0.3); filter: brightness(1.1); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--surface-hover); border-color: var(--primary); color: var(--primary); }
.btn-lg { padding: 1rem 2.5rem; font-size: 1.05rem; }
.btn-sm { padding: 0.5rem 1.25rem; font-size: 0.85rem; }

/* Navigation */
nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(var(--bg), 0.8); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; }
.nav-logo { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: var(--text); }
.nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
.nav-links a { color: var(--text-muted); font-weight: 500; transition: var(--transition-fast); }
.nav-links a:hover { color: var(--text); }

/* Hero */
.hero { padding: clamp(5rem, 12vw, 10rem) 0; text-align: center; position: relative; overflow: hidden; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(var(--primary), 0.1); border: 1px solid rgba(var(--primary), 0.3);
  color: var(--primary); padding: 0.4rem 1rem; border-radius: 100px;
  font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem;
}
.hero-title { margin-bottom: 1.5rem; }
.hero-title .gradient-text { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-subtitle { font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-muted); max-width: 600px; margin: 0 auto 2.5rem; }
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }

/* Features */
.feature-icon {
  width: 48px; height: 48px; border-radius: var(--radius);
  background: var(--gradient); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 1rem; box-shadow: var(--glow);
}

/* Stats */
.stat { text-align: center; }
.stat-number { font-family: var(--font-heading); font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem; }

/* Form */
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--text); font-size: 0.9rem; }
.form-input {
  width: 100%; padding: 0.75rem 1rem; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); font-family: var(--font-body); font-size: 0.95rem;
  transition: var(--transition-fast); outline: none;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary), 0.1); }
.form-input::placeholder { color: var(--text-muted); }

/* Divider */
.divider { height: 1px; background: var(--border); margin: 3rem 0; }
.divider-text { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.85rem; }
.divider-text::before, .divider-text::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* Badge */
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.8rem; font-weight: 600; }
.badge-primary { background: rgba(var(--primary), 0.15); color: var(--primary); }
.badge-success { background: rgba(34,197,94,0.15); color: #22C55E; }
.badge-warning { background: rgba(245,158,11,0.15); color: #F59E0B; }

/* Footer */
footer { border-top: 1px solid var(--border); padding: 3rem 0; color: var(--text-muted); }
.footer-grid { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 3rem; }
.footer-brand p { margin-top: 0.75rem; font-size: 0.9rem; max-width: 280px; }
.footer-links h4 { color: var(--text); font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; }
.footer-links ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.footer-links a { color: var(--text-muted); font-size: 0.9rem; transition: var(--transition-fast); }
.footer-links a:hover { color: var(--text); }
.footer-bottom { border-top: 1px solid var(--border); margin-top: 3rem; padding-top: 1.5rem; display: flex; justify-content: space-between; font-size: 0.85rem; }

/* Animations */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) both; }
.animate-fade-in { animation: fadeIn 0.5s ease both; }
.animate-float { animation: float 4s ease-in-out infinite; }
.delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; }

/* Responsive */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
  .hero-actions { flex-direction: column; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary); }

/* Selection */
::selection { background: var(--primary); color: #fff; }
`;
}

// Get theme prompt instructions for the designer agent
export function getDesignInstructions(themeKey: ThemeKey, prompt: string): string {
  const t = DESIGN_THEMES[themeKey];
  const p = t.palette;
  return `
DESIGN SYSTEM: ${t.name}
Style: ${t.style}

MANDATORY CSS VARIABLES (use these EXACTLY):
- Background: ${p.bg}
- Surface: ${p.surface}
- Primary: ${p.primary}
- Text: ${p.text}
- Text Muted: ${p.textMuted}
- Gradient: ${p.gradient}
- Border Radius: ${t.borderRadius}
- Heading Font: ${t.fonts.heading}
- Body Font: ${t.fonts.body}

DESIGN RULES:
1. Use the provided CSS Design System classes (card, btn-primary, hero, etc.)
2. Every section must have proper spacing (section class)
3. Use gradient-text for hero titles
4. Add animate-fade-in-up to all major elements
5. Hero section must have a badge, large title, subtitle, and 2 CTA buttons
6. Include a stats section with 3-4 impressive numbers
7. Feature cards must use the card class with feature-icon
8. Footer must be complete with links and copyright
9. Navigation must be sticky with backdrop-filter
10. All images use Unsplash: <img src="https://images.unsplash.com/photo-[ID]?w=800&q=80" alt="...">
11. Mobile responsive is MANDATORY
12. RTL support: add dir="rtl" if Arabic content

PROJECT: ${prompt}
`;
}
