import type { Route } from "./+types/ssr";
import {
  makeUser,
  makePosts,
  makeAnalytics,
  makeActivities,
  fetchWithDelay,
  liveSeed,
} from "~/lib/seed";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";
import { getSimulatedLatency } from "~/lib/latency";
// ─── Loader ─────────────────────────────────────────────────────────────────────
export async function loader({ request, context: _context }: Route.LoaderArgs) {
  const seed = liveSeed();
  const delay = getSimulatedLatency(request, 0);
  const [user, posts, analytics, activities] = await Promise.all([
    fetchWithDelay(makeUser(seed), delay),
    fetchWithDelay(makePosts(seed, 5), delay),
    fetchWithDelay(makeAnalytics(seed), delay),
    fetchWithDelay(makeActivities(seed, 4), delay),
  ]);
  return {
    user,
    posts,
    analytics,
    activities,
    metrics: createMetrics("SSR"),
    edgeInfo: getEdgeInfo(request),
    seed,
    renderedAt: new Date().toISOString(),
  };
}

export function headers() {
  return { "Cache-Control": "no-store, no-cache", "X-Render-Strategy": "SSR" };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function relativeTime(isoTs: string): string {
  const diff = Date.now() - new Date(isoTs).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SSRPage({ loaderData }: Route.ComponentProps) {
  const { user, posts, analytics, activities, edgeInfo, seed, renderedAt } = loaderData;

  const flowSteps = [
    { icon: "🌍", label: "Browser", sublabel: "HTTP request" },
    { icon: "⚡", label: "Edge Worker", sublabel: "no-store cache", active: true },
    { icon: "🔀", label: "Promise.all", sublabel: "parallel fetch", active: true },
    { icon: "📄", label: "HTML Response", sublabel: "fresh every time", active: true },
  ];

  const codeSnippet = `export async function loader({ request }) {
  const seed = liveSeed(); // Rotates every 30s

  // Parallel edge data fetching — no waterfalls
  const [user, posts, analytics] = await Promise.all([
    makeUser(seed),
    makePosts(seed, 5),
    makeAnalytics(seed),
  ]);

  return { user, posts, analytics, renderedAt: new Date().toISOString() };
}

// Every request = fresh HTML. No stale data ever.
// Trade-off: compute cost per request vs SSG's zero compute.`;

  return (
    <StrategyPage
      strategy="ssr"
      title="Server-Side Rendering"
      icon="🖥️"
      description="Every request triggers a fresh render at the edge. Data is always current — no caching, no stale state. The server runs your loader on every single hit."
      metrics={loaderData.metrics}
    >
      {/* ── Flow Diagram ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Request Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="Live Identity — rotates every 30s" />

      {/* ── Identity Card ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        {/* Proof callout */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>🔄</span>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#93c5fd", fontSize: 15 }}>
              SSR Freshness Proof
            </p>
            <p style={{ margin: 0, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
              Reload this page — you'll see a{" "}
              <strong style={{ color: "#e2e8f0" }}>different user every 30 seconds</strong>. SSR is
              always fresh: the loader runs on every request with no caching.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* User profile */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: 16 }}>
            <div className="eyebrow" style={{ color: "#64748b", marginBottom: 16 }}>
              Current User
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div
                className="avatar"
                style={{
                  background: user.avatarColor,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${user.avatarColor}55`,
                }}
              >
                {user.initials}
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 3px",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "var(--color-fg)",
                  }}
                >
                  {user.name}
                </p>
                <p style={{ margin: "0 0 3px", fontSize: 13, color: "#64748b" }}>{user.email}</p>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "rgba(59,130,246,0.2)",
                    color: "#93c5fd",
                    fontWeight: 700,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["📍 City", user.city],
                ["📅 Joined", user.joinedDate],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="data-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <span className="label" style={{ color: "#475569" }}>
                    {label}
                  </span>
                  <span
                    className="value"
                    style={{ color: "#cbd5e1", fontFamily: "ui-monospace, monospace" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Render metadata */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: 16 }}>
            <div className="eyebrow" style={{ color: "#64748b", marginBottom: 16 }}>
              Render Metadata
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Seed
                </p>
                <p
                  className="metric-value"
                  style={{
                    margin: 0,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 22,
                    color: "#3b82f6",
                  }}
                >
                  {seed}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#475569" }}>
                  Rotates every 30s via liveSeed()
                </p>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Rendered At
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: "#93c5fd",
                    wordBreak: "break-all",
                  }}
                >
                  {renderedAt}
                </p>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Cache-Control
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: "#ef4444",
                  }}
                >
                  no-store, no-cache
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider label="Cloudflare Edge Information" />

      {/* ── Edge Panel ────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          className="terminal"
          style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div
            className="terminal-header"
            style={{
              background: "rgba(59,130,246,0.1)",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
                <div
                  key={i}
                  style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
                />
              ))}
            </div>
            <span
              style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 12, color: "#475569" }}
            >
              cloudflare-edge-context
            </span>
          </div>
          <div
            className="terminal-body"
            style={{ padding: "20px 24px", background: "rgba(0,0,0,0.4)" }}
          >
            {[
              { label: "colo", value: edgeInfo.colo },
              { label: "city", value: edgeInfo.city },
              { label: "country", value: edgeInfo.country },
              { label: "region", value: edgeInfo.region },
              { label: "timezone", value: edgeInfo.timezone },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="data-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: 13,
                }}
              >
                <span className="label" style={{ color: "#475569", fontFamily: "monospace" }}>
                  cf.<span style={{ color: "#93c5fd" }}>{label}</span>
                </span>
                <span
                  className="value"
                  style={{
                    color: "#e2e8f0",
                    fontFamily: "monospace",
                    background: "rgba(59,130,246,0.1)",
                    padding: "2px 10px",
                    borderRadius: 6,
                  }}
                >
                  {value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider label="Analytics Snapshot" />

      {/* ── Analytics Grid ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              label: "Page Views",
              value: fmt(analytics.views),
              sub: "last 30 days",
              color: "#3b82f6",
            },
            { label: "Visitors", value: fmt(analytics.visitors), sub: "unique", color: "#6366f1" },
            {
              label: "RPM",
              value: `$${analytics.rpm.toFixed(2)}`,
              sub: "revenue/1000",
              color: "#10b981",
            },
            {
              label: "Bounce Rate",
              value: `${analytics.bounceRate}%`,
              sub: "lower = better",
              color: "#f59e0b",
            },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="stat-card"
              style={{
                padding: "22px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                borderTop: `3px solid ${color}`,
              }}
            >
              <p
                className="stat-label"
                style={{
                  margin: "0 0 8px",
                  fontSize: 12,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </p>
              <p
                className="stat-value metric-value"
                style={{
                  margin: "0 0 4px",
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "ui-monospace, monospace",
                  color,
                }}
              >
                {value}
              </p>
              <p className="stat-sub" style={{ margin: 0, fontSize: 11, color: "#334155" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="Activity Feed" />

      {/* ── Activity Feed ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {activities.map((activity) => (
            <li
              key={activity.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                transition: "background 0.15s",
              }}
            >
              <div
                className="avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: stringToColor(activity.actor),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {activity.actor
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, color: "#e2e8f0" }}>
                  <strong style={{ color: "var(--color-fg)" }}>{activity.actor}</strong>{" "}
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>{activity.action}</span>{" "}
                  <span style={{ color: "#94a3b8" }}>{activity.target}</span>
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "ui-monospace, monospace",
                  color: "#334155",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {relativeTime(activity.ts)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SectionDivider label="Loader Pattern" />

      {/* ── Code snippet ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={codeSnippet} filename="app/strategies/ssr.tsx" />
      </section>

      {/* ── Posts ─────────────────────────────────────────────────────────────── */}
      <SectionDivider label="Rendered Posts" />
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="data-card"
              style={{
                padding: "20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-fg)",
                  lineHeight: 1.4,
                }}
              >
                {post.title}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="tag"
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      background: "rgba(59,130,246,0.15)",
                      color: "#93c5fd",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#334155",
                }}
              >
                <span>by {post.author}</span>
                <span>{fmt(post.views)} views</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────────── */}
      <ComparisonPanel
        pros={[
          "Always-fresh data per request",
          "Full Cloudflare metadata access",
          "Parallel edge data fetching",
        ]}
        cons={[
          "Compute cost on every request",
          "Higher TTFB than cached strategies",
          "No automatic CDN caching",
        ]}
        related={[
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
          { to: "/isr", label: "ISR", key: "ISR" },
        ]}
      />
    </StrategyPage>
  );
}

// ─── Util ────────────────────────────────────────────────────────────────────
function stringToColor(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 60%, 40%)`;
}
