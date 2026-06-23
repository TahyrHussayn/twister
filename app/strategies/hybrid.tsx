import type { Route } from "./+types/hybrid";
import { makeProducts } from "~/lib/seed";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";
import { CardSkeleton } from "~/components/skeleton";
import { useFetcher } from "react-router";
import type { Product } from "~/lib/seed";

declare const __BUILD_TIME__: number;
declare const __BUILD_ID__: string;

// ─── ProductItem ────────────────────────────────────────────────────────────
// Extracted as its own component so useFetcher is NOT called inside .map()
function ProductItem({ product, isFavorite }: { product: Product; isFavorite: boolean }) {
  const fetcher = useFetcher();
  const isAdd = fetcher.formData?.get("action") === "add";
  const isRemove = fetcher.formData?.get("action") === "remove";
  const isFav = isAdd ? true : isRemove ? false : isFavorite;

  return (
    <li className="data-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <fetcher.Form method="post">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="action" value={isFav ? "remove" : "add"} />
          <button
            type="submit"
            className="text-xl hover:scale-110 active:scale-90 transition-transform"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? "⭐" : "☆"}
          </button>
        </fetcher.Form>
        <div>
          <p className="text-sm font-semibold text-[var(--color-fg)]">{product.name}</p>
          <p className="text-xs text-[var(--color-subtle)]">{product.category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold text-sm" style={{ color: "var(--s-accent)" }}>
          ${product.price.toFixed(2)}
        </p>
        <span className={`text-xs ${product.inStock ? "text-green-400" : "text-red-400"}`}>
          {product.inStock ? "✓ In stock" : "✗ Out of stock"}
        </span>
      </div>
    </li>
  );
}

// ─── Loader (server, bakes at build time) ───────────────────────────────────
export async function loader() {
  const buildTime = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : Date.now();
  const buildId = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "DEV000";
  return { metrics: createMetrics("HYBRID"), buildTime, buildId };
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=31536000",
    "X-Render-Strategy": "Hybrid",
  };
}

// ─── clientLoader (runs in browser after hydration) ─────────────────────────
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const seed = Math.floor(Date.now() / 10_000);
  const favorites: string[] = JSON.parse(localStorage.getItem("twister_hybrid_favs") ?? "[]");
  return {
    ...serverData,
    products: makeProducts(seed, 6),
    favorites,
    clientTime: new Date().toISOString(),
    hydrationMs: Math.round(performance.now()),
  };
}
clientLoader.hydrate = true;

// ─── clientAction ────────────────────────────────────────────────────────────
export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const id = form.get("id") as string;
  const action = form.get("action") as string;
  const current: string[] = JSON.parse(localStorage.getItem("twister_hybrid_favs") ?? "[]");
  const updated =
    action === "add" ? [...new Set([...current, id])] : current.filter((x) => x !== id);
  localStorage.setItem("twister_hybrid_favs", JSON.stringify(updated));
  return { favorites: updated };
}

// ─── HydrateFallback ─────────────────────────────────────────────────────────
export function HydrateFallback() {
  return (
    <div className="strat-hybrid min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">
        <div className="skeleton h-8 w-48 rounded mb-2 mt-4" />
        <div className="skeleton h-12 w-72 rounded mb-6" />
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <CardSkeleton />
          <CardSkeleton lines={6} />
        </div>
        <div className="skeleton h-48 w-full rounded mt-8" />
      </div>
    </div>
  );
}

// ─── Code snippet ────────────────────────────────────────────────────────────
const CODE = `// server loader — baked at build, cached at edge forever
export async function loader() {
  return { buildTime: __BUILD_TIME__, buildId: __BUILD_ID__ };
}
export function headers() {
  return { 'Cache-Control': 'public, max-age=31536000' };
}

// client loader — runs in browser after hydration
export async function clientLoader({ serverLoader }) {
  const serverData = await serverLoader(); // re-use static data
  return {
    ...serverData,
    products: await fetchFreshProducts(), // dynamic
    favorites: JSON.parse(localStorage.getItem('favs') ?? '[]'),
  };
}
clientLoader.hydrate = true; // show HydrateFallback until ready

// client action — no server round-trip
export async function clientAction({ request }) {
  const { id, action } = Object.fromEntries(await request.formData());
  const favs = JSON.parse(localStorage.getItem('favs') ?? '[]');
  localStorage.setItem('favs', JSON.stringify(
    action === 'add' ? [...new Set([...favs, id])] : favs.filter(x => x !== id)
  ));
  return null;
}`;

const flowSteps = [
  { label: "Build Time", active: true },
  { label: "HTML Baked" },
  { label: "Edge Cache", active: true },
  { label: "Hydrate", active: true },
  { label: "clientLoader", active: true },
  { label: "Products Appear" },
];

// ─── Default Component ───────────────────────────────────────────────────────
export default function Hybrid({ loaderData }: Route.ComponentProps) {
  const products = "products" in loaderData ? (loaderData.products as Product[]) : null;
  const favorites = "favorites" in loaderData ? (loaderData.favorites as string[]) : [];
  const clientTime = "clientTime" in loaderData ? (loaderData.clientTime as string) : null;
  const hydrationMs = "hydrationMs" in loaderData ? (loaderData.hydrationMs as number) : null;

  const buildDate = new Date(loaderData.buildTime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <StrategyPage
      title="Hybrid Rendering"
      icon="🧬"
      strategy="hybrid"
      description="Static shell baked at build time, cached at the edge forever — then a client layer hydrates with fresh, personalized data. Best of both worlds."
      metrics={loaderData.metrics}
    >
      {/* ── Flow Diagram ─────────────────────────────────────────────── */}
      <section className="animate-in">
        <p className="eyebrow mb-4">Lifecycle</p>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider />

      {/* ── Split Evidence ───────────────────────────────────────────── */}
      <section className="animate-in stagger">
        <p className="eyebrow mb-4">Two Lifecycles</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Static shell */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="tag" style={{ color: "var(--s-accent)" }}>
                STATIC SHELL
              </span>
            </div>
            <p className="text-xs text-[var(--color-subtle)] uppercase tracking-widest mb-1">
              Built at
            </p>
            <p className="font-mono text-lg font-bold text-[var(--color-fg)] mb-3">{buildDate}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="tag font-mono text-xs">{loaderData.buildId}</span>
              <span className="text-xs text-[var(--color-subtle)]">Build ID</span>
            </div>
            <p className="text-xs text-[var(--color-subtle)] leading-relaxed">
              Same for every user until the next deploy. Served instantly from the edge — zero
              origin hits.
            </p>
          </div>

          {/* Client layer */}
          {clientTime ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="tag"
                  style={{ color: "#10b981", borderColor: "#10b98140", background: "#10b98115" }}
                >
                  CLIENT LAYER
                </span>
              </div>
              <p className="text-xs text-[var(--color-subtle)] uppercase tracking-widest mb-1">
                Hydrated at
              </p>
              <p className="font-mono text-lg font-bold text-[var(--color-fg)] mb-3">
                {new Date(clientTime).toLocaleTimeString()}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="metric-value text-sm">{hydrationMs}ms</span>
                <span className="text-xs text-[var(--color-subtle)]">since navigation start</span>
              </div>
              <p className="text-xs text-[var(--color-subtle)] leading-relaxed">
                Unique to this browser session. Personalized data loaded after hydration.
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 flex flex-col items-center justify-center gap-3">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-8 w-48 rounded" />
              <div className="skeleton h-4 w-40 rounded" />
              <p className="text-xs text-[var(--color-subtle)] mt-2">Waiting for clientLoader…</p>
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ── Products with Favorites ───────────────────────────────────── */}
      <section className="animate-in stagger">
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Client Products</p>
          {favorites.length > 0 && (
            <span className="tag">
              {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {products ? (
          <ul className="space-y-2">
            {products.map((p) => (
              <ProductItem key={p.id} product={p} isFavorite={favorites.includes(p.id)} />
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--color-subtle)] mt-3">
          ⭐ Favorites are persisted in <code>localStorage</code> via <code>clientAction</code> — no
          server round-trip.
        </p>
      </section>

      <SectionDivider />

      {/* ── Code Snippet ─────────────────────────────────────────────── */}
      <section className="animate-in stagger">
        <p className="eyebrow mb-4">Implementation</p>
        <CodeSnippet code={CODE} language="typescript" />
      </section>

      <SectionDivider />

      {/* ── Comparison ───────────────────────────────────────────────── */}
      <ComparisonPanel
        pros={[
          "Instant TTFB from edge cache",
          "Client data always fresh",
          "Persistent localStorage state",
        ]}
        cons={[
          "SEO bots miss client data",
          "Two data lifecycles to manage",
          "Requires clientLoader support",
        ]}
        related={[
          { to: "/ssg", label: "SSG" },
          { to: "/csr", label: "CSR" },
          { to: "/ppr", label: "Stream+Cache" },
        ]}
      />
    </StrategyPage>
  );
}
