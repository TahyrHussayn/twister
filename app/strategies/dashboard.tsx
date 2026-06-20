import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { createMetrics } from "~/lib/metrics";

export function meta(_args: Route.MetaArgs) {
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

type StrategyColor = "blue" | "purple" | "emerald" | "cyan" | "amber" | "pink" | "teal";

const COLOR_RING: Record<StrategyColor, string> = {
  blue: "ring-blue-200 dark:ring-blue-800",
  purple: "ring-purple-200 dark:ring-purple-800",
  emerald: "ring-emerald-200 dark:ring-emerald-800",
  cyan: "ring-cyan-200 dark:ring-cyan-800",
  amber: "ring-amber-200 dark:ring-amber-800",
  pink: "ring-pink-200 dark:ring-pink-800",
  teal: "ring-teal-200 dark:ring-teal-800",
};

const STRATEGIES = [
  {
    to: "/ssr",
    emoji: "⚡",
    name: "Server-Side Rendering",
    label: "SSR",
    color: "blue" as const,
    desc: "HTML rendered per-request at the edge. Data fetched on every visit.",
    pros: ["Always fresh", "SEO native", "Personalized"],
    cons: ["Server cost", "Slower TTFB"],
  },
  {
    to: "/csr",
    emoji: "🖥️",
    name: "Client-Side Rendering",
    label: "CSR",
    color: "purple" as const,
    desc: "Minimal HTML shell, renders in the browser. Great for app-like UIs.",
    pros: ["Fast nav", "Rich interactivity", "Low server load"],
    cons: ["Poor SEO", "Slow first load"],
  },
  {
    to: "/ssg",
    emoji: "🏗️",
    name: "Static Generation",
    label: "SSG",
    color: "emerald" as const,
    desc: "Pre-rendered at build time into static HTML. Instant edge delivery.",
    pros: ["Instant TTFB", "Perfect SEO", "Zero compute"],
    cons: ["Stale data", "Needs rebuild"],
  },
  {
    to: "/streaming",
    emoji: "🌊",
    name: "Streaming SSR",
    label: "Streaming",
    color: "cyan" as const,
    desc: "HTML streams progressively as data resolves. No single query blocks the page.",
    pros: ["Progressive render", "Great perceived perf"],
    cons: ["More complex", "Needs Suspense"],
  },
  {
    to: "/isr",
    emoji: "🔄",
    name: "Incremental Static Regeneration",
    label: "ISR",
    color: "amber" as const,
    desc: "Cached at the edge with TTL. Stale content served while regenerating in background.",
    pros: ["Fast on cache hit", "Auto-revalidate", "Global edge"],
    cons: ["Stale window", "First visit slower"],
  },
  {
    to: "/ppr",
    emoji: "🧩",
    name: "Partial Prerendering",
    label: "PPR",
    color: "pink" as const,
    desc: "Static HTML shell pre-rendered. Dynamic content loads on client, filling holes.",
    pros: ["Instant shell", "Dynamic islands"],
    cons: ["Client JS needed", "Setup overhead"],
  },
  {
    to: "/islands",
    emoji: "🏝️",
    name: "React Islands",
    label: "Islands",
    color: "teal" as const,
    desc: "Static page with isolated interactive components that hydrate independently.",
    pros: ["Minimal JS", "Independent hydration"],
    cons: ["Not for apps", "Cross-island comms"],
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <header className="text-center pt-8 pb-2 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-600 via-blue-600 to-teal-600 dark:from-violet-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
          Pick your rendering strategy
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Seven strategies, one codebase. All running on{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">Cloudflare Workers</strong> at the
          edge. Click a card to see a live demo with real performance metrics.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STRATEGIES.map((s, i) => (
          <Link
            key={s.to}
            to={s.to}
            viewTransition
            prefetch="intent"
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover animate-scale-in"
            style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl bg-zinc-100 dark:bg-zinc-800 ring-1 ${COLOR_RING[s.color]}`}
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
          </Link>
        ))}
      </div>
    </div>
  );
}
