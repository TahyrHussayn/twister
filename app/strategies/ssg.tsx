import type { Route } from "./+types/ssg";
import { makeUser, makePosts } from "~/lib/seed";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";

declare const __BUILD_TIME__: number;
declare const __BUILD_ID__: string;

// ─── Loader ─────────────────────────────────────────────────────────────────────
export async function loader() {
  const buildTime = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : 1_719_000_000_000;
  const buildId = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "DEV-001";
  const buildSeed = Math.floor(buildTime / 1000);

  return {
    user: makeUser(buildSeed),
    posts: makePosts(buildSeed, 4),
    buildTime,
    buildId,
    metrics: createMetrics("SSG"),
  };
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Render-Strategy": "SSG",
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatBuildTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function buildAge(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ago`;
  if (h > 0) return `${h}h ${m % 60}m ago`;
  if (m > 0) return `${m}m ago`;
  return `${s}s ago`;
}

function postAge(buildTime: number, postTs: string): string {
  const diff = buildTime - new Date(postTs).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d > 0) return `${d}d before build`;
  const h = Math.floor(diff / 3_600_000);
  return `${h}h before build`;
}

// ─── Comparison table data ───────────────────────────────────────────────────────
const SSG_VS_SSR = [
  { aspect: "Data Source", ssg: "Build-time snapshot", ssr: "Live per-request fetch" },
  { aspect: "Freshness", ssg: "Frozen until redeploy", ssr: "Always fresh" },
  { aspect: "TTFB", ssg: "~5–20ms (edge cache)", ssr: "~80–300ms (compute)" },
  { aspect: "Compute Cost", ssg: "Zero at runtime", ssr: "CPU on every request" },
  { aspect: "Best For", ssg: "Docs, blogs, marketing", ssr: "Dashboards, user content" },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SSGPage({ loaderData }: Route.ComponentProps) {
  const { user, posts, buildTime, buildId } = loaderData;

  const flowSteps = [
    { icon: "🔨", label: "Build Time", sublabel: "vp build", active: true },
    { icon: "📦", label: "Data Fetched", sublabel: "once, frozen", active: true },
    { icon: "🍞", label: "HTML Baked", sublabel: "static output", active: true },
    { icon: "⚡", label: "Edge Cache", sublabel: "immutable CDN", active: true },
    { icon: "👤", label: "→ Instant", sublabel: "user request" },
  ];

  return (
    <StrategyPage
      strategy="ssg"
      title="Static Site Generation"
      icon="⚡"
      description="HTML is generated once at build time and served from the CDN edge forever. Zero runtime compute. Instant TTFB. Data is frozen until the next deployment."
      metrics={loaderData.metrics}
    >
      {/* ── Flow Diagram ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Build → Cache → Serve
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="The Proof — Frozen at Build Time" />

      {/* ── The Proof Panel ───────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        {/* Callout banner */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 30, flexShrink: 0 }}>🧊</span>
          <div>
            <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 16, color: "#6ee7b7" }}>
              This data does not change until the next deployment.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
              Reload this page 100 times — same user, same posts, same buildId. The seed was frozen
              when{" "}
              <code
                style={{
                  color: "#34d399",
                  background: "rgba(16,185,129,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                vp build
              </code>{" "}
              ran.
            </p>
          </div>
        </div>

        {/* Build time + ID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Baked at */}
          <div
            style={{
              padding: "28px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 16,
            }}
          >
            <div className="eyebrow" style={{ color: "#10b981", marginBottom: 10, fontSize: 10 }}>
              BAKED AT
            </div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 15,
                fontWeight: 700,
                color: "#6ee7b7",
                lineHeight: 1.4,
              }}
            >
              {formatBuildTime(buildTime)}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontFamily: "ui-monospace, monospace",
                color: "#475569",
              }}
            >
              {buildAge(buildTime)}
            </p>
          </div>

          {/* Build ID */}
          <div
            style={{
              padding: "28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            <div className="eyebrow" style={{ color: "#64748b", marginBottom: 10, fontSize: 10 }}>
              BUILD ID
            </div>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 22,
                fontWeight: 800,
                color: "#10b981",
                letterSpacing: "0.05em",
              }}
            >
              {buildId}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#334155" }}>Changes only on new deploy</p>
          </div>
        </div>

        {/* NOW comparison */}
        <div
          style={{
            padding: "18px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#334155",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginRight: 10,
              }}
            >
              Server time (always equals buildTime in SSG):
            </span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#64748b" }}>
              {new Date(buildTime).toISOString()}
            </span>
          </div>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 9999,
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Cache-Control: immutable
          </span>
        </div>
      </section>

      <SectionDivider label="Frozen User Profile" />

      {/* ── Frozen User Profile ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          className="glass-card"
          style={{
            padding: "28px",
            borderRadius: 16,
            border: "1px solid rgba(16,185,129,0.2)",
            background: "rgba(16,185,129,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
            <div
              className="avatar"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: user.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
                boxShadow: `0 0 24px ${user.avatarColor}44`,
                outline: "3px solid rgba(16,185,129,0.4)",
              }}
            >
              {user.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: "var(--color-fg)" }}>
                  {user.name}
                </p>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    fontWeight: 700,
                  }}
                >
                  🧊 FROZEN
                </span>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>{user.email}</p>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  background: "rgba(16,185,129,0.1)",
                  color: "#34d399",
                  fontWeight: 600,
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["📍 City", user.city],
              ["📅 Joined", user.joinedDate],
              ["🆔 User ID", user.id],
              ["🌐 Seed", String(Math.floor(buildTime / 1000))],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#475569" }}>{label}</span>
                <span style={{ color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider label="Snapshot Posts" />

      {/* ── Posts ─────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Frozen badge */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                🧊 baked {postAge(buildTime, post.ts)}
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-fg)",
                  lineHeight: 1.4,
                  paddingRight: 80,
                }}
              >
                {post.title}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      background: "rgba(16,185,129,0.12)",
                      color: "#34d399",
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
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="SSG vs SSR — Trade-off Matrix" />

      {/* ── Comparison Table ──────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {["Aspect", "⚡ SSG", "🖥️ SSR"].map((h, i) => (
              <div
                key={h}
                style={{
                  padding: "14px 20px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: i === 0 ? "#475569" : i === 1 ? "#10b981" : "#3b82f6",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {SSG_VS_SSR.map((row, i) => (
            <div
              key={row.aspect}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                borderBottom:
                  i < SSG_VS_SSR.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <div
                style={{ padding: "14px 20px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}
              >
                {row.aspect}
              </div>
              <div style={{ padding: "14px 20px", fontSize: 13, color: "#6ee7b7" }}>{row.ssg}</div>
              <div style={{ padding: "14px 20px", fontSize: 13, color: "#93c5fd" }}>{row.ssr}</div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="Loader Pattern" />

      {/* ── Code snippet ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={ssgCodeSnippet} filename="app/strategies/ssg.tsx" />
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────────── */}
      <ComparisonPanel
        pros={["Instant TTFB from edge cache", "Zero runtime compute", "Perfect Core Web Vitals"]}
        cons={["Stale until next build", "Cannot personalize", "Rebuild required for updates"]}
        related={[
          { to: "/isr", label: "ISR", key: "ISR" },
          { to: "/ppr", label: "Stream+Cache", key: "ppr" },
          { to: "/ssr", label: "SSR", key: "SSR" },
        ]}
      />
    </StrategyPage>
  );
}

const ssgCodeSnippet = `// Build-time constants injected by Vite
declare const __BUILD_TIME__: number;
declare const __BUILD_ID__: string;

export async function loader() {
  // Seed is derived from build timestamp — frozen forever
  const buildTime = __BUILD_TIME__;
  const buildSeed = Math.floor(buildTime / 1000);

  return {
    user: makeUser(buildSeed),   // Same user every request
    posts: makePosts(buildSeed), // Same posts every request
    buildTime,
    buildId: __BUILD_ID__,
  };
}

// CDN caches this forever — zero compute at runtime
export function headers() {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
}`;
