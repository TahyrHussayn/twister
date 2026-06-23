import type { Route } from "./+types/isr";
import { makeProducts, isrSeed } from "~/lib/seed";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { FlowDiagram } from "~/components/flow-diagram";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { useFetcher } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const cacheKey = new Request(new URL("/isr-cache-data", request.url).toString());
  const seed = isrSeed();
  let cacheStatus: "HIT" | "MISS" | "STALE" = "MISS";
  let products = makeProducts(seed, 6);
  let cachedAt = 0;

  const cached = await caches.default.match(cacheKey);
  if (cached) {
    cachedAt = parseInt(cached.headers.get("X-Cached-At") ?? "0", 10);
    const age = Date.now() - cachedAt;
    if (age < 60_000) {
      cacheStatus = "HIT";
      try {
        products = await cached.json();
      } catch {}
    } else {
      cacheStatus = "STALE";
      try {
        products = await cached.json();
      } catch {}
    }
  } else {
    cachedAt = Date.now();
    const res = new Response(JSON.stringify(products), {
      headers: {
        "Content-Type": "application/json",
        "X-Cached-At": String(cachedAt),
        "Cache-Control": "max-age=60",
      },
    });
    await caches.default.put(cacheKey, res);
    cacheStatus = "MISS";
  }

  return {
    products,
    cacheStatus,
    cachedAt,
    seed,
    ttl: 60,
    age: cachedAt ? Math.floor((Date.now() - cachedAt) / 1000) : 0,
    metrics: createMetrics("ISR"),
    edgeInfo: getEdgeInfo(request),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const cacheKey = new Request(new URL("/isr-cache-data", url.origin).toString());
  await caches.default.delete(cacheKey);
  return { purged: true, at: new Date().toISOString() };
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { ...Object.fromEntries(loaderHeaders), "X-Render-Strategy": "ISR" };
}

export default function ISRPage({ loaderData }: Route.ComponentProps) {
  const { products, cacheStatus, age, ttl, seed, edgeInfo, metrics } = loaderData;
  const fetcher = useFetcher<{ purged: boolean }>();
  const isPurging = fetcher.state !== "idle";

  const flowSteps = [
    { icon: "🌐", label: "Request", active: true },
    { icon: "🔍", label: "Cache Check", active: true },
    { icon: "⚡", label: cacheStatus === "HIT" ? "HIT: serve" : "MISS: compute", active: true },
    { icon: "💾", label: "Store Cache", active: true },
    { icon: "📄", label: "HTML Response", active: true },
  ];

  const statusColor =
    cacheStatus === "HIT" ? "#10b981" : cacheStatus === "STALE" ? "#8b5cf6" : "#f59e0b";

  return (
    <StrategyPage
      strategy="isr"
      title="Incremental Static Regeneration"
      icon="🔄"
      description="Cached response is served instantly from the edge CDN. Revalidation is triggered on a schedule or per-request background refresh, updating the cache without delaying the user."
      metrics={metrics}
      cacheStatus={cacheStatus}
    >
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="Cache State Machine" />

      {/* State Machine Diagram */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            alignItems: "center",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          {[
            {
              name: "MISS",
              desc: "No cache. Compute page, save to cache.",
              current: cacheStatus === "MISS",
            },
            {
              name: "HIT",
              desc: "Age < 60s. Serve instantly from cache.",
              current: cacheStatus === "HIT",
            },
            {
              name: "STALE",
              desc: "Age ≥ 60s. Serve stale cache, trigger BG revalidate.",
              current: cacheStatus === "STALE",
            },
          ].map((state) => (
            <div
              key={state.name}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${state.current ? statusColor : "rgba(255,255,255,0.08)"}`,
                background: state.current ? `${statusColor}10` : "rgba(255,255,255,0.02)",
                boxShadow: state.current ? `0 0 15px ${statusColor}20` : undefined,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: state.current ? statusColor : "#cbd5e1",
                  }}
                >
                  {state.name}
                </span>
                {state.current && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: statusColor,
                      boxShadow: `0 0 8px ${statusColor}`,
                    }}
                  />
                )}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
                {state.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="Cache Metadata & Controls" />

      {/* Cache Status Panel */}
      <section
        style={{
          marginBottom: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <div
          className="glass-card p-6"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}
          >
            <div>
              <p className="eyebrow" style={{ margin: "0 0 4px" }}>
                Status
              </p>
              <span
                className="tag"
                style={{
                  background: `${statusColor}15`,
                  color: statusColor,
                  borderColor: `${statusColor}30`,
                  fontWeight: 800,
                }}
              >
                {cacheStatus}
              </span>
            </div>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 4px" }}>
                Cache Age
              </p>
              <span className="metric-value" style={{ fontSize: "1.25rem" }}>
                {age}s
              </span>
            </div>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 4px" }}>
                TTL
              </p>
              <span className="metric-value" style={{ fontSize: "1.25rem" }}>
                {ttl}s
              </span>
            </div>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 4px" }}>
                Colo
              </p>
              <span className="tag">{edgeInfo.colo}</span>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <p className="eyebrow" style={{ margin: "0 0 6px" }}>
              TTL Progress
            </p>
            <div className="bench-bar">
              <div
                className="bench-fill"
                style={{
                  width: `${Math.min((age / ttl) * 100, 100)}%`,
                  background: statusColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Purge Controller */}
        <div
          className="glass-card p-6"
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div>
            <p className="eyebrow" style={{ margin: "0 0 6px" }}>
              Purge Cache
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
              Manually invalidate the Edge cache. The next request will result in a{" "}
              <strong>MISS</strong>.
            </p>
          </div>
          <fetcher.Form method="post">
            <button
              type="submit"
              disabled={isPurging}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--s-accent)",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s",
                opacity: isPurging ? 0.7 : 1,
              }}
            >
              {isPurging ? "Purging..." : "Purge Cache"}
            </button>
          </fetcher.Form>
          {fetcher.data?.purged && (
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#10b981", textAlign: "center" }}>
              ✓ Cache purged successfully!
            </p>
          )}
        </div>
      </section>

      <SectionDivider label="Incremental Data Grid" />

      {/* Product List */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="data-card p-5"
              style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-fg)",
                  }}
                >
                  {p.name}
                </h3>
                <span className="tag" style={{ fontSize: 9 }}>
                  {p.category}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--s-accent)",
                  }}
                >
                  ${p.price.toFixed(2)}
                </p>
                <span style={{ fontSize: 10, color: p.inStock ? "#10b981" : "#ef4444" }}>
                  {p.inStock ? "✓ In stock" : "✗ Out of stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 16 }}>
          Products seeded from epoch: <code style={{ color: "var(--s-text)" }}>{seed}</code>{" "}
          (changes every 60 seconds)
        </p>
      </section>

      <SectionDivider label="How it works" />
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={ISR_CODE} filename="app/strategies/isr.tsx" />
      </section>

      <SectionDivider label="Strategy Assessment" />
      <ComparisonPanel
        pros={[
          "Instant TTFB from cache",
          "Automatic stale revalidation",
          "Configurable freshness window",
        ]}
        cons={[
          "Data can be stale up to TTL",
          "Cache invalidation is complex",
          "Edge cache is per-colo",
        ]}
        related={[
          { to: "/ssg", label: "SSG" },
          { to: "/ppr", label: "Stream+Cache" },
          { to: "/ssr", label: "SSR" },
        ]}
      />
    </StrategyPage>
  );
}

const ISR_CODE = `export async function loader({ request }) {
  const cacheKey = new Request(new URL('/isr-cache-data', request.url).toString());
  const seed = isrSeed(); // Rotates every 60s
  let products = makeProducts(seed, 6);

  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('X-Cached-At') ?? '0');
    const age = Date.now() - cachedAt;

    if (age < 60_000) {
      // Cache HIT — serve immediately
      return { products, cacheStatus: 'HIT' };
    } else {
      // Cache STALE — serve stale, trigger background revalidation
      // (In production, trigger background fetch + cache update here)
      return { products, cacheStatus: 'STALE' };
    }
  }

  // Cache MISS — build new cache
  return { products, cacheStatus: 'MISS' };
}`;
