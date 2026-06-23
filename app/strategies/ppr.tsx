import type { Route } from "./+types/ppr";
import { makeUser, makePosts, makeAnalytics, fetchWithDelay, liveSeed } from "~/lib/seed";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { FlowDiagram } from "~/components/flow-diagram";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { Suspense, use } from "react";

import { getSimulatedLatency } from "~/lib/latency";

export async function loader({ request }: Route.LoaderArgs) {
  const seed = liveSeed();
  const userDelay = getSimulatedLatency(request, 0);
  const cacheKey = new Request(new URL("/ppr-shell-user", request.url).toString());

  let shellUser = makeUser(seed);
  let shellCacheStatus: "HIT" | "MISS" = "MISS";

  const cached = await caches.default.match(cacheKey);
  if (cached) {
    try {
      shellUser = await cached.json();
      shellCacheStatus = "HIT";
    } catch {}
  } else {
    try {
      await caches.default.put(
        cacheKey,
        new Response(JSON.stringify(shellUser), {
          headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" },
        }),
      );
    } catch {}
  }

  return {
    // Shell: resolved synchronously from cache
    shellUser,
    shellCacheStatus,
    // Dynamic holes: un-awaited (stream via Suspense)
    postsPromise: fetchWithDelay(makePosts(seed, 3), 800 + userDelay),
    analyticsPromise: fetchWithDelay(makeAnalytics(seed), 1200 + userDelay),
    edgeInfo: getEdgeInfo(request),
    renderedAt: new Date().toISOString(),
    metrics: createMetrics("PPR"),
  };
}

export function headers() {
  return { "X-Render-Strategy": "PPR" };
}

function DynamicPosts({ promise }: { promise: Promise<ReturnType<typeof makePosts>> }) {
  const posts = use(promise);
  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className="tag"
          style={{
            background: "rgba(244,63,94,0.15)",
            color: "#fda4af",
            borderColor: "rgba(244,63,94,0.3)",
          }}
        >
          DYNAMIC HOLE
        </span>
        <span className="eyebrow" style={{ color: "#f43f5e" }}>
          Posts — streamed ~800ms
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {posts.map((p) => (
          <li key={p.id} className="data-card p-4">
            <p
              style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--color-fg)" }}
            >
              {p.title}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-subtle)" }}>
              {p.excerpt.slice(0, 80)}...
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DynamicAnalytics({ promise }: { promise: Promise<ReturnType<typeof makeAnalytics>> }) {
  const a = use(promise);
  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className="tag"
          style={{
            background: "rgba(244,63,94,0.15)",
            color: "#fda4af",
            borderColor: "rgba(244,63,94,0.3)",
          }}
        >
          DYNAMIC HOLE
        </span>
        <span className="eyebrow" style={{ color: "#f43f5e" }}>
          Analytics — streamed ~1200ms
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <div className="stat-card" style={{ padding: "14px 16px" }}>
          <p className="stat-label">Views</p>
          <p className="stat-value" style={{ fontSize: "1.5rem" }}>
            {a.views.toLocaleString()}
          </p>
        </div>
        <div className="stat-card" style={{ padding: "14px 16px" }}>
          <p className="stat-label">RPM</p>
          <p className="stat-value" style={{ fontSize: "1.5rem" }}>
            {a.rpm.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PPRPage({ loaderData }: Route.ComponentProps) {
  const {
    shellUser,
    shellCacheStatus,
    postsPromise,
    analyticsPromise,
    edgeInfo: _edgeInfo,
    renderedAt: _renderedAt,
    metrics,
  } = loaderData;

  const flowSteps = [
    { icon: "🌐", label: "Request", active: true },
    { icon: "🔍", label: "Cache Check", active: true },
    { icon: "🐚", label: "Shell Instant", active: true },
    { icon: "🕳️", label: "Stream Posts 800ms", active: true },
    { icon: "🕳️", label: "Stream Analytics 1200ms", active: true },
  ];

  return (
    <StrategyPage
      strategy="ppr"
      title="Streaming + Edge Cache"
      icon="🧩"
      description="Combines an edge-cached shell (instant TTFB) with deferred Suspense boundaries for dynamic sections. React Router v8 achieves this via the Cache API + un-awaited promises — conceptually similar to Next.js PPR but implemented differently."
      metrics={metrics}
      cacheStatus={shellCacheStatus}
    >
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="Timeline Visualization" />

      {/* Gantt-style Timeline */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            {
              label: "Shell Paint",
              time: "0ms",
              pct: 15,
              color: "#f43f5e",
              desc: "Edge-cached static structure served instantly",
            },
            {
              label: "Posts Chunk",
              time: "800ms",
              pct: 55,
              color: "#fda4af",
              desc: "First dynamic segment resolves & streams in",
            },
            {
              label: "Analytics Chunk",
              time: "1200ms",
              pct: 90,
              color: "#fda4af",
              desc: "Second dynamic segment completes connection",
            },
          ].map((bar) => (
            <div key={bar.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 700, color: "#cbd5e1" }}>{bar.label}</span>
                <span style={{ color: bar.color, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  {bar.time}
                </span>
              </div>
              <div className="bench-bar" style={{ height: 8, marginBottom: 4 }}>
                <div
                  className="bench-fill"
                  style={{ width: `${bar.pct}%`, background: bar.color }}
                />
              </div>
              <p style={{ margin: 0, fontSize: 10, color: "#475569" }}>{bar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="Split Architecture Demo" />

      {/* Split layout */}
      <section
        style={{
          marginBottom: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {/* Left Column: Shell */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="tag"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                borderColor: "rgba(16,185,129,0.2)",
              }}
            >
              STATIC SHELL
            </span>
            <span className="eyebrow" style={{ color: "#10b981" }}>
              Shell — resolved ~0ms
            </span>
          </div>

          <div
            className="glass-card p-6"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                className="tag"
                style={{
                  background:
                    shellCacheStatus === "HIT" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                  color: shellCacheStatus === "HIT" ? "#10b981" : "#f59e0b",
                  borderColor:
                    shellCacheStatus === "HIT" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                }}
              >
                Shell Cache {shellCacheStatus}
              </span>
              <span style={{ fontSize: 11, color: "#475569" }}>Served via Cache API</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="avatar" style={{ background: shellUser.avatarColor }}>
                {shellUser.initials}
              </div>
              <div>
                <h4 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>
                  {shellUser.name}
                </h4>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                  {shellUser.role} · {shellUser.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic holes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Suspense fallback={<CardSkeleton />}>
            <DynamicPosts promise={postsPromise} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <DynamicAnalytics promise={analyticsPromise} />
          </Suspense>
        </div>
      </section>

      <SectionDivider label="How it works" />
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={PPR_CODE} filename="app/strategies/ppr.tsx" />
      </section>

      <SectionDivider label="Strategy Assessment" />
      <ComparisonPanel
        pros={[
          "Instant shell via Cache API",
          "Dynamic content via Suspense",
          "Best of SSG + SSR combined",
        ]}
        cons={[
          "Cache invalidation complexity",
          "Two different data lifecycles",
          "Requires streaming-capable infra",
        ]}
        related={[
          { to: "/ssg", label: "SSG" },
          { to: "/streaming", label: "Streaming" },
          { to: "/isr", label: "ISR" },
        ]}
      />
    </StrategyPage>
  );
}

const PPR_CODE = `export async function loader({ request }) {
  const seed = liveSeed();
  const cacheKey = new Request(new URL('/ppr-shell-user', request.url).toString());

  let shellUser = makeUser(seed);

  // Serve shell from cache instantly (~0ms)
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    shellUser = await cached.json();
  } else {
    await caches.default.put(cacheKey, new Response(JSON.stringify(shellUser)));
  }

  return {
    shellUser,
    // Stream dynamic sections in the background
    postsPromise: fetchWithDelay(makePosts(seed, 3), 800),
    analyticsPromise: fetchWithDelay(makeAnalytics(seed), 1200),
  };
}`;
