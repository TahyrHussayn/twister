import { Suspense } from "react";
import type { Route } from "./+types/isr";
import { fetchProductList, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { TableSkeleton } from "~/components/skeleton";
import type { CacheStatus } from "~/lib/cache";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "ISR — Incremental Static Regeneration" },
    {
      name: "description",
      content: "Live ISR demo: edge-cached pages with stale-while-revalidate",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ request }: Route.LoaderArgs) {
  const products = await fetchProductList(300);
  const timestamp = fetchServerTimestamp();
  const metrics = createMetrics("ISR");
  const cacheStatus: CacheStatus = "DYNAMIC";

  return {
    products,
    timestamp,
    metrics,
    cacheStatus,
    requestUrl: request.url,
  };
}

export default function ISR({ loaderData }: Route.ComponentProps) {
  const { products, timestamp, metrics, cacheStatus } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔄</span>
          <h1 className="text-3xl font-bold">Incremental Static Regeneration</h1>
        </div>
        <MetricsBar metrics={metrics} cacheStatus={cacheStatus} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page uses{" "}
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            Cache-Control: s-maxage=60, stale-while-revalidate=3600
          </code>
          . On first visit, it renders at the edge and stores in Cloudflare's CDN. Subsequent
          requests get the cached version. After 60 seconds, the cache is considered stale —
          Cloudflare serves the stale copy while regenerating in the background.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PurgeForm />
          <CacheIndicator />
          <RefreshButton />
        </div>
      </header>

      <Suspense fallback={<TableSkeleton rows={5} />}>
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left font-medium">Product</th>
                  <th className="px-6 py-3 text-left font-medium">Category</th>
                  <th className="px-6 py-3 text-right font-medium">Price</th>
                  <th className="px-6 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-gray-500">{p.category}</td>
                    <td className="px-6 py-3 text-right font-mono">${p.price}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.inStock
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
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

      <footer className="text-xs text-gray-400 font-mono text-center">
        Rendered at: {timestamp}
        <br />
        Cache-Control: public, max-age=60, stale-while-revalidate=3600
      </footer>
    </div>
  );
}

function PurgeForm() {
  return (
    <form
      method="post"
      action="/api/purge"
      className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4"
    >
      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">Purge Cache</p>
      <input type="hidden" name="url" value="/isr" />
      <button
        type="submit"
        className="w-full px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
      >
        Purge /isr from Cache
      </button>
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
        Clears the CDN cache for this page, forcing regeneration on next visit.
      </p>
    </form>
  );
}

function CacheIndicator() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <p className="text-xs font-semibold mb-2">Cache Strategy</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-gray-500">max-age:</span>
          <code className="font-mono text-green-600 dark:text-green-400">60s</code>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-gray-500">stale-while-revalidate:</span>
          <code className="font-mono text-amber-600 dark:text-amber-400">3600s</code>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-gray-500">Cache-Tag:</span>
          <code className="font-mono text-blue-600 dark:text-blue-400">isr-products</code>
        </div>
      </div>
    </div>
  );
}

function RefreshButton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <p className="text-xs font-semibold mb-2">Test It</p>
      <button
        onClick={() => window.location.reload()}
        className="w-full px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Refresh Page
      </button>
      <p className="text-xs text-gray-400 mt-2">
        Refresh to see cache behavior. Watch for the Cache-Control headers in DevTools.
      </p>
    </div>
  );
}
