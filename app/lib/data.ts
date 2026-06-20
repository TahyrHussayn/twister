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
  const res = await fetch("https://dummyjson.com/products?limit=4&select=title,category,rating");
  const json = (await res.json()) as {
    products: { title: string; category: string; rating: number }[];
  };
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  return json.products.map((p, i) => ({
    id: `r${i + 1}`,
    title: p.title.slice(0, 28),
    category: p.category,
    score: p.rating / 5,
  }));
}

export async function fetchAnalytics(delay = 0): Promise<Analytics> {
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  const s = (Date.now() % 1000) / 1000;
  return {
    pageViews: Math.round(10000 + s * 5000),
    uniqueVisitors: Math.round(3000 + s * 2000),
    avgSessionDuration: Math.round(120 + s * 120),
    bounceRate: Math.round((0.15 + s * 0.1) * 100) / 100,
  };
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
