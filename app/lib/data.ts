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

export async function fetchUserProfile(delay = 0): Promise<UserProfile> {
  const res = await fetch("https://randomuser.me/api/");
  const json = (await res.json()) as {
    results: {
      login: { uuid: string };
      name: { first: string; last: string };
      email: string;
      picture: { thumbnail: string };
      registered: { date: string };
    }[];
  };
  const u = json.results[0];
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  return {
    id: u.login.uuid.slice(0, 8),
    name: `${u.name.first} ${u.name.last}`,
    email: u.email,
    avatar: u.picture.thumbnail,
    joinedAt: u.registered.date,
  };
}

export async function fetchActivityFeed(delay = 0): Promise<ActivityItem[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=6");
  const posts = (await res.json()) as { id: number; title: string; body: string }[];
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  return posts.map((p) => ({
    id: `a${p.id}`,
    action: ["deployed", "scaled", "rolled back", "monitored", "configured", "optimized"][
      (p.id - 1) % 6
    ],
    target: p.title.slice(0, 25),
    timestamp: new Date(Date.now() - p.id * 45000).toISOString(),
  }));
}

export async function fetchRecommendations(delay = 0): Promise<Recommendation[]> {
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  return RECOMMENDATIONS;
}

export async function fetchAnalytics(delay = 0): Promise<Analytics> {
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  return ANALYTICS;
}

export async function fetchProductList(): Promise<Product[]> {
  const res = await fetch("https://fakestoreapi.com/products?limit=8");
  const items = (await res.json()) as {
    id: number;
    title: string;
    price: number;
    category: string;
    rating: { count: number };
  }[];
  return items.map((p) => ({
    id: `p${p.id}`,
    name: p.title,
    price: p.price,
    inStock: p.rating.count > 50,
    category: p.category,
  }));
}

export function fetchServerTimestamp(): string {
  return new Date().toISOString();
}

export function fetchStaticBuildTimestamp(): string {
  return new Date().toISOString();
}
