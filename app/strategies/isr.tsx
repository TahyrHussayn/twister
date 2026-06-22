import type { Route } from "./+types/isr";
import { useFetcher } from "react-router";
import { fetchProductList, fetchServerTimestamp } from "~/lib/data";
import { getCachedResponse, putCacheEntry, type CacheStatus } from "~/lib/cache";
import { getEdgeInfo } from "~/lib/edge-info";
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
      edgeInfo: getEdgeInfo(request),
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
    edgeInfo: getEdgeInfo(request),
  };
}

export default function ISR({ loaderData }: Route.ComponentProps) {
  const { products, timestamp, metrics, cacheStatus, edgeInfo } = loaderData;
  const fetcher = useFetcher();
  const isPurging = fetcher.state !== "idle";

  return (
    <StrategyPage
      strategy="isr"
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
            className="px-1.5 py-0.5 rounded font-mono text-[11px] border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            Cache API
          </code>
          . First visit fetches from{" "}
          <code
            className="px-1.5 py-0.5 rounded font-mono text-[11px] border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            fakestoreapi.com
          </code>{" "}
          and caches globally. Refresh — the response comes from cache with a HIT badge and
          near-zero TTFB. Purge to see a MISS again.
        </>
      }
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step">
          <span className="text-lg">📱</span>
          <span>First Request</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">⚙️</span>
          <span>Server Renders</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">💾</span>
          <span>Cache Stores</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">⚡</span>
          <span>Subsequent: Cache HIT</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={ISR_CODE} filename="app/strategies/isr.tsx" strategy="ISR" />

      <SectionDivider label="Cache controls" />
      <div className="grid gap-6 sm:grid-cols-3">
        <fetcher.Form
          method="post"
          action="/api/purge"
          className="rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm relative overflow-hidden"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-20"
            style={{ backgroundColor: "var(--s-accent)" }}
          />
          <p className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
            Purge Cache
          </p>
          <input type="hidden" name="url" value="/isr" />
          <input type="hidden" name="redirect" value="/isr" />
          <button
            type="submit"
            disabled={isPurging}
            className="w-full px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm disabled:opacity-70 disabled:pointer-events-none"
            style={{ backgroundColor: "var(--s-accent)" }}
          >
            {isPurging ? "Purging..." : "Purge /isr"}
          </button>
          <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed font-medium">
            Clears CDN cache. Refresh after purging to see a{" "}
            <span className="text-rose-500 font-bold">MISS</span>.
          </p>
        </fetcher.Form>

        <div
          className="rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm relative overflow-hidden"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-20"
            style={{ backgroundColor: "var(--s-accent)" }}
          />
          <p className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
            Behavior
          </p>
          <div className="space-y-3 text-xs font-medium">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="text-zinc-500">Cache-Tag</span>
              <code className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                isr-products
              </code>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="text-zinc-500">max-age</span>
              <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                60s
              </code>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="text-zinc-500">SWR</span>
              <code
                className="font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: "var(--s-text)", backgroundColor: "var(--s-bg)" }}
              >
                3600s
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Status</span>
              <code
                className={`font-mono font-bold px-1.5 py-0.5 rounded ${cacheStatus === "HIT" ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20"}`}
              >
                {cacheStatus}
              </code>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm relative overflow-hidden"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-20"
            style={{ backgroundColor: "var(--s-accent)" }}
          />
          <p className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
            Test It
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:scale-105 active:scale-95 transition-transform shadow-sm"
          >
            Refresh Page
          </button>
          <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed font-medium">
            First load: <span className="text-rose-500 font-bold">MISS</span> + slow. Second load:{" "}
            <span className="text-emerald-500 font-bold">HIT</span> + fast.
          </p>
        </div>
      </div>

      <SectionDivider label="Live demo" />
      <section
        className="rounded-2xl border bg-white dark:bg-[#050505] overflow-hidden shadow-sm"
        style={{ borderColor: "var(--s-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
              >
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Product
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Category
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Price
                </th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-xs max-w-[200px] truncate text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-xs font-medium text-zinc-500">{p.category}</td>
                  <td className="px-5 py-3 text-right font-mono font-medium text-xs text-zinc-700 dark:text-zinc-300">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${p.inStock ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" : "bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-900"}`}
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

      <div className="flex flex-col items-center gap-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] text-[11px] font-mono text-zinc-500 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Served from {edgeInfo.colo} ({edgeInfo.city}, {edgeInfo.country})
        </div>
        <p className="text-center text-[11px] font-mono font-medium text-zinc-500">
          Rendered at: <span style={{ color: "var(--s-text)" }}>{timestamp}</span> · Cache:{" "}
          <span className="font-bold">{cacheStatus}</span> · TTFB:{" "}
          <span style={{ color: "var(--s-text)" }}>{metrics.ttfb}ms</span>
        </p>
      </div>

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
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/ppr", label: "PPR", key: "PPR" },
          { to: "/ssr", label: "SSR", key: "SSR" },
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
