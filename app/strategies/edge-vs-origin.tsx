import type { Route } from "./+types/edge-vs-origin";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { useState } from "react";

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

export async function loader() {
  // We don't do the benchmark here, we do it client-side so the user sees it happen.
  return {
    metrics: createMetrics("EDGE-VS-ORIGIN"),
  };
}

export default function EdgeVsOrigin({ loaderData }: Route.ComponentProps) {
  const { metrics } = loaderData;
  const [running, setRunning] = useState(false);
  const [edgeTime, setEdgeTime] = useState<number | null>(null);
  const [originTime, setOriginTime] = useState<number | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setEdgeTime(null);
    setOriginTime(null);

    // Simulate Edge: Ping our own fast API route
    const t0 = performance.now();
    await fetch("/ssr");
    const t1 = performance.now();
    setEdgeTime(Math.round(t1 - t0));

    // Simulate Origin: Ping a centralized server (e.g. example.com or a known distant API)
    // We use a proxy route or a slow API to represent origin latency.
    const t2 = performance.now();
    await fetch("https://jsonplaceholder.typicode.com/posts"); // Typical origin trip
    const t3 = performance.now();
    setOriginTime(Math.round(t3 - t2));

    setRunning(false);
  };

  return (
    <StrategyPage
      strategy="edge-vs-origin"
      title="Edge vs. Origin Rendering"
      metrics={metrics}
      description={
        <>
          Twister runs everything on Cloudflare Workers (the Edge). However, traditional SSR runs on
          a centralized Origin server (like AWS us-east-1). This page demonstrates the latency
          difference between the two architectures.
        </>
      }
    >
      <SectionDivider label="Latency Comparison" />

      <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Edge Box */}
          <div className="flex-1 w-full p-6 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 text-center relative overflow-hidden">
            <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-2">Edge SSR</h3>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-4">
              Cloudflare Worker (Close to you)
            </p>
            <div className="text-4xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {edgeTime ? `${edgeTime}ms` : "---"}
            </div>
            {running && <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 shimmer" />}
          </div>

          <div className="text-zinc-400 font-bold">VS</div>

          {/* Origin Box */}
          <div className="flex-1 w-full p-6 rounded-xl border-2 border-rose-500/30 bg-rose-500/5 text-center relative overflow-hidden">
            <h3 className="text-rose-700 dark:text-rose-400 font-bold mb-2">Origin SSR</h3>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mb-4">
              Centralized Server (e.g. us-east-1)
            </p>
            <div className="text-4xl font-mono font-extrabold text-rose-600 dark:text-rose-400">
              {originTime ? `${originTime}ms` : "---"}
            </div>
            {running && <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500 shimmer" />}
          </div>
        </div>

        <button
          onClick={runBenchmark}
          disabled={running}
          className="w-full py-4 rounded-xl font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ backgroundColor: "var(--s-accent)" }}
        >
          {running ? "Running Benchmark..." : "Compare Latency"}
        </button>
      </div>

      <SectionDivider label="Architectural Impact" />
      <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
        <p>
          <strong>Edge SSR</strong> executes code in a CDN node physically close to the user
          (usually within 50ms). This results in a lightning-fast Time to First Byte (TTFB) and
          instant perceived performance.
        </p>
        <p>
          <strong>Origin SSR</strong> forces the user's request to travel across the internet to a
          single data center (e.g., Virginia or Frankfurt). This unavoidable speed-of-light delay
          adds 100ms - 300ms to the TTFB, depending on the user's location.
        </p>
      </div>
    </StrategyPage>
  );
}
