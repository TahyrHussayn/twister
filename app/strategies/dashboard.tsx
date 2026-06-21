import { Link } from "react-router";
import { useState } from "react";
import { createMetrics } from "~/lib/metrics";
import { STRATEGY_ACCENTS } from "~/lib/theme";
import { CacheBadge } from "~/components/metrics-badge";
import { TransparencyLegend } from "~/components/legend";
import { STRATEGY_METADATA } from "~/lib/strategy-metadata";

export function meta() {
  return [
    { title: "Twister — Web Rendering Strategies, Visualized" },
    {
      name: "description",
      content:
        "Compare SSR, CSR, SSG, Streaming, ISR, PPR, and Islands — all running on Cloudflare Workers at the edge.",
    },
  ];
}

export function headers() {
  return { "Cache-Control": "public, max-age=30, s-maxage=30" };
}

export function loader() {
  return { metrics: createMetrics("Dashboard") };
}

const STRATEGIES = [
  {
    to: "/ssr",
    name: "Server-Side Rendering",
    label: "SSR",
    style: "strat-ssr",
    desc: "HTML rendered per-request at the edge.",
    pills: ["Always Fresh", "SEO Native", "No Waterfalls"],
    delay: "stagger-1",
  },
  {
    to: "/csr",
    name: "Client-Side Rendering",
    label: "CSR",
    style: "strat-csr",
    desc: "Minimal HTML shell, renders entirely in browser.",
    pills: ["Fast Navigation", "Low Server Cost"],
    delay: "stagger-2",
  },
  {
    to: "/ssg",
    name: "Static Generation",
    label: "SSG",
    style: "strat-ssg",
    desc: "Pre-rendered at build time. Instant edge delivery.",
    pills: ["Instant TTFB", "Perfect SEO", "Zero Compute"],
    delay: "stagger-3",
  },
  {
    to: "/streaming",
    name: "Streaming SSR",
    label: "Streaming",
    style: "strat-streaming",
    desc: "HTML streams chunk by chunk as data resolves.",
    pills: ["No Waterfalls", "Best Perceived Load"],
    delay: "stagger-4",
  },
  {
    to: "/isr",
    name: "Incremental Static Regeneration",
    label: "ISR",
    style: "strat-isr",
    desc: "Global edge cache with background revalidation.",
    pills: ["Fast Cache HIT", "Auto-Regen"],
    delay: "stagger-5",
  },
  {
    to: "/ppr",
    name: "Partial Prerendering",
    label: "PPR",
    style: "strat-ppr",
    desc: "Static shell delivered instantly + dynamic holes.",
    pills: ["Instant Shell", "Dynamic Content"],
    delay: "stagger-6",
  },
  {
    to: "/islands",
    name: "React Islands",
    label: "Islands",
    style: "strat-islands",
    desc: "Static HTML with isolated interactive components.",
    pills: ["Minimal JS", "Progressive Hydration"],
    delay: "stagger-7",
  },
  {
    to: "/htmx",
    name: "HTMX Playground",
    label: "HTMX",
    style: "strat-htmx",
    desc: "Hypermedia driven UI using server-rendered HTML fragments.",
    pills: ["Client-Side Swaps", "Zero JS Framework", "Lightweight"],
    delay: "stagger-8",
  },
  {
    to: "/hybrid",
    name: "Hybrid Rendering",
    label: "HYBRID",
    style: "strat-hybrid",
    desc: "Mix SSG and SSR per-route, or fetch CSR data into an SSG shell.",
    pills: ["Per-Route Strategy", "Static + Dynamic"],
    delay: "stagger-9",
  },
  {
    to: "/edge-vs-origin",
    name: "Edge vs Origin",
    label: "EDGE-VS-ORIGIN",
    style: "strat-edge-vs-origin",
    desc: "Compare latency between Edge SSR and centralized Origin SSR.",
    pills: ["Latency Benchmark", "Architecture"],
    delay: "stagger-10",
  },
];

type BenchResult = {
  strategy: string;
  url: string;
  ttfb: number;
  status: number;
  cacheStatus?: any;
  error?: string;
};

export default function Dashboard() {
  const [results, setResults] = useState<BenchResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/benchmark", { method: "POST" });
      if (!res.ok) throw new Error(`Benchmark failed (${res.status})`);
      const json = (await res.json()) as { results: BenchResult[]; timestamp: string };
      setResults(json.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  const sortedResults = results
    ? [...results].sort((a, b) => (a.ttfb === -1 ? 9999 : a.ttfb) - (b.ttfb === -1 ? 9999 : b.ttfb))
    : [];

  const maxTtfb = results ? Math.max(...results.map((r) => (r.ttfb > 0 ? r.ttfb : 0))) : 100;

  return (
    <div className="space-y-16 pb-16 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sleek Hero Section */}
      <header className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mb-4">
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #06b6d4)",
              backgroundSize: "200% auto",
              animation: "shimmer 5s linear infinite",
            }}
          >
            Twister
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
          Web Rendering Strategies, Visualized.
        </p>
      </header>

      {/* Live Benchmark Section */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#050505]/50 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Live Edge Benchmark
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Measures real TTFB from Cloudflare Edge to your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={runBenchmark}
            disabled={running}
            className="group relative px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {running ? "Running..." : "Run Benchmark"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-4 mb-6 text-sm text-rose-600 dark:text-rose-400 font-medium">
            Error: {error}
          </div>
        )}

        {!results && !error && !running && (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20">
            <svg
              className="w-8 h-8 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="font-medium text-sm">
              Hit "Run Benchmark" to measure current performance.
            </p>
            <p className="text-xs mt-2 opacity-80">
              Tip: Run twice to see ISR cache warm up from MISS to HIT.
            </p>
          </div>
        )}

        {running && (
          <div className="space-y-4 py-4">
            {STRATEGIES.map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-24 h-4 rounded-md shimmer bg-zinc-200 dark:bg-zinc-800"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                <div
                  className="flex-1 h-2 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800"
                  style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
                />
              </div>
            ))}
          </div>
        )}

        {results && !running && (
          <div className="space-y-5 animate-in fade-in duration-500">
            {sortedResults.map((r, i) => {
              const accent = STRATEGY_ACCENTS[r.strategy] || STRATEGY_ACCENTS.SSR;
              const isError = r.error || r.ttfb === -1;
              const widthPct = isError ? 0 : Math.max(2, (r.ttfb / maxTtfb) * 100);

              const ttfbColor = isError
                ? "text-rose-500"
                : r.ttfb < 100
                  ? "text-emerald-500 dark:text-emerald-400"
                  : r.ttfb < 300
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-rose-500 dark:text-rose-400";

              return (
                <div key={r.strategy} className="flex items-center gap-4 group">
                  <div className="w-28 sm:w-32 flex shrink-0 items-center gap-2">
                    <span className="text-lg">{accent.icon}</span>
                    <Link
                      to={r.url}
                      className="font-semibold text-xs sm:text-sm hover:underline"
                      style={{ color: accent.hex }}
                    >
                      {r.strategy}
                    </Link>
                  </div>

                  <div className="flex-1 flex items-center h-8 relative">
                    {/* Background track */}
                    <div className="absolute inset-y-1.5 left-0 right-0 rounded-r-full bg-zinc-100 dark:bg-zinc-900/50" />

                    {/* Animated Bar */}
                    <div
                      className="relative h-5 rounded-r-full flex items-center shadow-sm transition-all duration-1000 ease-out"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: accent.hex,
                        boxShadow: `0 0 10px ${accent.hex}40`,
                        animation: `slide-right 1s ease-out ${i * 0.1}s both`,
                      }}
                    />
                  </div>

                  <div className="w-20 shrink-0 text-right flex flex-col items-end gap-1">
                    <span className={`font-mono font-bold text-sm ${ttfbColor}`}>
                      {isError ? "ERR" : `${r.ttfb}ms`}
                    </span>
                    {r.cacheStatus && (
                      <div className="scale-75 origin-right -mt-1">
                        <CacheBadge status={r.cacheStatus as any} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4 group/cards">
        {STRATEGIES.map((s) => {
          const accent = STRATEGY_ACCENTS[s.label] || STRATEGY_ACCENTS.SSR;
          return (
            <Link
              key={s.to}
              to={s.to}
              viewTransition
              prefetch="intent"
              className={`relative flex flex-col rounded-3xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group/card animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${s.delay} ${s.style} strat-header-glow`}
              style={{
                borderColor: `var(--s-border, ${accent.hex}30)`,
              }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-md">{accent.icon}</span>
                  <div>
                    <h3
                      className="font-extrabold text-lg tracking-tight transition-colors"
                      style={{ color: "var(--s-text, #111)" }}
                    >
                      {s.name}
                    </h3>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70"
                      style={{ color: "var(--s-accent)" }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
                {(() => {
                  const meta = (STRATEGY_METADATA as any)[s.to.replace("/", "")];
                  if (!meta) return null;
                  return (
                    <div
                      className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        meta.isReal
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {meta.isReal ? "Native" : "Demo"}
                    </div>
                  );
                })()}
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed flex-1 font-medium">
                {s.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {s.pills.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full border"
                    style={{
                      backgroundColor: `var(--s-bg, ${accent.hex}10)`,
                      color: `var(--s-text, ${accent.hex})`,
                      borderColor: `var(--s-border, ${accent.hex}30)`,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div
                className="mt-auto pt-4 border-t flex items-center justify-between font-bold text-xs"
                style={{ borderColor: `var(--s-border, ${accent.hex}20)` }}
              >
                <span style={{ color: "var(--s-accent)" }}>Explore Strategy</span>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/card:translate-x-1"
                  style={{ backgroundColor: `var(--s-bg)`, color: "var(--s-accent)" }}
                >
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <TransparencyLegend />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slide-right {
          from { width: 0%; opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
