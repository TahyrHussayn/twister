import type { Route } from "./+types/edge-vs-origin";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CodeSnippet } from "~/components/code-snippet";
import { useRevalidator } from "react-router";
import { getEdgeInfo } from "~/lib/edge-info";

export function meta() {
  return [
    { title: "Edge vs Origin — Latency Benchmark" },
    {
      name: "description",
      content:
        "Edge vs Origin demo: Comparing latency between rendering at the Cloudflare edge vs fetching from a centralized origin server.",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ request }: Route.LoaderArgs) {
  const edgeInfo = getEdgeInfo(request);

  // Benchmark Edge (Cloudflare internal routing) vs Origin (External fetch)
  // We do this server-side so it measures from the Worker, not the browser.

  const t0 = Date.now();
  // Simulate hitting an edge cache / internal route
  await fetch(new URL("/ssg", request.url).toString());
  const edgeTime = Date.now() - t0;

  const t2 = Date.now();
  // Simulate hitting an external origin (like AWS us-east-1)
  await fetch("https://jsonplaceholder.typicode.com/posts?_limit=1");
  const originTime = Date.now() - t2;

  return {
    metrics: createMetrics("EDGE-VS-ORIGIN"),
    edgeTime,
    originTime,
    edgeInfo,
  };
}

export default function EdgeVsOrigin({ loaderData }: Route.ComponentProps) {
  const { metrics, edgeTime, originTime, edgeInfo } = loaderData;
  const revalidator = useRevalidator();
  const running = revalidator.state === "loading";

  return (
    <StrategyPage
      strategy="edge-vs-origin"
      title="Edge vs. Origin Rendering"
      metrics={metrics}
      description={
        <>
          Twister runs on Cloudflare Workers (the Edge). Traditional SSR runs on a centralized
          Origin server (like AWS us-east-1). This page demonstrates the latency difference by
          measuring it <strong>directly from the server</strong>.
        </>
      }
    >
      <SectionDivider label="Server-Side Latency Benchmark" />

      <div className="p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505] shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Worker executing in {edgeInfo.city}, {edgeInfo.country} ({edgeInfo.colo})
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Edge Box */}
          <div className="flex-1 w-full p-6 rounded-xl border-2 border-emerald-500/30 bg-white dark:bg-emerald-500/5 text-center relative overflow-hidden shadow-sm">
            <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-2">Edge Fetch</h3>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-4 font-mono">
              GET /ssg
            </p>
            <div className="text-4xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {running ? "---" : `${edgeTime}ms`}
            </div>
            {running && <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 shimmer" />}
          </div>

          <div className="text-zinc-400 font-bold text-sm bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full shadow-sm">
            VS
          </div>

          {/* Origin Box */}
          <div className="flex-1 w-full p-6 rounded-xl border-2 border-rose-500/30 bg-white dark:bg-rose-500/5 text-center relative overflow-hidden shadow-sm">
            <h3 className="text-rose-700 dark:text-rose-400 font-bold mb-2">Origin Fetch</h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mb-4 font-mono">
              GET jsonplaceholder...
            </p>
            <div className="text-4xl font-mono font-extrabold text-rose-600 dark:text-rose-400">
              {running ? "---" : `${originTime}ms`}
            </div>
            {running && <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500 shimmer" />}
          </div>
        </div>

        <button
          onClick={() => revalidator.revalidate()}
          disabled={running}
          className="w-full py-3.5 rounded-xl font-bold text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          style={{ backgroundColor: "var(--s-accent)" }}
        >
          {running ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Running Benchmark from {edgeInfo.colo}...
            </>
          ) : (
            "Rerun Benchmark from Server"
          )}
        </button>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet
        code={CODE}
        filename="app/strategies/edge-vs-origin.tsx"
        strategy="EDGE-VS-ORIGIN"
      />

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={[
          "Lowest possible latency globally",
          "No centralized database bottlenecks",
          "Avoids cross-country origin trips",
        ]}
        cons={[
          "Databases must also be at the edge (D1, Turso)",
          "Read-heavy caching required for best results",
        ]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
        ]}
      />
    </StrategyPage>
  );
}

const CODE = `// Benchmark executes on the Cloudflare Worker server
export async function loader({ request }) {
  const edgeInfo = getEdgeInfo(request);
  
  // 1. Edge Fetch (internal Cloudflare network)
  const t0 = Date.now();
  await fetch(new URL("/ssg", request.url));
  const edgeTime = Date.now() - t0;

  // 2. Origin Fetch (routing across public internet)
  const t2 = Date.now();
  await fetch("https://jsonplaceholder.typicode.com/posts");
  const originTime = Date.now() - t2;

  return { edgeTime, originTime, edgeInfo };
}

// Zero state or effects in the component
export default function EdgeVsOrigin({ loaderData }) {
  const revalidator = useRevalidator();
  const running = revalidator.state === "loading";

  return (
    <button onClick={() => revalidator.revalidate()}>
      {running ? "Benchmarking..." : "Run Again"}
    </button>
  );
}`;
