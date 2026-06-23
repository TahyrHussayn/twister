import type { Route } from "./+types/edge-vs-origin";
import { makeUser, makeProducts, makeAnalytics, makePosts } from "~/lib/seed";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";
import { useRevalidator } from "react-router";

// ─── Loader ──────────────────────────────────────────────────────────────────
export async function loader({ request }: Route.LoaderArgs) {
  const edgeInfo = getEdgeInfo(request);
  const cacheKey = new Request(new URL("/edge-bench", request.url).toString());

  // Measurement 1: Cache API read (represents edge-local latency)
  const t0 = Date.now();
  let cacheHitTime = 0;
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    await cached.text();
    cacheHitTime = Date.now() - t0;
  } else {
    // Populate for next request
    await caches.default.put(
      cacheKey,
      new Response(JSON.stringify({ ts: Date.now() }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=30",
        },
      }),
    );
    cacheHitTime = Date.now() - t0;
  }

  // Measurement 2: Full SSR compute (represents origin-like compute cost)
  const t1 = Date.now();
  const seed = Math.floor(Date.now() / 1000);
  const _u = makeUser(seed);
  const _p = makePosts(seed, 20);
  const _a = makeAnalytics(seed);
  const _pr = makeProducts(seed, 20);
  // Simulate realistic origin latency (network + compute)
  await new Promise((r) => setTimeout(r, 60 + Math.floor(Math.random() * 40)));
  const computeTime = Date.now() - t1;

  return {
    edgeInfo,
    cacheHitTime,
    computeTime,
    cacheWarm: !!cached,
    ratio: computeTime / Math.max(cacheHitTime, 1),
    metrics: createMetrics("EDGE-VS-ORIGIN"),
    renderedAt: new Date().toISOString(),
  };
}

export function headers() {
  return {
    "Cache-Control": "no-store",
    "X-Render-Strategy": "Edge-vs-Origin",
  };
}

// ─── Code Snippet ────────────────────────────────────────────────────────────
const CODE = `// Measure Cache API (edge-local) vs full compute
export async function loader({ request }) {
  // Cache API: sub-millisecond when warm
  const cacheKey = new Request('/edge-bench');
  const t0 = Date.now();
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    await cached.text();
    const cacheHitTime = Date.now() - t0; // ~0-2ms on warm cache
  }

  // Compute: simulate origin round-trip
  const t1 = Date.now();
  await heavyDataFetch();               // DB queries, transforms
  await sleep(60 + random(40));         // network latency
  const computeTime = Date.now() - t1; // ~60-100ms

  return { cacheHitTime, computeTime, ratio: computeTime / cacheHitTime };
}

// No caching — every request re-measures
export function headers() {
  return { 'Cache-Control': 'no-store' };
}`;

const flowSteps = [
  { label: "Request" },
  { label: "Edge Colo", active: true },
  { label: "Cache API", active: true },
  { label: "vs" },
  { label: "Compute", active: true },
  { label: "HTML" },
];

// ─── Default Component ───────────────────────────────────────────────────────
export default function EdgeVsOrigin({ loaderData }: Route.ComponentProps) {
  const { edgeInfo, cacheHitTime, computeTime, cacheWarm, ratio, renderedAt } = loaderData;

  const revalidator = useRevalidator();
  const running = revalidator.state !== "idle";

  const maxTime = Math.max(cacheHitTime, computeTime, 1);
  const cacheBarPct = Math.max((cacheHitTime / maxTime) * 100, 2);
  const computeBarPct = Math.max((computeTime / maxTime) * 100, 2);

  return (
    <StrategyPage
      title="Edge vs. Origin"
      icon="⏱️"
      strategy="edge-vs-origin"
      description="Measure what actually differs: a Cache API read at the edge versus full SSR compute. The speedup ratio reveals why edge caching matters."
      metrics={loaderData.metrics}
    >
      {/* ── Flow Diagram ─────────────────────────────────────────────── */}
      <section className="animate-in">
        <p className="eyebrow mb-4">Request Path</p>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider />

      {/* ── Colo Badge ───────────────────────────────────────────────── */}
      <section className="animate-in stagger">
        <p className="eyebrow mb-4">Your Edge Location</p>
        <div
          className="glass-card p-6 flex flex-col sm:flex-row sm:items-center gap-6"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div
            className="text-5xl font-black font-mono tracking-tighter"
            style={{ color: "var(--s-accent)" }}
          >
            {edgeInfo.colo ?? "???"}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-[var(--color-fg)]">
              {edgeInfo.city ?? "Unknown City"}, {edgeInfo.country ?? "Unknown Country"}
            </p>
            <p className="text-sm text-[var(--color-subtle)]">
              {edgeInfo.timezone ?? "Unknown timezone"}
            </p>
            <p className="text-xs text-[var(--color-subtle)] font-mono mt-1">
              Measured at {new Date(renderedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Battle Display ───────────────────────────────────────────── */}
      <section className="animate-in stagger">
        <p className="eyebrow mb-4">The Battle</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Cache API — green */}
          <div
            className="glass-card p-6"
            style={{ borderColor: "#10b98140", background: "#10b98108" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[var(--color-fg)]">Cache API</p>
              <span
                className="tag text-xs font-mono"
                style={{ color: "#10b981", borderColor: "#10b98140", background: "#10b98115" }}
              >
                EDGE LOCAL
              </span>
            </div>
            <p className="text-5xl font-black font-mono mb-2" style={{ color: "#10b981" }}>
              {cacheHitTime}
              <span className="text-xl font-bold ml-1">ms</span>
            </p>
            <p className="text-xs text-[var(--color-subtle)]">
              {cacheWarm ? "🟢 Cache was warm (HIT)" : "🟡 Cache was cold (MISS — populating)"}
            </p>
          </div>

          {/* Full Compute — red */}
          <div
            className="glass-card p-6"
            style={{ borderColor: "#f43f5e40", background: "#f43f5e08" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[var(--color-fg)]">Full Compute</p>
              <span
                className="tag text-xs font-mono"
                style={{ color: "#f43f5e", borderColor: "#f43f5e40", background: "#f43f5e15" }}
              >
                ORIGIN-LIKE
              </span>
            </div>
            <p className="text-5xl font-black font-mono mb-2" style={{ color: "#f43f5e" }}>
              {computeTime}
              <span className="text-xl font-bold ml-1">ms</span>
            </p>
            <p className="text-xs text-[var(--color-subtle)]">
              Data fetch + transforms + simulated network latency
            </p>
          </div>
        </div>

        {/* Speedup ratio */}
        <div className="glass-card p-5 text-center mb-6" style={{ borderColor: "var(--s-border)" }}>
          <p className="eyebrow mb-2">Speedup Ratio</p>
          <p className="text-6xl font-black font-mono" style={{ color: "var(--s-accent)" }}>
            {ratio.toFixed(1)}×
          </p>
          <p className="text-sm text-[var(--color-subtle)] mt-1">
            faster with Cache API vs full compute
          </p>
        </div>

        {/* Bar chart */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-xs text-[var(--color-subtle)] mb-1">
              <span>Cache API</span>
              <span>{cacheHitTime}ms</span>
            </div>
            <div className="bench-bar">
              <div
                className="bench-fill"
                style={{
                  width: `${cacheBarPct}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-[var(--color-subtle)] mb-1">
              <span>Full Compute</span>
              <span>{computeTime}ms</span>
            </div>
            <div className="bench-bar">
              <div
                className="bench-fill"
                style={{
                  width: `${computeBarPct}%`,
                  background: "linear-gradient(90deg, #f43f5e, #fb7185)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Rerun button */}
        <div className="flex justify-center">
          <button
            onClick={() => revalidator.revalidate()}
            disabled={running}
            className="tag px-6 py-2 text-sm font-semibold transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? "⏳ Running…" : "🔄 Re-run Benchmark"}
          </button>
        </div>
      </section>

      <SectionDivider />

      {/* ── Explanation terminal ──────────────────────────────────────── */}
      <section className="animate-in stagger">
        <p className="eyebrow mb-4">What We're Measuring</p>
        <div className="terminal">
          <div className="terminal-header">
            <span className="text-xs font-mono text-[var(--color-subtle)]">
              benchmark.explanation
            </span>
          </div>
          <div className="terminal-body space-y-3 text-sm">
            <p>
              <span style={{ color: "#10b981" }}>Cache API read:</span>{" "}
              <span className="text-[var(--color-fg-dim)]">
                Reads a small JSON payload from the edge-local Cache API. On a warm cache this is a
                memory lookup — typically 0–3ms. This represents what happens when Cloudflare serves
                a cached HTML page: no origin, no compute, just storage.
              </span>
            </p>
            <p>
              <span style={{ color: "#f43f5e" }}>Full compute:</span>{" "}
              <span className="text-[var(--color-fg-dim)]">
                Runs makeUser + makePosts + makeAnalytics + makeProducts, then sleeps 60–100ms to
                simulate a realistic origin round-trip (network latency + DB query + JSON
                serialization). This is what every uncached SSR request costs.
              </span>
            </p>
            <p>
              <span style={{ color: "var(--s-accent)" }}>The takeaway:</span>{" "}
              <span className="text-[var(--color-fg-dim)]">
                The ratio shows how much faster edge-cached responses are compared to uncached
                origin work. In production, the delta is even larger because real DB queries are
                10–200ms and cross-continental latency adds another 50–150ms.
              </span>
            </p>
          </div>
        </div>
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
          "Sub-millisecond cache reads",
          "Global edge infrastructure",
          "No cross-ocean round trips",
        ]}
        cons={[
          "Warm-up required for cache",
          "Per-colo cache (not global)",
          "D1 adds latency for writes",
        ]}
        related={[
          { to: "/isr", label: "ISR" },
          { to: "/ppr", label: "Stream+Cache" },
          { to: "/ssr", label: "SSR" },
        ]}
      />
    </StrategyPage>
  );
}
