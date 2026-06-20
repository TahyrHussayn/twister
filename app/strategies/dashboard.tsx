import { Link } from "react-router";
import { useState } from "react";
import { createMetrics } from "~/lib/metrics";
import { STRATEGY_ACCENTS } from "~/lib/theme";

export function meta() {
  return [
    { title: "Twister — Rendering Strategies Compared" },
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
    emoji: "⚡",
    name: "Server-Side Rendering",
    label: "SSR",
    style: "strat-ssr",
    desc: "HTML rendered per-request at the edge.",
    pros: ["Always fresh", "SEO native"],
    cons: ["Server cost", "Slower TTFB"],
  },
  {
    to: "/csr",
    emoji: "🖥️",
    name: "Client-Side Rendering",
    label: "CSR",
    style: "strat-csr",
    desc: "Minimal HTML shell, renders in browser.",
    pros: ["Fast nav", "Low server"],
    cons: ["Poor SEO", "Slow load"],
  },
  {
    to: "/ssg",
    emoji: "🏗️",
    name: "Static Generation",
    label: "SSG",
    style: "strat-ssg",
    desc: "Pre-rendered at build time. Instant edge.",
    pros: ["Instant TTFB", "Perfect SEO"],
    cons: ["Stale data", "Rebuild"],
  },
  {
    to: "/streaming",
    emoji: "🌊",
    name: "Streaming SSR",
    label: "Streaming",
    style: "strat-streaming",
    desc: "HTML streams as data resolves.",
    pros: ["No waterfalls", "Best perceived"],
    cons: ["More complex"],
  },
  {
    to: "/isr",
    emoji: "🔄",
    name: "Incremental Static Regeneration",
    label: "ISR",
    style: "strat-isr",
    desc: "Global edge cache with TTL.",
    pros: ["Fast cache HIT", "Auto-regen"],
    cons: ["Stale window"],
  },
  {
    to: "/ppr",
    emoji: "🧩",
    name: "Partial Prerendering",
    label: "PPR",
    style: "strat-ppr",
    desc: "Static shell + dynamic holes.",
    pros: ["Instant shell"],
    cons: ["JS for holes"],
  },
  {
    to: "/islands",
    emoji: "🏝️",
    name: "React Islands",
    label: "Islands",
    style: "strat-islands",
    desc: "Isolated interactive components.",
    pros: ["Minimal JS"],
    cons: ["Not for apps"],
  },
];

type BenchResult = {
  strategy: string;
  url: string;
  ttfb: number;
  status: number;
  cacheStatus?: string;
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

  return (
    <div className="space-y-10">
      <header className="text-center pt-8 pb-2 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-600 via-blue-600 to-teal-600 dark:from-violet-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
          Pick your rendering strategy
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Seven strategies on{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">Cloudflare Workers</strong>. Click
          any card to see a live demo — or run the benchmark below.
        </p>
      </header>

      {/* Benchmark Section */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Live Benchmark</h2>
          <button
            type="button"
            onClick={runBenchmark}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {running ? "Running..." : "Run Benchmark"}
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Fetches all 7 strategy pages from the edge and measures round-trip time. ISR shows cache
          HIT on second run.
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {results && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Benchmark results comparing rendering strategy performance
              </caption>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-2 text-left text-xs font-semibold">Strategy</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold">TTFB</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold">Cache</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {results
                  .slice()
                  .sort((a, b) => (a.ttfb === -1 ? 9999 : a.ttfb) - (b.ttfb === -1 ? 9999 : b.ttfb))
                  .map((r) => (
                    <tr key={r.strategy}>
                      <td className="px-4 py-2">
                        <Link
                          to={r.url}
                          viewTransition
                          className="font-medium text-sm hover:underline"
                          style={{ color: STRATEGY_ACCENTS[r.strategy]?.hex ?? "#71717a" }}
                        >
                          {r.strategy}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs">
                        {r.error ? (
                          <span className="text-red-500">ERR</span>
                        ) : (
                          <span
                            className={
                              r.ttfb < 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : r.ttfb < 300
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                            }
                          >
                            {r.ttfb}ms
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-[10px] font-mono">
                        {r.cacheStatus === "HIT" && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            HIT
                          </span>
                        )}
                        {r.cacheStatus === "MISS" && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400">
                            MISS
                          </span>
                        )}
                        {!r.cacheStatus && r.error && <span className="text-red-400">ERR</span>}
                        {!r.cacheStatus && !r.error && <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-4 py-2 text-center text-[10px] font-mono">
                        {r.status === 200 ? (
                          <span className="text-emerald-500">200</span>
                        ) : r.status > 0 ? (
                          <span className="text-red-500">{r.status}</span>
                        ) : (
                          <span className="text-red-400">ERR</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {!results && !error && (
          <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <p className="text-sm text-zinc-400">
              Run the benchmark to see real edge performance numbers.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Run twice to see ISR cache behavior (MISS → HIT).
            </p>
          </div>
        )}
      </div>

      {/* Strategy Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STRATEGIES.map((s, i) => (
          <Link
            key={s.to}
            to={s.to}
            viewTransition
            prefetch="intent"
            className={`group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover animate-scale-in ${s.style}`}
            style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl bg-zinc-50 dark:bg-zinc-800 ring-1"
                style={{ borderColor: "var(--s-ring)" }}
              >
                {s.emoji}
              </span>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  {s.name}
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">{s.label}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              {s.desc}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {s.pros.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.cons.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: "var(--s-accent)" }}>
                View demo
              </span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: "var(--s-accent)" }}
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
