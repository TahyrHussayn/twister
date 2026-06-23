import type { Route } from "./+types/dashboard";
import { NavLink, useFetcher } from "react-router";

// ─── Strategy cards ────────────────────────────────────────────────────────────
const CARDS = [
  {
    key: "ssr",
    to: "/ssr",
    icon: "🖥️",
    name: "SSR",
    fullName: "Server-Side Rendering",
    desc: "Per-request HTML rendered at the edge",
    color: "#3b82f6",
  },
  {
    key: "csr",
    to: "/csr",
    icon: "🌐",
    name: "CSR",
    fullName: "Client-Side Rendering",
    desc: "Shell served instantly, browser renders",
    color: "#8b5cf6",
  },
  {
    key: "ssg",
    to: "/ssg",
    icon: "⚡",
    name: "SSG",
    fullName: "Static Site Generation",
    desc: "HTML baked at build, cached forever",
    color: "#10b981",
  },
  {
    key: "streaming",
    to: "/streaming",
    icon: "🌊",
    name: "Streaming",
    fullName: "Streaming SSR",
    desc: "Progressive rendering with Suspense",
    color: "#06b6d4",
  },
  {
    key: "isr",
    to: "/isr",
    icon: "🔄",
    name: "ISR",
    fullName: "Incremental Static Regen",
    desc: "Cached response, revalidated on schedule",
    color: "#f59e0b",
  },
  {
    key: "ppr",
    to: "/ppr",
    icon: "🧩",
    name: "Stream+Cache",
    fullName: "Streaming + Edge Cache",
    desc: "Instant shell, dynamic holes streamed",
    color: "#f43f5e",
  },
  {
    key: "islands",
    to: "/islands",
    icon: "🏝️",
    name: "Islands",
    fullName: "React Islands",
    desc: "Isolated hydration per component",
    color: "#14b8a6",
  },
  {
    key: "htmx",
    to: "/htmx",
    icon: "⚡",
    name: "HTMX",
    fullName: "HTMX Hypermedia",
    desc: "HTML fragments, no client JS framework",
    color: "#6366f1",
  },
  {
    key: "hybrid",
    to: "/hybrid",
    icon: "🧬",
    name: "Hybrid",
    fullName: "Hybrid Rendering",
    desc: "Static shell + client dynamic layer",
    color: "#a855f7",
  },
  {
    key: "edge-vs-origin",
    to: "/edge-vs-origin",
    icon: "⏱️",
    name: "Edge vs Origin",
    fullName: "Edge vs Origin",
    desc: "Latency comparison benchmark",
    color: "#ef4444",
  },
];

// ─── Types ──────────────────────────────────────────────────────────────────────
type BenchResult = { strategy: string; ttfb: number; cached: boolean; cacheStatus: string };

// ─── Loader ─────────────────────────────────────────────────────────────────────
export async function loader({ request: _request, context }: Route.LoaderArgs) {
  const cf = (context as any)?.cloudflare?.cf as CfProperties | undefined;
  return {
    colo: cf?.colo ?? "UNKNOWN",
    country: cf?.country ?? "Unknown",
  };
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { colo, country } = loaderData as { colo: string; country: string };
  const fetcher = useFetcher<{ results: BenchResult[] }>();

  const isRunning = fetcher.state !== "idle";
  const results: BenchResult[] = fetcher.data?.results ?? [];
  const sorted = [...results].sort((a, b) => a.ttfb - b.ttfb);
  const maxTtfb = sorted.length > 0 ? sorted[sorted.length - 1].ttfb : 1;

  const handleBenchmark = () => {
    void fetcher.submit({}, { method: "post", action: "/api/benchmark" });
  };

  return (
    <div
      style={{
        background: "#0c0d1a",
        minHeight: "100vh",
        color: "#e2e8f0",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <div
            className="eyebrow animate-in"
            style={{ marginBottom: 16, color: "#a78bfa", letterSpacing: "0.2em" }}
          >
            Mission Control
          </div>

          <h1
            className="display animate-in"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 900,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            Twister
          </h1>

          <p
            className="animate-in-up"
            style={{
              fontSize: 18,
              color: "#94a3b8",
              maxWidth: 560,
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}
          >
            A live observatory of web rendering strategies on{" "}
            <strong style={{ color: "#e2e8f0" }}>Cloudflare Workers</strong>. Explore SSR, CSR, SSG,
            Streaming, ISR and beyond — all running at the edge.
          </p>

          {/* Colo badge */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                border: "1px solid rgba(99,102,241,0.4)",
                borderRadius: 9999,
                background: "rgba(99,102,241,0.1)",
                fontSize: 13,
                fontFamily: "ui-monospace, monospace",
                color: "#a78bfa",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#6366f1",
                  boxShadow: "0 0 8px #6366f1",
                  display: "inline-block",
                }}
              />
              Edge: <strong>{colo}</strong> · {country}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.03)",
                fontSize: 13,
                color: "#64748b",
              }}
            >
              React Router v8 · Cloudflare Workers · Vite+
            </span>
          </div>
        </div>
      </section>

      {/* ── Strategy Grid ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "#64748b", marginBottom: 6 }}>
              Rendering Strategies
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-fg)" }}>
              Pick a strategy to explore
            </h2>
          </div>
          <span
            style={{
              fontSize: 13,
              color: "#475569",
              padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
            }}
          >
            {CARDS.length} strategies
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {CARDS.map((card, i) => (
            <NavLink
              key={card.key}
              to={card.to}
              className={`strategy-nav-card strat-${card.key}`}
              style={{
                display: "block",
                textDecoration: "none",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                padding: "20px 20px 20px 0",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                animationDelay: `${i * 40}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  `0 12px 40px ${card.color}22`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${card.color}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              {/* Left accent border */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: card.color,
                  borderRadius: "14px 0 0 14px",
                }}
              />

              <div style={{ paddingLeft: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 26 }}>{card.icon}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 9999,
                      background: `${card.color}22`,
                      color: card.color,
                      fontWeight: 700,
                      fontFamily: "ui-monospace, monospace",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {card.name}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--color-fg)",
                    margin: "0 0 4px",
                  }}
                >
                  {card.fullName}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                  {card.desc}
                </p>

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: card.color, fontWeight: 600 }}>
                    Explore →
                  </span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ── Benchmark Section ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 8,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow" style={{ color: "#64748b", marginBottom: 6 }}>
                Live Performance
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--color-fg)" }}>
                Live Client Benchmark
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, maxWidth: 480 }}>
                Measures server-to-server TTFB from this Cloudflare Worker to each strategy route.
                Results reflect real edge latency, cache status, and response times.
              </p>
            </div>

            <button
              onClick={handleBenchmark}
              disabled={isRunning}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                border: "none",
                background: isRunning
                  ? "rgba(99,102,241,0.3)"
                  : "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: isRunning ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {isRunning ? (
                <>
                  <SpinnerDots />
                  Running…
                </>
              ) : (
                <>⚡ Run Benchmark</>
              )}
            </button>
          </div>

          {/* Results */}
          {results.length === 0 && !isRunning && (
            <div
              style={{
                marginTop: 32,
                padding: "40px 24px",
                textAlign: "center",
                border: "2px dashed rgba(255,255,255,0.06)",
                borderRadius: 12,
                color: "#475569",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
              <p style={{ margin: 0, fontSize: 14 }}>
                Click "Run Benchmark" to measure TTFB across all strategy routes
              </p>
            </div>
          )}

          {isRunning && (
            <div style={{ marginTop: 32 }}>
              {CARDS.slice(0, 6).map((c, i) => (
                <div key={c.key} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    <span>
                      {c.icon} {c.name}
                    </span>
                    <span style={{ fontFamily: "monospace" }}>…ms</span>
                  </div>
                  <div className="bench-bar">
                    <div
                      className="bench-fill skeleton"
                      style={{ width: `${20 + i * 12}%`, background: "rgba(255,255,255,0.08)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {sorted.length > 0 && !isRunning && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <span>Strategy</span>
                <span>TTFB (ms) · Cache Status</span>
              </div>

              {sorted.map((r, i) => {
                const card = CARDS.find(
                  (c) => c.key === r.strategy.toLowerCase().replace(/[\s+]+/g, "-"),
                );
                const color = card?.color ?? "#6366f1";
                const pct = Math.max(4, (r.ttfb / maxTtfb) * 100);
                return (
                  <div key={r.strategy} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: color,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "#000",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
                          {r.strategy}
                        </span>
                        {i === 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 9999,
                              background: "rgba(16,185,129,0.2)",
                              color: "#10b981",
                              fontWeight: 700,
                            }}
                          >
                            FASTEST
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 13,
                            color: "var(--color-fg)",
                            fontWeight: 700,
                          }}
                        >
                          {r.ttfb}ms
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 9999,
                            background: r.cached
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(245,158,11,0.15)",
                            color: r.cached ? "#10b981" : "#f59e0b",
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }}
                        >
                          {r.cacheStatus}
                        </span>
                      </div>
                    </div>
                    <div
                      className="bench-bar"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 6,
                        overflow: "hidden",
                        height: 8,
                      }}
                    >
                      <div
                        className="bench-fill"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}cc, ${color})`,
                          height: "100%",
                          borderRadius: 6,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Compare CTA ───────────────────────────────────────────────────────── */}
      <section
        style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px", textAlign: "center" }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.12) 100%)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 20,
            padding: "48px 40px",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: "var(--color-fg)" }}>
            Compare Strategies Side-by-Side
          </h2>
          <p style={{ fontSize: 15, color: "#64748b", marginBottom: 28, lineHeight: 1.7 }}>
            Deep-dive into the trade-offs: TTFB, freshness, compute cost, caching behaviour, and
            when to pick each strategy for your use case.
          </p>
          <NavLink
            to="/compare"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Open Comparison Table →
          </NavLink>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 24px",
          textAlign: "center",
          fontSize: 13,
          color: "#334155",
        }}
      >
        <span>React Router v8</span>
        <span style={{ margin: "0 10px", opacity: 0.4 }}>·</span>
        <span>Cloudflare Workers</span>
        <span style={{ margin: "0 10px", opacity: 0.4 }}>·</span>
        <span>Tailwind CSS v4</span>
        <span style={{ margin: "0 10px", opacity: 0.4 }}>·</span>
        <span>Vite+</span>
      </footer>
    </div>
  );
}

// ─── Spinner dots ────────────────────────────────────────────────────────────
function SpinnerDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.7,
            animation: `bounce 0.9s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
