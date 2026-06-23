import type { Route } from "./+types/benchmark";

const ROUTES = [
  { strategy: "SSR", path: "/ssr" },
  { strategy: "CSR", path: "/csr" },
  { strategy: "SSG", path: "/ssg" },
  { strategy: "Streaming", path: "/streaming" },
  { strategy: "ISR", path: "/isr" },
  { strategy: "PPR", path: "/ppr" },
  { strategy: "Islands", path: "/islands" },
  { strategy: "HTMX", path: "/htmx" },
  { strategy: "Hybrid", path: "/hybrid" },
  { strategy: "Edge", path: "/edge-vs-origin" },
];

// ─── Action — POST to trigger a benchmark run ────────────────────────────────
export async function action({ request }: Route.ActionArgs) {
  const origin = new URL(request.url).origin;

  const results = await Promise.all(
    ROUTES.map(async ({ strategy, path }) => {
      const t0 = Date.now();
      try {
        const res = await fetch(`${origin}${path}`, {
          headers: {
            Accept: "text/html",
            "User-Agent": "Twister-Benchmark/2.0",
          },
          signal: AbortSignal.timeout(5_000),
        });
        const ttfb = Date.now() - t0;
        const cacheStatus =
          res.headers.get("CF-Cache-Status") ?? res.headers.get("X-Cache-Status") ?? "DYNAMIC";
        return {
          strategy,
          ttfb,
          status: res.status,
          cached: cacheStatus === "HIT",
          cacheStatus,
        };
      } catch {
        return {
          strategy,
          ttfb: -1,
          status: 0,
          cached: false,
          cacheStatus: "ERROR",
        };
      }
    }),
  );

  return {
    results,
    measuredAt: new Date().toISOString(),
    origin,
  };
}

// ─── Loader — GET is not used ────────────────────────────────────────────────
export async function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}
