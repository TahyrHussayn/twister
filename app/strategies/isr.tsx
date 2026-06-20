import { Suspense } from "react";
import type { Route } from "./+types/isr";
import { fetchProductList, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { TableSkeleton } from "~/components/skeleton";
import type { CacheStatus } from "~/lib/cache";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [{ title: "ISR — Incremental Static Regeneration" }];
}
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader(_args: Route.LoaderArgs) {
  const products = await fetchProductList(300);
  const cacheStatus: CacheStatus = "DYNAMIC";
  return {
    products,
    timestamp: fetchServerTimestamp(),
    metrics: createMetrics("ISR"),
    cacheStatus,
  };
}

export default function ISR({ loaderData }: Route.ComponentProps) {
  const { products, timestamp, metrics, cacheStatus } = loaderData;

  return (
    <StrategyPage
      strategy="isr"
      emoji="🔄"
      title="Incremental Static Regeneration"
      metrics={metrics}
      cacheStatus={cacheStatus}
      description={
        <>
          Uses{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            Cache-Control: s-maxage=60, stale-while-revalidate=3600
          </code>
          . First visit renders at the edge and caches globally. After 60s the cache goes stale —
          Cloudflare serves the stale copy while regenerating in background.
        </>
      }
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/isr.tsx" strategy="ISR" />

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
          <p className="text-[10px] text-zinc-400 mt-2">Clears CDN cache, forces regeneration.</p>
        </form>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-xs font-semibold mb-2">Cache Strategy</p>
          <div className="space-y-1 text-[11px]">
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
              <span className="text-zinc-500">Cache-Tag</span>
              <code className="font-mono text-blue-600 dark:text-blue-400">isr-products</code>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-xs font-semibold mb-2">Edge Advantage</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Cached at <strong>330+ global PoPs</strong>. Next.js ISR regenerates in a single region.
            Cloudflare regenerates globally.
          </p>
        </div>
      </div>

      <SectionDivider label="Live demo" />
      <Suspense fallback={<TableSkeleton rows={5} />}>
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
                    <td className="px-5 py-3 font-medium text-xs">{p.name}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">{p.category}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">${p.price}</td>
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
      </Suspense>

      <p className="text-center text-[11px] font-mono text-zinc-400">
        Rendered at: {timestamp} · s-maxage=60, stale-while-revalidate=3600
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Fast on cache hits", "Auto-revalidation", "Global edge distribution"]}
        cons={["First visit slower", "Stale data window", "Cache purge complexity"]}
        related={[
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/ppr", label: "PPR", emoji: "🧩" },
          { to: "/ssr", label: "SSR", emoji: "⚡" },
        ]}
      />
    </StrategyPage>
  );
}

const CODE = `export async function loader() {
  const products = await fetchProductList();
  return { products };
}

// Response headers (via entry.server or route):
// Cache-Control: public, max-age=60,
//   stale-while-revalidate=3600
// Cache-Tag: isr-products`;
