// ── Simple In-Memory Cache ────────────────────────────────────────────────────
// Caches LLM responses and templates to reduce API calls and latency

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  constructor(ttlSeconds: number = 300, maxSize: number = 100) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest entry if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

// ── Cache instances ───────────────────────────────────────────────────────────
// Plan cache: 10 minutes (same prompt → same plan)
export const planCache = new SimpleCache<string>(600, 50);

// Design system cache: 1 hour (theme detection is deterministic)
export const designCache = new SimpleCache<string>(3600, 20);

// Template cache: 30 minutes
export const templateCache = new SimpleCache<string>(1800, 30);

// Helper: generate a cache key from prompt + agentId
export function makeCacheKey(agentId: string, prompt: string, lang: string): string {
  // Use first 100 chars of prompt as key (normalize whitespace)
  const normalizedPrompt = prompt.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 100);
  return `${agentId}:${lang}:${normalizedPrompt}`;
}
