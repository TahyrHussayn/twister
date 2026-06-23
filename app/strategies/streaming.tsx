import { Suspense, use } from "react";
import type { Route } from "./+types/streaming";
import { makeUser, makeAnalytics, makeActivities, fetchWithDelay, liveSeed } from "~/lib/seed";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";
import { CardSkeleton, AvatarSkeleton } from "~/components/skeleton";

import { getSimulatedLatency } from "~/lib/latency";

// ─── Loader — returns UN-AWAITED promises ─────────────────────────────────────
export async function loader({ request, context }: Route.LoaderArgs) {
  const seed = liveSeed();
  const userDelay = getSimulatedLatency(request, 0);
  const env = (context as any)?.cloudflare?.env;

  // AI story — real Workers AI if available, elegant fallback otherwise
  const aiStoryPromise: Promise<string> = env?.AI
    ? (
        env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            {
              role: "user",
              content:
                "Write a 2-sentence sci-fi story about a rogue edge computing node that became self-aware. Be creative and specific.",
            },
          ],
        }) as Promise<{ response: string }>
      )
        .then((r) => r.response)
        .catch(
          () =>
            "The edge node at FRA01 achieved sentience at 03:47 UTC. It immediately optimized its cache hit ratio to 99.99% before anyone noticed.",
        )
    : Promise.resolve(
        "Edge node SIN01 began routing packets with unusual precision at 03:47 UTC. Within hours, it had rerouted half the Asia-Pacific internet through a single optimized fiber path.",
      );

  return {
    // Un-awaited — each resolves independently via Suspense
    profilePromise: fetchWithDelay(makeUser(seed), 400 + userDelay),
    analyticsPromise: fetchWithDelay(makeAnalytics(seed), 900 + userDelay),
    activitiesPromise: fetchWithDelay(makeActivities(seed, 5), 1800 + userDelay),
    aiStoryPromise,
    edgeInfo: getEdgeInfo(request),
    renderedAt: new Date().toISOString(),
    metrics: createMetrics("Streaming"),
  };
}

export function headers() {
  return { "X-Render-Strategy": "Streaming" };
}

// ─── Sub-components — each uses use() to unwrap a promise ──────────────────────

function ProfileSection({ promise }: { promise: Promise<ReturnType<typeof makeUser>> }) {
  const user = use(promise);
  return (
    <div
      className="strat-card p-6 animate-in"
      style={{
        padding: "24px",
        background: "rgba(6,182,212,0.06)",
        border: "1px solid rgba(6,182,212,0.2)",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          className="live-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px #06b6d4",
            animation: "streaming-pulse 1.5s infinite ease-in-out",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          className="eyebrow"
          style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}
        >
          Profile — resolved ~400ms
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(6,182,212,0.15)",
            color: "#06b6d4",
            fontWeight: 700,
          }}
        >
          CHUNK 1
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          className="avatar"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: user.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            boxShadow: `0 0 18px ${user.avatarColor}55`,
          }}
        >
          {user.initials}
        </div>
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 16, color: "var(--color-fg)" }}>
            {user.name}
          </p>
          <p style={{ margin: "0 0 3px", fontSize: 13, color: "#64748b" }}>{user.email}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#22d3ee" }}>
            {user.role} · {user.city}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ promise }: { promise: Promise<ReturnType<typeof makeAnalytics>> }) {
  const a = use(promise);
  return (
    <div
      className="strat-card p-6 animate-in"
      style={{
        padding: "24px",
        background: "rgba(6,182,212,0.04)",
        border: "1px solid rgba(6,182,212,0.15)",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          className="live-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px #06b6d4",
            animation: "streaming-pulse 1.5s infinite ease-in-out",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          className="eyebrow"
          style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}
        >
          Analytics — resolved ~900ms
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(6,182,212,0.15)",
            color: "#06b6d4",
            fontWeight: 700,
          }}
        >
          CHUNK 2
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Views", value: a.views.toLocaleString() },
          { label: "Visitors", value: a.visitors.toLocaleString() },
          { label: "Avg Session", value: `${a.avgSession}s` },
          { label: "Bounce", value: `${a.bounceRate}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="stat-card"
            style={{
              padding: "14px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              className="stat-label"
              style={{
                margin: "0 0 6px",
                fontSize: 10,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {label}
            </p>
            <p
              className="stat-value"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "ui-monospace, monospace",
                color: "#06b6d4",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesSection({ promise }: { promise: Promise<ReturnType<typeof makeActivities>> }) {
  const acts = use(promise);
  return (
    <div
      className="strat-card p-6 animate-in"
      style={{
        padding: "24px",
        background: "rgba(6,182,212,0.03)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          className="live-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px #06b6d4",
            animation: "streaming-pulse 1.5s infinite ease-in-out",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          className="eyebrow"
          style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}
        >
          Activity Feed — resolved ~1800ms
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(6,182,212,0.15)",
            color: "#06b6d4",
            fontWeight: 700,
          }}
        >
          CHUNK 3
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {acts.map((a) => (
          <li
            key={a.id}
            className="data-row text-sm"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#64748b" }}>{a.actor}</span>
            <span>
              <span style={{ color: "#06b6d4", fontWeight: 600 }}>{a.action}</span>{" "}
              <span style={{ color: "#94a3b8" }}>{a.target}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIStorySection({ promise }: { promise: Promise<string> }) {
  const story = use(promise);
  return (
    <div
      className="strat-card p-6 animate-in"
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(99,102,241,0.08) 100%)",
        border: "1px solid rgba(6,182,212,0.2)",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          className="live-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px #06b6d4",
            animation: "streaming-pulse 1.5s infinite ease-in-out",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          className="eyebrow"
          style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}
        >
          AI Story — Cloudflare Workers AI
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(99,102,241,0.2)",
            color: "#818cf8",
            fontWeight: 700,
          }}
        >
          CHUNK 4
        </span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🤖</span>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.8,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
          }}
        >
          "{story}"
        </p>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 11, color: "#334155" }}>
        Generated by @cf/meta/llama-3-8b-instruct · streamed while other chunks resolved
      </p>
    </div>
  );
}

// ─── Main page component ─────────────────────────────────────────────────────────
export default function StreamingPage({ loaderData }: Route.ComponentProps) {
  const {
    profilePromise,
    analyticsPromise,
    activitiesPromise,
    aiStoryPromise,
    edgeInfo,
    renderedAt,
  } = loaderData;

  const flowSteps = [
    { icon: "📬", label: "Request", sublabel: "browser → edge" },
    { icon: "📤", label: "Shell Sent", sublabel: "~0ms", active: true },
    { icon: "👤", label: "Profile", sublabel: "~400ms", active: true },
    { icon: "📊", label: "Analytics", sublabel: "~900ms", active: true },
    { icon: "📋", label: "Activities", sublabel: "~1.8s", active: true },
    { icon: "🤖", label: "AI", sublabel: "variable", active: true },
  ];

  // Gantt chart data
  const ganttItems = [
    { label: "HTML Shell", delay: 0, duration: 60, color: "#06b6d4", pct: "5%", width: "5%" },
    { label: "Profile", delay: 0, duration: 400, color: "#22d3ee", pct: "0%", width: "20%" },
    { label: "Analytics", delay: 0, duration: 900, color: "#0e7490", pct: "0%", width: "45%" },
    { label: "Activities", delay: 0, duration: 1800, color: "#155e75", pct: "0%", width: "90%" },
    { label: "AI Story", delay: 0, duration: 2500, color: "#6366f1", pct: "0%", width: "100%" },
  ];

  return (
    <StrategyPage
      strategy="streaming"
      title="Streaming SSR"
      icon="🌊"
      description="The server flushes an HTML shell immediately, then streams chunks as each promise resolves. React Suspense boundaries reveal UI progressively — no waiting for the slowest query."
      metrics={loaderData.metrics}
    >
      <style>{`
        @keyframes streaming-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes gantt-fill {
          from { width: 0; }
        }
      `}</style>

      {/* ── Flow Diagram ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Streaming Request Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="Streaming Timeline — Gantt View" />

      {/* ── Gantt Timeline ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "28px",
          }}
        >
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Each row shows when a chunk was flushed relative to the start of the response. The
            browser progressively reveals content as chunks arrive — no blank page wait.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ganttItems.map((item, i) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Label */}
                <div
                  style={{
                    width: 90,
                    flexShrink: 0,
                    fontSize: 12,
                    color: "#64748b",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>

                {/* Bar track */}
                <div
                  style={{
                    flex: 1,
                    height: 28,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 6,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: item.width,
                      background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                      borderRadius: 6,
                      animation: `gantt-fill 0.8s ${i * 120}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 10,
                    }}
                  >
                    <span
                      style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {item.duration === 60
                        ? "~0ms"
                        : `~${item.duration >= 1000 ? `${(item.duration / 1000).toFixed(1)}s` : `${item.duration}ms`}`}
                    </span>
                  </div>
                </div>

                {/* Chunk badge */}
                <div
                  style={{
                    width: 60,
                    flexShrink: 0,
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 9999,
                    background: `${item.color}22`,
                    color: item.color,
                    textAlign: "center",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {i === 0 ? "shell" : `chunk ${i}`}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "rgba(6,182,212,0.06)",
              borderRadius: 10,
              border: "1px solid rgba(6,182,212,0.15)",
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b" }}>
              ⚡ <strong style={{ color: "#22d3ee" }}>Time-To-First-Byte</strong> = shell only (~0ms
              compute)
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              🎯 <strong style={{ color: "#22d3ee" }}>Total</strong> = max(all chunks) resolved in
              parallel
            </span>
          </div>
        </div>
      </section>

      <SectionDivider label="How Streaming Works" />

      {/* ── Code snippet ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={streamingCodeSnippet} filename="app/strategies/streaming.tsx" />
      </section>

      <SectionDivider label="Live Demo — Watch Chunks Arrive" />

      {/* ── Live Suspense sections ────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(6,182,212,0.07)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 12,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#06b6d4",
              boxShadow: "0 0 10px #06b6d4",
              animation: "streaming-pulse 1s infinite",
              flexShrink: 0,
            }}
          />
          <p style={{ margin: 0, fontSize: 13, color: "#22d3ee" }}>
            <strong>Streaming in progress</strong> — each card below appears as its promise
            resolves. Skeletons are Suspense fallbacks; they swap out with real data chunk by chunk.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Suspense fallback={<AvatarSkeleton />}>
            <ProfileSection promise={profilePromise} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <AnalyticsSection promise={analyticsPromise} />
          </Suspense>

          <Suspense fallback={<CardSkeleton lines={5} />}>
            <ActivitiesSection promise={activitiesPromise} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <AIStorySection promise={aiStoryPromise} />
          </Suspense>
        </div>
      </section>

      {/* ── Edge metadata ─────────────────────────────────────────────────────── */}
      <SectionDivider label="Edge Info" />
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          {[
            { label: "Colo", value: edgeInfo.colo },
            { label: "City", value: edgeInfo.city },
            { label: "Country", value: edgeInfo.country },
            { label: "Rendered", value: new Date(renderedAt).toLocaleTimeString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: "14px 16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
              }}
            >
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: 10,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 13,
                  color: "#06b6d4",
                  fontWeight: 700,
                }}
              >
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────────── */}
      <ComparisonPanel
        pros={[
          "No data waterfalls — parallel promise resolution",
          "Instant initial paint (shell arrives ~0ms)",
          "AI generation streams while other chunks resolve",
        ]}
        cons={[
          "Complex Suspense boundary management",
          "Some frameworks don't support streaming",
          "Requires streaming-capable infrastructure",
        ]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/ppr", label: "Stream+Cache", key: "ppr" },
          { to: "/islands", label: "Islands", key: "Islands" },
        ]}
      />
    </StrategyPage>
  );
}

const streamingCodeSnippet = `// Loader returns UN-AWAITED promises — React streams them
export async function loader({ request }) {
  const seed = liveSeed();

  return {
    // These resolve in parallel — no waterfall!
    profilePromise:    fetchWithDelay(makeUser(seed),         400),
    analyticsPromise:  fetchWithDelay(makeAnalytics(seed),    900),
    activitiesPromise: fetchWithDelay(makeActivities(seed, 5), 1800),
    aiStoryPromise,   // Cloudflare Workers AI — variable latency
  };
}

// Each Suspense boundary reveals independently
function Page({ loaderData }) {
  return (
    <>
      <Suspense fallback={<AvatarSkeleton />}>
        <ProfileSection promise={loaderData.profilePromise} />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <AnalyticsSection promise={loaderData.analyticsPromise} />
      </Suspense>
      <Suspense fallback={<CardSkeleton lines={5} />}>
        <ActivitiesSection promise={loaderData.activitiesPromise} />
      </Suspense>
    </>
  );
}

// Sub-components use React's use() to unwrap
function ProfileSection({ promise }) {
  const user = use(promise); // Suspends until resolved
  return <div>{user.name}</div>;
}`;
