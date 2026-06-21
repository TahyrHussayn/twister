import { useState, useEffect } from "react";
import type { Route } from "./+types/hybrid";
import { fetchProductList } from "~/lib/data";
import type { Product } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";

export function meta() {
  return [
    { title: "Hybrid — Per-Route & Mixed Rendering" },
    {
      name: "description",
      content:
        "Hybrid rendering demo: Mixing static generation (SSG) for the shell with client-side fetching (CSR) for dynamic data.",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader() {
  return {
    metrics: createMetrics("HYBRID"),
  };
}

export default function Hybrid({ loaderData }: Route.ComponentProps) {
  const { metrics } = loaderData;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side fetch
    void fetchProductList().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <StrategyPage
      strategy="hybrid"
      title="Hybrid Rendering"
      metrics={metrics}
      description={
        <>
          Hybrid rendering lets you mix strategies per-route. You might pre-render (SSG) your
          marketing pages, use Server-Side Rendering (SSR) for user dashboards, and combine SSG with
          Client-Side Rendering (CSR) for interactive widgets. This page demonstrates a static shell
          that hydrates and fetches data on the client.
        </>
      }
    >
      <SectionDivider label="Mixed Rendering Demo" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Static Component */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505]">
          <h3 className="text-lg font-bold mb-2">Static Shell (SSG/SSR)</h3>
          <p className="text-sm text-zinc-500 mb-4">
            This part of the page is rendered immediately by the server. It has no loading states
            and is instantly interactive.
          </p>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/30">
            ✅ Instantly delivered from the edge cache
          </div>
        </div>

        {/* Dynamic Client Component */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505]">
          <h3 className="text-lg font-bold mb-2">Dynamic Data (CSR)</h3>
          <p className="text-sm text-zinc-500 mb-4">
            This data is fetched on the client after hydration. Useful for user-specific data or
            frequently changing inventory.
          </p>

          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                {products.slice(0, 3).map((p) => (
                  <li
                    key={p.id}
                    className="text-sm flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-900"
                  >
                    <span className="truncate pr-4">{p.name}</span>
                    <span className="font-mono font-bold">${p.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={HYBRID_CODE} filename="app/strategies/hybrid.tsx" strategy="hybrid" />
    </StrategyPage>
  );
}

const HYBRID_CODE = `// This page demonstrates mixing strategies.
// 1. In React Router v8, you can configure per-route prerendering:
// react-router.config.ts
export default {
  prerender: ["/about", "/marketing", "/hybrid-shell"],
};

// 2. Inside the component, mix static and dynamic:
export default function HybridRoute() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch user-specific data client-side
    fetch('/api/user-data').then(res => res.json()).then(setData);
  }, []);

  return (
    <div>
      {/* Server-rendered static shell */}
      <StaticSidebar />
      
      {/* Client-rendered dynamic content */}
      <main>
        {data ? <UserDashboard data={data} /> : <Spinner />}
      </main>
    </div>
  );
}
`;
