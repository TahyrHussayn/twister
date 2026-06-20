import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/ppr";
import { fetchUserProfile, fetchRecommendations, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "PPR — Partial Prerendering" },
    {
      name: "description",
      content:
        "Partial Prerendering demo: static HTML shell baked at build time with dynamic client-side holes that load progressively after hydration.",
    },
  ];
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
      title="Partial Prerendering"
      metrics={metrics}
      description="Pre-rendered at build time into a static HTML shell. The profile below is baked in at build time. Dynamic sections are holes that load on the client after hydration — the shell renders instantly, holes fill in progressively."
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step active">
          <span className="text-lg">🏗️</span>
          <span>Build: Static Shell</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step">
          <span className="text-lg">📱</span>
          <span>Request</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">⚡</span>
          <span>Instant Shell</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🧩</span>
          <span>Dynamic Holes Fill</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/ppr.tsx" strategy="PPR" />

      <div
        className="rounded-2xl border p-5 text-sm my-6 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--s-accent)", color: "white" }}
        >
          <span className="text-sm">💡</span>
        </div>
        <p className="font-medium text-xs leading-relaxed" style={{ color: "var(--s-text)" }}>
          Static shell baked at build time — dynamic holes fill in on client navigation.
        </p>
      </div>

      <SectionDivider label="Live demo" />

      <section
        className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 duration-500 mb-6"
        style={{ borderColor: "var(--s-border)" }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-6xl text-rose-500">🧱</span>
        </div>
        <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
          <span
            className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            STATIC SHELL
          </span>
          User Profile (Pre-rendered)
        </h2>
        <div className="flex items-center gap-5 relative z-10">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-sm"
          />
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</p>
            <p className="text-sm text-zinc-500">{profile.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
          <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Frozen at build time
          </p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <DynamicRecs />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <DynamicTimestamp />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<CardSkeleton />}>
          <DynamicCounter />
        </Suspense>
      </div>

      <p className="text-center text-[11px] font-mono font-medium text-zinc-500 py-6">
        Shell build timestamp: <span style={{ color: "var(--s-text)" }}>{shellTimestamp}</span>
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Instant static shell", "Dynamic content on client", "Great LCP scores"]}
        cons={["Client JS required for holes", "Setup complexity", "Not all frameworks support it"]}
        related={[
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
          { to: "/islands", label: "Islands", key: "Islands" },
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
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md h-full">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        Recommendations
      </h2>
      {data ? (
        <div className="grid gap-3">
          {data.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] p-3 transition-colors hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]"
            >
              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
                {r.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {r.category}
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div
            role="status"
            aria-label="Loading"
            className="animate-spin h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full"
          />
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
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        Live Edge Timestamp
      </h2>
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        {ts ? (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 w-full text-center">
            <code className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
              {ts}
            </code>
          </div>
        ) : (
          <div className="flex items-center justify-center h-14">
            <div
              role="status"
              aria-label="Loading"
              className="animate-spin h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
        <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Computed client-side
        </p>
      </div>
    </section>
  );
}

function DynamicCounter() {
  const [count, setCount] = useState(0);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -mr-8 -mt-8" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        Client-Side Counter
      </h2>
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {count}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500">Current count</p>
        </div>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-rose-500/20"
        >
          Increment
        </button>
      </div>
      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
        <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Interactive Island
        </p>
      </div>
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
