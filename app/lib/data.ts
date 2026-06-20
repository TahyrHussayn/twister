const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
};

export type ActivityItem = {
  id: string;
  action: string;
  target: string;
  timestamp: string;
};

export type Recommendation = {
  id: string;
  title: string;
  category: string;
  score: number;
};

export type Analytics = {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  category: string;
};

const PROFILE: UserProfile = {
  id: "usr_1",
  name: "Ada Lovelace",
  email: "ada@edgecompute.dev",
  avatar: "👩‍💻",
  joinedAt: new Date().toISOString(),
};

const ACTIVITIES: ActivityItem[] = [
  { id: "a1", action: "deployed", target: "api-gateway", timestamp: new Date().toISOString() },
  {
    id: "a2",
    action: "rolled back",
    target: "payment-service",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "a3",
    action: "scaled",
    target: "worker-pool",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "a4",
    action: "configured",
    target: "cdn-cache",
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "a5",
    action: "monitored",
    target: "db-cluster",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  { id: "r1", title: "Edge Computing Patterns", category: "Architecture", score: 0.98 },
  { id: "r2", title: "Streaming SSR Deep Dive", category: "Performance", score: 0.95 },
  { id: "r3", title: "Cache-First Strategies", category: "Infrastructure", score: 0.92 },
  { id: "r4", title: "Partial Prerendering Guide", category: "Rendering", score: 0.89 },
];

const ANALYTICS: Analytics = {
  pageViews: 12847,
  uniqueVisitors: 4321,
  avgSessionDuration: 187,
  bounceRate: 0.23,
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Edge Worker Pro", price: 49, inStock: true, category: "Compute" },
  { id: "p2", name: "Global Cache Plus", price: 29, inStock: true, category: "CDN" },
  { id: "p3", name: "Durable Storage", price: 99, inStock: false, category: "Storage" },
  { id: "p4", name: "Realtime Sync", price: 79, inStock: true, category: "Data" },
  { id: "p5", name: "Analytics Suite", price: 149, inStock: true, category: "Observability" },
];

export async function fetchUserProfile(delay = 400): Promise<UserProfile> {
  await sleep(delay);
  return PROFILE;
}

export async function fetchActivityFeed(delay = 800): Promise<ActivityItem[]> {
  await sleep(delay);
  return ACTIVITIES;
}

export async function fetchRecommendations(delay = 1200): Promise<Recommendation[]> {
  await sleep(delay);
  return RECOMMENDATIONS;
}

export async function fetchAnalytics(delay = 600): Promise<Analytics> {
  await sleep(delay);
  return ANALYTICS;
}

export async function fetchProductList(delay = 1000): Promise<Product[]> {
  await sleep(delay);
  return PRODUCTS;
}

export function fetchServerTimestamp(): string {
  return new Date().toISOString();
}

export function fetchStaticBuildTimestamp(): { iso: string; msg: string } {
  return {
    iso: new Date().toISOString(),
    msg: `Built at ${new Date().toISOString()}`,
  };
}
