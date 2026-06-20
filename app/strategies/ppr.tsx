import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/ppr";
import { fetchUserProfile, fetchRecommendations, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CardSkeleton } from "~/components/skeleton";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "PPR — Partial Prerendering" },
    {
      name: "description",
      content:
        "Live PPR demo: static HTML shell pre-rendered at build time, dynamic content loaded on client",
    },
  ];
}

export async function loader() {
  const profile = await fetchUserProfile(50);
  const shellTimestamp = fetchServerTimestamp();
  const metrics = createMetrics("PPR");
  return { profile, shellTimestamp, metrics };
}

export default function PPR({ loaderData }: Route.ComponentProps) {
  const { profile, shellTimestamp, metrics } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🧩</span>
          <h1 className="text-3xl font-bold">Partial Prerendering</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page was pre-rendered at build time, generating a <strong>static HTML shell</strong>.
          The profile section below is static (baked in at build time). Dynamic sections are marked
          as "holes" and load on the client, filling in with fresh data after hydration.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800">
          <p className="text-sm font-mono text-pink-700 dark:text-pink-300">
            Static shell baked at build time — dynamic holes fill in on client navigation.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="font-bold text-lg mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 mr-2">
            STATIC SHELL
          </span>
          User Profile (Pre-rendered)
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            <p className="text-xs text-gray-400 font-mono mt-1">Frozen at build time</p>
          </div>
        </div>
      </section>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicHole label="Recommendations" />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicTimestamp label="Live Edge Timestamp" />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <DynamicCounter label="Client-Side Counter" />
      </Suspense>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-mono text-gray-400">Shell build timestamp: {shellTimestamp}</h3>
      </section>

      <footer className="text-xs text-gray-400 font-mono text-center">
        Pre-rendered via <code>prerender</code> — dynamic sections use client-side fetching
      </footer>
    </div>
  );
}

function DynamicHole({ label }: { label: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchRecommendations>> | null>(null);

  useEffect(() => {
    void fetchRecommendations(1500).then(setData);
  }, []);

  return (
    <section className="rounded-2xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 mr-2">
          DYNAMIC HOLE
        </span>
        {label}
      </h2>
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="font-medium text-sm">{r.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{r.category}</span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full" />
        </div>
      )}
    </section>
  );
}

function DynamicTimestamp({ label }: { label: string }) {
  const [ts, setTs] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTs(new Date().toISOString()), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="rounded-2xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 mr-2">
          DYNAMIC HOLE
        </span>
        {label}
      </h2>
      {ts ? (
        <code className="text-sm font-mono text-pink-600 dark:text-pink-400">{ts}</code>
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full" />
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        This timestamp is computed client-side — it was never in the static shell.
      </p>
    </section>
  );
}

function DynamicCounter({ label }: { label: string }) {
  const [count, setCount] = useState(0);

  return (
    <section className="rounded-2xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 mr-2">
          DYNAMIC HOLE
        </span>
        {label}
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold font-mono">{count}</span>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition-colors"
        >
          Increment
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        This counter is a fully interactive React island in the dynamic hole. State is client-only.
      </p>
    </section>
  );
}
