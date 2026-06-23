/**
 * seed.ts — Deterministic pseudo-random data generator.
 *
 * Uses a Linear Congruential Generator (LCG) seeded by a number.
 * This means ALL demo data is generated locally — no external API calls,
 * no network failures, no rate limits, no CORS issues.
 *
 * Key insight for the rendering demos:
 *   - SSR seeds with Math.floor(Date.now() / 30_000) → changes every 30s, proving freshness
 *   - SSG seeds with a build-time constant → identical across all requests, proving staleness
 *   - ISR seeds with Math.floor(Date.now() / 60_000) → changes each cache miss
 */

// ── LCG Core ────────────────────────────────────────────────────────────────

class RNG {
  private s: number;

  constructor(seed: number) {
    this.s = (seed | 0) >>> 0;
    // Warm up to avoid poor initial distribution
    for (let i = 0; i < 8; i++) this.next();
  }

  next(): number {
    this.s = (Math.imul(1_664_525, this.s) + 1_013_904_223) >>> 0;
    return this.s / 4_294_967_296;
  }

  int(lo: number, hi: number): number {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  hex(len: number): string {
    const chars = "0123456789abcdef";
    return Array.from({ length: len }, () => chars[Math.floor(this.next() * chars.length)]).join(
      "",
    );
  }

  bool(p = 0.5): boolean {
    return this.next() < p;
  }

  float(lo: number, hi: number, decimals = 2): number {
    return parseFloat((lo + this.next() * (hi - lo)).toFixed(decimals));
  }
}

// ── Seed Sources ─────────────────────────────────────────────────────────────

/** Rotates every 30 seconds — proves SSR always delivers fresh data */
export const liveSeed = (): number => Math.floor(Date.now() / 30_000);

/** Rotates every 60 seconds — proves ISR cache misses trigger fresh data */
export const isrSeed = (): number => Math.floor(Date.now() / 60_000);

// ── Data Constants ────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Drew",
  "Jamie",
  "Avery",
  "Quinn",
  "Blake",
  "Charlie",
  "Skyler",
] as const;

const LAST_NAMES = [
  "Chen",
  "Rivera",
  "Lee",
  "Kim",
  "Singh",
  "Patel",
  "Johnson",
  "Williams",
  "Martinez",
  "Davis",
  "Garcia",
  "Rodriguez",
  "Brown",
  "Wilson",
] as const;

const DOMAINS = [
  "acme.io",
  "edgelabs.co",
  "cloudy.ai",
  "systems.io",
  "deploy.app",
  "runtime.dev",
  "stack.cloud",
  "infra.sh",
] as const;

const CITIES = [
  "San Francisco",
  "New York",
  "London",
  "Tokyo",
  "Berlin",
  "Singapore",
  "Sydney",
  "Amsterdam",
  "Toronto",
  "Seoul",
  "Bangalore",
  "Dublin",
  "São Paulo",
  "Tel Aviv",
] as const;

const ROLES = [
  "Senior Engineer",
  "Platform Lead",
  "Staff SWE",
  "Tech Lead",
  "Principal Architect",
  "SRE Lead",
  "DevOps Engineer",
  "Infrastructure Engineer",
  "Full-Stack Engineer",
] as const;

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#14b8a6",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
] as const;

const POST_TITLES = [
  "Deploying to the Global Edge at Scale",
  "Cache Invalidation: The Hard Parts",
  "Streaming SSR in Production",
  "Zero-Downtime Database Migrations",
  "Observability at the Edge",
  "Rate Limiting with Cloudflare Workers",
  "Building Resilient Distributed Systems",
  "WebSockets on Serverless Infrastructure",
  "Distributed Tracing for Edge Functions",
  "Optimizing Cold Start Performance",
  "TypeScript at the Edge: Patterns & Pitfalls",
  "Monorepo Architecture for Platform Teams",
] as const;

const POST_TAGS = [
  "edge",
  "performance",
  "caching",
  "devops",
  "architecture",
  "cloudflare",
  "workers",
  "database",
  "typescript",
  "observability",
] as const;

const PRODUCT_NAMES = [
  "Edge Cache Pro",
  "Worker Analytics Suite",
  "KV Storage Manager",
  "D1 Query Builder",
  "Stream Processor 3000",
  "DDoS Shield Enterprise",
  "AI Gateway Plus",
  "R2 Object Browser",
  "Realtime Events Hub",
  "Queue Manager",
] as const;

const PRODUCT_CATS = [
  "Infrastructure",
  "Analytics",
  "Storage",
  "AI/ML",
  "Security",
  "Developer Tools",
  "Networking",
] as const;

const ACTIONS = [
  "deployed",
  "scaled",
  "rolled back",
  "monitored",
  "audited",
  "patched",
  "optimized",
  "migrated",
  "provisioned",
  "archived",
  "restarted",
  "backed up",
] as const;

const TARGETS = [
  "production cluster",
  "edge workers",
  "KV namespace",
  "D1 database",
  "R2 bucket",
  "AI binding",
  "DNS zone",
  "load balancer",
  "WAF rules",
  "SSL certificate",
  "Durable Object",
  "Queues consumer",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  avatarColor: string;
  initials: string;
  joinedDate: string;
};

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  views: number;
  tags: string[];
  ts: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
};

export type Analytics = {
  views: number;
  visitors: number;
  avgSession: number;
  bounceRate: number;
  conversion: number;
  rpm: number;
};

export type Activity = {
  id: string;
  action: string;
  target: string;
  actor: string;
  ts: string;
};

// ── Generators ────────────────────────────────────────────────────────────────

export function makeUser(seed: number): User {
  const r = new RNG(seed);
  const first = r.pick(FIRST_NAMES);
  const last = r.pick(LAST_NAMES);
  const domain = r.pick(DOMAINS);
  const id = r.hex(8);
  return {
    id,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
    role: r.pick(ROLES),
    city: r.pick(CITIES),
    avatarColor: r.pick(AVATAR_COLORS),
    initials: `${first[0]}${last[0]}`,
    joinedDate: new Date(Date.now() - r.int(30, 730) * 86_400_000).toISOString().slice(0, 10),
  };
}

export function makePosts(seed: number, count = 6): Post[] {
  const r = new RNG(seed ^ 0xdeadbeef);
  return Array.from({ length: count }, (_, i) => {
    const title = r.pick(POST_TITLES);
    const tag1 = r.pick(POST_TAGS);
    const tag2 = r.pick(POST_TAGS);
    return {
      id: r.hex(6),
      title,
      excerpt: `An in-depth exploration of ${title.toLowerCase()}, covering real-world patterns and lessons learned running at global edge scale.`,
      author: makeUser(seed + i * 17).name,
      views: r.int(500, 24_000),
      tags: [...new Set([tag1, tag2])],
      ts: new Date(Date.now() - r.int(1, 168) * 3_600_000).toISOString(),
    };
  });
}

export function makeProducts(seed: number, count = 8): Product[] {
  const r = new RNG(seed ^ 0xcafebabe);
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
    price: r.int(9, 299) + 0.99,
    category: r.pick(PRODUCT_CATS),
    inStock: r.bool(0.75),
    rating: r.float(3.5, 5.0, 1),
    reviews: r.int(12, 850),
  }));
}

export function makeAnalytics(seed: number): Analytics {
  const r = new RNG(seed ^ 0xabcdef12);
  return {
    views: r.int(8_000, 65_000),
    visitors: r.int(2_000, 20_000),
    avgSession: r.int(80, 320),
    bounceRate: r.float(0.15, 0.45),
    conversion: r.float(0.02, 0.08),
    rpm: r.int(40, 3_200),
  };
}

export function makeActivities(seed: number, count = 6): Activity[] {
  const r = new RNG(seed ^ 0x12345678);
  return Array.from({ length: count }, (_, i) => {
    const user = makeUser(seed + i * 7);
    return {
      id: r.hex(6),
      action: r.pick(ACTIONS),
      target: r.pick(TARGETS),
      actor: user.name,
      ts: new Date(Date.now() - r.int(i * 4 + 1, i * 90 + 30) * 60_000).toISOString(),
    };
  });
}

/** Async wrapper with artificial I/O delay for streaming/SSR demos */
export async function fetchWithDelay<T>(data: T, delayMs: number): Promise<T> {
  if (delayMs > 0) {
    await new Promise<void>((r) => setTimeout(r, delayMs));
  }
  return data;
}
