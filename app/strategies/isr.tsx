import type { Route } from "./+types/isr";
import { fetchProductList, fetchServerTimestamp } from "~/lib/data";
import { getCachedResponse, putCacheEntry, type CacheStatus } from "~/lib/cache";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [{ title: "ISR — Incremental Static Regeneration" }];
}
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ request }: Route.LoaderArgs) {
  const cacheKey = new Request(new URL(request.url).toString());
  const start = Date.now();

  const cached = await getCachedResponse(cacheKey);

  if (cached) {
    const json = (await cached.json()) as {
      products: Awaited<ReturnType<typeof fetchProductList>>;
      timestamp: string;
    };
    const age = parseInt(cached.headers.get("Age") ?? "0", 10);
    const status: CacheStatus = age > 60 ? "STALE" : "HIT";
    return {
      products: json.products,
      timestamp: json.timestamp,
      metrics: { ...createMetrics("ISR"), ttfb: Date.now() - start },
      cacheStatus: status,
    };
  }

  const products = await fetchProductList();
  const timestamp = fetchServerTimestamp();
  const body = JSON.stringify({ products, timestamp });
  const response = new Response(body, { headers: { "Content-Type": "application/json" } });
  await putCacheEntry(cacheKey, response);

  return {
    products,
    timestamp,
    metrics: { ...createMetrics("ISR"), ttfb: Date.now() - start },
    cacheStatus: "MISS" as CacheStatus,
  };
}

export default function ISR({ loaderData }: Route.ComponentProps) {
  const { products, timestamp, metrics, cacheStatus } = loaderData;

  return (
    <StrategyPage
      strategy="isr"
      emoji="🔄"
      title="Incremental Static Regeneration"
      metrics={
        cacheStatus === "HIT"
          ? { ...metrics, ttfb: metrics.ttfb < 5 ? metrics.ttfb : Math.round(metrics.ttfb) }
          : metrics
      }
      cacheStatus={cacheStatus}
      description={
        <>
          Uses Cloudflare's{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            Cache API
          </code>
          . First visit fetches from{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            fakestoreapi.com
          </code>{" "}
          and caches globally. Refresh — the response comes from cache with a HIT badge and
          near-zero TTFB. Purge to see a MISS again.
        </>
      }
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={ISR_CODE} filename="app/strategies/isr.tsx" strategy="ISR" />

      <SectionDivider label="Cache controls" />
      <div className="grid gap-4 sm:grid-cols-3">
        <form
          method="post"
          action="/api/purge"
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
        >
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--s-text)" }}>
            Purge Cache
          </p>
          <input type="hidden" name="url" value="/isr" />
          <input type="hidden" name="redirect" value="/isr" />
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--s-accent)" }}
          >
            Purge /isr
          </button>
          <p className="text-[10px] text-zinc-400 mt-2">
            Clears CDN cache. Refresh after purging to see a MISS.
          </p>
        </form>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-xs font-semibold mb-2">Cache Behavior</p>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Cache-Tag</span>
              <code className="font-mono text-blue-600 dark:text-blue-400">isr-products</code>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">max-age</span>
              <code className="font-mono text-emerald-600 dark:text-emerald-400">60s</code>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">stale-while-revalidate</span>
              <code className="font-mono" style={{ color: "var(--s-text)" }}>
                3600s
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <code className="font-mono">{cacheStatus}</code>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-xs font-semibold mb-2">Test It</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Refresh Page
          </button>
          <p className="text-[10px] text-zinc-400 mt-2">
            First load: MISS + slow. Second load: HIT + fast. Purge then refresh: MISS again.
          </p>
        </div>
      </div>

      <SectionDivider label="Live demo" />
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-5 py-3 text-left text-xs font-semibold">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold">Category</th>
                <th className="px-5 py-3 text-right text-xs font-semibold">Price</th>
                <th className="px-5 py-3 text-center text-xs font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-xs max-w-[200px] truncate">{p.name}</td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{p.category}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">${p.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${p.inStock ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"}`}
                    >
                      {p.inStock ? "In Stock" : "Sold Out"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-center text-[11px] font-mono text-zinc-400">
        Rendered at: {timestamp} · Cache: {cacheStatus} · TTFB: {metrics.ttfb}ms
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={[
          "Fast on cache hits",
          "Auto-revalidation",
          "Global edge distribution via Cloudflare CDN",
        ]}
        cons={[
          "First visit is a MISS (slower)",
          "Stale data window during revalidation",
          "Cache purge is per-datacenter",
        ]}
        related={[
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/ppr", label: "PPR", emoji: "🧩" },
          { to: "/ssr", label: "SSR", emoji: "⚡" },
        ]}
      />
    </StrategyPage>
  );
}

const ISR_CODE = `export async function loader({ request }) {
  const cacheKey = new Request(request.url);

  // Check Cloudflare Cache API
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached.json(); // HIT — near-zero TTFB

  // MISS — fetch from origin
  const products = await fetchProductList();
  const response = Response.json({ products });
  await caches.default.put(cacheKey, response);
  return { products, cacheStatus: "MISS" };
}`;
