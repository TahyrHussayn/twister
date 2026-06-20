import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { createMetrics } from "~/lib/metrics";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Twister — Rendering Strategy Comparison" },
    {
      name: "description",
      content:
        "A platform comparing every modern web rendering strategy: SSR, CSR, SSG, Streaming, ISR, PPR, and Islands — all running on Cloudflare Workers.",
    },
  ];
}

export function headers() {
  return { "Cache-Control": "public, max-age=30, s-maxage=30" };
}

export function loader() {
  const metrics = createMetrics("Dashboard");
  return { metrics };
}

const STRATEGIES = [
  {
    to: "/ssr",
    emoji: "⚡",
    name: "Server-Side Rendering",
    label: "SSR",
    description:
      "HTML rendered on the server per-request. Data fetched at the edge on every visit. Best for dynamic, personalized content.",
    pros: ["Always fresh data", "SEO-friendly", "Fast FCP"],
    cons: ["Higher server cost", "Slower TTFB than static"],
  },
  {
    to: "/csr",
    emoji: "🖥️",
    name: "Client-Side Rendering",
    label: "CSR",
    description:
      "A minimal HTML shell loads JavaScript, which then renders the page in the browser. Best for app-like experiences.",
    pros: ["Fast navigation", "Rich interactivity", "Low server load"],
    cons: ["Poor SEO", "Slow initial load", "JS required"],
  },
  {
    to: "/ssg",
    emoji: "🏗️",
    name: "Static Site Generation",
    label: "SSG",
    description:
      "Pages are pre-rendered at build time into static HTML. Served instantly from the edge. Best for content that rarely changes.",
    pros: ["Instant TTFB", "Perfect SEO", "Zero server cost"],
    cons: ["Stale data", "Rebuild for updates", "Not for dynamic content"],
  },
  {
    to: "/streaming",
    emoji: "🌊",
    name: "Streaming SSR",
    label: "Streaming",
    description:
      "The server sends HTML progressively as data resolves. Critical content appears first, slower data streams in later.",
    pros: ["Progressive rendering", "Great perceived perf", "No data waterfalls"],
    cons: ["Complex to implement", "Requires Suspense"],
  },
  {
    to: "/isr",
    emoji: "🔄",
    name: "Incremental Static Regeneration",
    label: "ISR",
    description:
      "Pages are cached at the edge with a TTL. On expiry, the next request triggers regeneration while serving stale content.",
    pros: ["Fast TTFB on cache hit", "Auto-revalidation", "Global edge cache"],
    cons: ["First visit slow", "Stale window exists"],
  },
  {
    to: "/ppr",
    emoji: "🧩",
    name: "Partial Prerendering",
    label: "PPR",
    description:
      "A static HTML shell is pre-rendered at build time. Dynamic content loads on the client, filling in the holes.",
    pros: ["Instant shell", "Dynamic islands", "Great LCP"],
    cons: ["Requires JS for dynamic parts", "Complex setup"],
  },
  {
    to: "/islands",
    emoji: "🏝️",
    name: "React Islands Architecture",
    label: "Islands",
    description:
      "Static HTML page with isolated interactive React 'islands' that hydrate independently. Best for mostly-static pages with interactivity.",
    pros: ["Minimal JS shipped", "Independent hydration", "Great performance"],
    cons: ["Not for app-like UIs", "Inter-island communication complex"],
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Pick your rendering strategy</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Seven strategies, one codebase. All running on Cloudflare Workers at the edge. Click any
          card to see a live demo with real performance metrics.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STRATEGIES.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            viewTransition
            prefetch="intent"
            className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h3 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {s.name}
                </h3>
                <span className="text-xs font-mono text-gray-400">{s.label}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {s.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {s.pros.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-xs rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                >
                  + {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.cons.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 text-xs rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                >
                  - {c}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
