import type { ReactNode } from "react";
import { STRATEGY_METADATA } from "~/lib/strategy-metadata";

type StrategyPageProps = {
  strategy: string;
  title: string;
  accent?: string;
  icon?: string;
  description: ReactNode;
  metrics?: { ttfb: number; strategy: string };
  cacheStatus?: string;
  children: ReactNode;
};

function generateTelemetryLogs(strategy: string, ttfb: number, cacheStatus?: string): string[] {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  const logs: string[] = [];
  logs.push(`[${time}] → Incoming HTTP GET request for /${strategy}`);

  if (strategy === "ssr") {
    logs.push(`[${time}] ⚡ Running Cloudflare Worker compute handler`);
    logs.push(
      `[${time}] 🔀 Triggered parallel seed data fetch (makeUser, makePosts, makeAnalytics, makeActivities)`,
    );
    logs.push(`[${time}] 🟢 Fetched fresh edge data successfully`);
    logs.push(`[${time}] 📄 Built entire HTML markup and sent to client`);
  } else if (strategy === "csr") {
    logs.push(`[${time}] 📄 Serving empty HTML shell to browser`);
    logs.push(`[${time}] 💧 React hydrates and executes clientLoader`);
    logs.push(`[${time}] 📁 Accessing localStorage cache for user state`);
    logs.push(`[${time}] 📦 Product list seeded locally at client side`);
  } else if (strategy === "ssg") {
    logs.push(`[${time}] ⚡ Checking Cloudflare Edge CDN cache`);
    logs.push(`[${time}] 🟢 Cache HIT (public, max-age=31536000, immutable)`);
    logs.push(`[${time}] 📄 Serving static HTML snapshot baked at build time`);
  } else if (strategy === "streaming") {
    logs.push(`[${time}] ⚡ Sending partial HTTP response headers immediately`);
    logs.push(`[${time}] 🐚 Rendered static page layout shell in 0ms`);
    logs.push(`[${time}] 🌊 Streaming un-awaited dynamic promises sequentially...`);
    logs.push(`[${time}] 📦 Chunk 1 (Profile) resolved and flushed (~400ms)`);
    logs.push(`[${time}] 📊 Chunk 2 (Analytics) resolved and flushed (~900ms)`);
    logs.push(`[${time}] 🕒 Chunk 3 (Activity Feed) resolved and flushed (~1800ms)`);
  } else if (strategy === "isr") {
    logs.push(`[${time}] ⚡ Checking Cloudflare Cache API`);
    if (cacheStatus === "HIT") {
      logs.push(`[${time}] 🟢 Cache HIT (age < 60s). Serving instant stored copy.`);
    } else if (cacheStatus === "STALE") {
      logs.push(
        `[${time}] 🔀 Cache STALE (age ≥ 60s). Serving cached copy + triggering background revalidation.`,
      );
    } else {
      logs.push(`[${time}] 🟡 Cache MISS. Fetching fresh dataset & saving to caches.default.`);
    }
  } else if (strategy === "ppr") {
    logs.push(`[${time}] 🔍 Checking Cache API for static shell layout`);
    logs.push(`[${time}] 🐚 Cache HIT — served shell instantly`);
    logs.push(`[${time}] 🌊 Suspended dynamic hooks (posts, analytics) streaming...`);
  } else if (strategy === "islands") {
    logs.push(`[${time}] 🖥️ Server rendering complete static page skeleton`);
    logs.push(`[${time}] 💧 Client hydrating interactive islands: LikeIsland, CommentIsland`);
    logs.push(`[${time}] ⚡ Pure HTML static sections bypass hydration entirely`);
  } else if (strategy === "htmx") {
    logs.push(`[${time}] 📡 Server responding to hx-get/hx-trigger action`);
    logs.push(`[${time}] 🧱 Returned raw HTML string fragment directly`);
    logs.push(`[${time}] 🔄 htmx library swaps target element innerHTML`);
  } else if (strategy === "hybrid") {
    logs.push(`[${time}] 🐚 Serving static page HTML baked at build time`);
    logs.push(`[${time}] 💧 Hydrated client layer querying local data states`);
  } else {
    logs.push(`[${time}] 🕒 Measured edge connection round-trip latency`);
  }

  if (ttfb > 0) {
    logs.push(`[${time}] ✅ Connection closed. Total TTFB: ${ttfb}ms`);
  } else {
    logs.push(`[${time}] ✅ Connection closed. Total TTFB: ~2ms`);
  }
  return logs;
}

export function StrategyPage({
  strategy,
  title,
  icon,
  description,
  metrics,
  cacheStatus,
  children,
}: StrategyPageProps) {
  const meta = STRATEGY_METADATA[strategy];
  const ttfb = metrics?.ttfb ?? 0;
  const logs = generateTelemetryLogs(strategy, ttfb, cacheStatus);

  return (
    <div className={`strat-${strategy} min-h-screen`}>
      {/* Hero */}
      <div className="strategy-hero">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            {icon && <span>{icon}</span>}
            <span>{strategy.toUpperCase()}</span>
            {meta?.isReal && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
              >
                REAL
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="hero-title">{title}</h1>

          {/* Description */}
          <p className="hero-description">{description}</p>

          {/* CF Features badges */}
          {meta?.cfFeatures && meta.cfFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {meta.cfFeatures.map((f) => (
                <span key={f} className="tag">
                  <span style={{ color: "#f6821f" }}>◈</span>
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* RRv8 exports */}
          {meta?.rrv8Exports && meta.rrv8Exports.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {meta.rrv8Exports.map((exp) => (
                <code
                  key={exp}
                  className="text-[11px] px-2 py-0.5 rounded border font-mono"
                  style={{
                    background: "var(--s-bg)",
                    borderColor: "var(--s-border)",
                    color: "var(--s-text)",
                  }}
                >
                  {exp}
                </code>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
        {children}

        {strategy !== "dashboard" && strategy !== "compare" && (
          <>
            <SectionDivider label="Edge Request Console" />
            <div className="terminal animate-in" style={{ marginTop: 24 }}>
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
                <span className="terminal-dot" style={{ background: "#28ca41" }} />
                <span className="ml-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  telemetry.log
                </span>
              </div>
              <div className="terminal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {logs.map((log, i) => (
                    <p
                      key={i}
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: i === logs.length - 1 ? "var(--s-accent, #6366f1)" : "#cbd5e1",
                      }}
                    >
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="section-divider" style={!label ? { gap: 0 } : undefined}>
      {label && <span>{label}</span>}
    </div>
  );
}
