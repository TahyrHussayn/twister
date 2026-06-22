import type { Route } from "./+types/hybrid";
import { useFetcher } from "react-router";
import { fetchProductList, type Product } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";

export function meta() {
  return [
    { title: "Hybrid — Per-Route & Mixed Rendering" },
    {
      name: "description",
      content:
        "Hybrid rendering demo: Mixing static generation (SSG) for the shell with client-side fetching (CSR) for dynamic data using clientLoader.",
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

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const products = await fetchProductList();
  const favorites =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("twister_favorites") || "[]")
      : [];
  return {
    ...serverData,
    products,
    favorites,
  };
}
clientLoader.hydrate = true;

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const isFavorite = formData.get("isFavorite") === "true";

  const favorites = JSON.parse(localStorage.getItem("twister_favorites") || "[]");
  if (isFavorite) {
    if (!favorites.includes(id)) favorites.push(id);
  } else {
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1);
  }
  localStorage.setItem("twister_favorites", JSON.stringify(favorites));
  return { success: true };
}

export function HydrateFallback() {
  // We render the static parts here, and a skeleton for the dynamic parts.
  return <HybridUI metrics={createMetrics("HYBRID")} products={null} favorites={[]} />;
}

export default function Hybrid({ loaderData }: Route.ComponentProps) {
  const products = "products" in loaderData ? loaderData.products : null;
  const favorites = "favorites" in loaderData ? loaderData.favorites : [];
  return <HybridUI metrics={loaderData.metrics} products={products} favorites={favorites} />;
}

function HybridUI({
  metrics,
  products,
  favorites,
}: {
  metrics: any;
  products: Product[] | null;
  favorites: string[];
}) {
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
          that hydrates and fetches data natively on the client using RRv8{" "}
          <code
            className="px-1.5 py-0.5 rounded font-mono text-[11px] border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            clientLoader
          </code>
          .
        </>
      }
    >
      <SectionDivider label="Mixed Rendering Demo" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Static Component */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] shadow-sm">
          <h3 className="text-lg font-bold mb-2">Static Shell (SSG)</h3>
          <p className="text-sm text-zinc-500 mb-4">
            This part of the page is pre-rendered at build time. It has no loading states and is
            instantly interactive upon hydration.
          </p>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/30">
            ✅ Instantly delivered from the edge cache
          </div>
        </div>

        {/* Dynamic Client Component */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] shadow-sm">
          <h3 className="text-lg font-bold mb-2 flex justify-between items-center">
            <span>Dynamic Data (CSR)</span>
            {!products && (
              <div className="animate-spin h-4 w-4 border-2 border-[var(--s-accent)] border-t-transparent rounded-full" />
            )}
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            This data is fetched on the client after hydration via <code>clientLoader</code>. Useful
            for user-specific data.
          </p>

          <div className="space-y-3">
            {!products ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                {products.slice(0, 3).map((p: any) => {
                  const fetcher = useFetcher();
                  // Optimistic UI check
                  const isFavoriting = fetcher.formData?.get("isFavorite") === "true";
                  const isUnfavoriting = fetcher.formData?.get("isFavorite") === "false";
                  const isFav = isFavoriting
                    ? true
                    : isUnfavoriting
                      ? false
                      : favorites.includes(String(p.id));

                  return (
                    <li
                      key={p.id}
                      className="text-sm flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2 truncate pr-4">
                        <fetcher.Form method="post">
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="isFavorite" value={isFav ? "false" : "true"} />
                          <button
                            type="submit"
                            className="text-lg transition-transform hover:scale-110 active:scale-90"
                            aria-label={isFav ? "Unfavorite" : "Favorite"}
                          >
                            {isFav ? "⭐️" : "☆"}
                          </button>
                        </fetcher.Form>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-zinc-600 dark:text-zinc-400">
                        ${p.price}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={HYBRID_CODE} filename="app/strategies/hybrid.tsx" strategy="HYBRID" />

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={[
          "Instant TTFB from SSG shell",
          "Fresh dynamic data on the client",
          "Zero lifecycle hooks needed",
        ]}
        cons={[
          "Requires client-side JavaScript to see data",
          "Two data-fetching lifecycles (build + client)",
          "SEO bots might miss CSR data",
        ]}
        related={[
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/csr", label: "CSR", key: "CSR" },
          { to: "/ppr", label: "PPR", key: "PPR" },
        ]}
      />
    </StrategyPage>
  );
}

const HYBRID_CODE = `// react-router.config.ts
export default {
  prerender: ["/hybrid"], // Build the shell at compile-time
};

// Returns static shell data during SSG build
export async function loader() {
  return { staticContent: "Baked at build time" };
}

// HydrateFallback shows instantly while clientLoader runs
export function HydrateFallback() {
  return <HybridUI loading={true} />;
}

// Runs on the client to fetch dynamic holes
export async function clientLoader({ serverLoader }) {
  const serverData = await serverLoader();
  const products = await fetchProductList();
  return { ...serverData, products };
}
clientLoader.hydrate = true; // Tell RR to run this on mount
`;
