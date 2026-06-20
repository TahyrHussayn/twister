import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/ppr";
import { fetchUserProfile, fetchRecommendations, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";

export function meta() {
  return [{ title: "PPR — Partial Prerendering" }];
}

export async function loader() {
  return {
    profile: await fetchUserProfile(50),
    shellTimestamp: fetchServerTimestamp(),
    metrics: createMetrics("PPR"),
  };
}

export default function PPR({ loaderData }: Route.ComponentProps) {
  const { profile, shellTimestamp, metrics } = loaderData;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">🧩 Partial Prerendering</h1>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Pre-rendered at build time into a <strong>static HTML shell</strong>. The profile below is
          baked in. Dynamic sections are "holes" — they load on the client after hydration.
        </p>
        <div className="mt-4 p-4 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950 text-sm">
          <p className="text-pink-700 dark:text-pink-300 font-mono text-xs">
            Static shell baked at build time — dynamic holes fill in on client navigation.
          </p>
        </div>
      </header>

      <CodeSnippet code={PPR_CODE} filename="app/strategies/ppr.tsx" strategy="PPR" />

      <section className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 p-5 card-hover">
        <h2 className="font-semibold text-sm mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mr-2 font-semibold">
            STATIC SHELL
          </span>
          User Profile (Pre-rendered)
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-zinc-500">{profile.email}</p>
            <p className="text-[10px] font-mono text-zinc-400 mt-1">Frozen at build time</p>
          </div>
        </div>
      </section>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicRecs />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicTimestamp />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicCounter />
      </Suspense>

      <p className="text-center text-[11px] font-mono text-zinc-400">
        Shell build timestamp: {shellTimestamp}
      </p>

      <ComparisonPanel
        pros={["Instant static shell", "Dynamic content on client", "Great LCP scores"]}
        cons={["Client JS required for holes", "Setup complexity", "Not all frameworks support it"]}
        related={[
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
          { to: "/islands", label: "Islands", emoji: "🏝️" },
        ]}
      />
    </div>
  );
}

function DynamicRecs() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchRecommendations>> | null>(null);
  useEffect(() => {
    void fetchRecommendations(1500).then(setData);
  }, []);

  return (
    <section className="rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-900 p-5">
      <h2 className="font-semibold text-sm mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 mr-2 font-semibold">
          DYNAMIC HOLE
        </span>
        Recommendations
      </h2>
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((r) => (
            <div key={r.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
              <p className="font-medium text-xs">{r.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-400">{r.category}</span>
                <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full" />
        </div>
      )}
    </section>
  );
}

function DynamicTimestamp() {
  const [ts, setTs] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setTs(new Date().toISOString()), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-900 p-5">
      <h2 className="font-semibold text-sm mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 mr-2 font-semibold">
          DYNAMIC HOLE
        </span>
        Live Edge Timestamp
      </h2>
      {ts ? (
        <code className="text-sm font-mono text-pink-600 dark:text-pink-400">{ts}</code>
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full" />
        </div>
      )}
      <p className="text-[10px] text-zinc-400 mt-3">
        Computed client-side — never in the static shell.
      </p>
    </section>
  );
}

function DynamicCounter() {
  const [count, setCount] = useState(0);
  return (
    <section className="rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-900 p-5">
      <h2 className="font-semibold text-sm mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 mr-2 font-semibold">
          DYNAMIC HOLE
        </span>
        Client-Side Counter
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold font-mono">{count}</span>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium transition-colors"
        >
          Increment
        </button>
      </div>
      <p className="text-[10px] text-zinc-400 mt-3">
        Fully interactive React island — state is client-only.
      </p>
    </section>
  );
}

const PPR_CODE = `// react-router.config.ts — pre-rendered at build
prerender: ["/ppr"]

export async function loader() {
  // Static shell data baked at build time
  return { profile: await fetchUserProfile() };
}

// Dynamic holes load on client via useEffect/Suspense
function DynamicHole() {
  const [data, setData] = useState(null);
  useEffect(() => { fetchData().then(setData); }, []);
  return data ? <Content /> : <Spinner />;
}`;
