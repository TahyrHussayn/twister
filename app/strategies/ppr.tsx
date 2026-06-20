import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/ppr";
import { fetchUserProfile, fetchRecommendations, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

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
    <StrategyPage
      strategy="ppr"
      emoji="🧩"
      title="Partial Prerendering"
      metrics={metrics}
      description="Pre-rendered at build time into a static HTML shell. The profile below is baked in at build time. Dynamic sections are holes that load on the client after hydration — the shell renders instantly, holes fill in progressively."
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/ppr.tsx" strategy="PPR" />

      <div
        className="rounded-xl border p-4 text-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <p className="font-mono text-xs" style={{ color: "var(--s-text)" }}>
          Static shell baked at build time — dynamic holes fill in on client navigation.
        </p>
      </div>

      <SectionDivider label="Live demo" />

      <section className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 p-5 card-hover">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            STATIC SHELL
          </span>
          User Profile (Pre-rendered)
        </h2>
        <div className="flex items-center gap-4">
          <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full" />
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

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Instant static shell", "Dynamic content on client", "Great LCP scores"]}
        cons={["Client JS required for holes", "Setup complexity", "Not all frameworks support it"]}
        related={[
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
          { to: "/islands", label: "Islands", emoji: "🏝️" },
        ]}
      />
    </StrategyPage>
  );
}

function DynamicRecs() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchRecommendations>> | null>(null);
  useEffect(() => {
    void fetchRecommendations(1500).then(setData);
  }, []);
  return (
    <section className="rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-900 p-5">
      <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
          DYNAMIC HOLE
        </span>{" "}
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
      <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
          DYNAMIC HOLE
        </span>{" "}
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
      <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
          DYNAMIC HOLE
        </span>{" "}
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
        Fully interactive island — state is client-only.
      </p>
    </section>
  );
}

const CODE = `// react-router.config.ts
prerender: ["/ppr"]

export async function loader() {
  // Static shell data baked at build time
  return { profile: await fetchUserProfile() };
}

// Dynamic holes load on client
function DynamicHole() {
  const [data, setData] = useState(null);
  useEffect(() => { fetchData().then(setData); }, []);
  return data ? <Content /> : <Spinner />;
}`;
