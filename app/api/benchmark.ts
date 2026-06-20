import type { Route } from "./+types/benchmark";

type Result = {
  strategy: string;
  url: string;
  ttfb: number;
  status: number;
  cacheStatus: string | null;
  error?: string;
};

export async function action({ request }: Route.ActionArgs) {
  const base = new URL(request.url).origin;
  const endpoints = [
    { strategy: "SSR", path: "/ssr" },
    { strategy: "CSR", path: "/csr" },
    { strategy: "SSG", path: "/ssg" },
    { strategy: "Streaming", path: "/streaming" },
    { strategy: "ISR", path: "/isr" },
    { strategy: "PPR", path: "/ppr" },
    { strategy: "Islands", path: "/islands" },
  ];

  const results: Result[] = await Promise.all(
    endpoints.map(async ({ strategy, path }) => {
      try {
        const start = Date.now();
        const res = await fetch(`${base}${path}`, { redirect: "follow" });
        const ttfb = Date.now() - start;
        return {
          strategy,
          url: path,
          ttfb,
          status: res.status,
          cacheStatus: res.headers.get("CF-Cache-Status"),
        };
      } catch (e) {
        return { strategy, url: path, ttfb: -1, status: 0, cacheStatus: null, error: String(e) };
      }
    }),
  );

  return Response.json({ results, timestamp: new Date().toISOString() });
}
