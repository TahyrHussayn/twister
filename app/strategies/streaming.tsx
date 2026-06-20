import { Suspense, use } from "react";
import type { Route } from "./+types/streaming";
import {
  fetchUserProfile,
  fetchActivityFeed,
  fetchRecommendations,
  fetchAnalytics,
  fetchServerTimestamp,
} from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton, TextSkeleton } from "~/components/skeleton";

export function meta() {
  return [{ title: "Streaming — Progressive SSR with Suspense" }];
}
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader() {
  return {
    profile: fetchUserProfile(500),
    analytics: fetchAnalytics(1000),
    recommendations: fetchRecommendations(1800),
    activities: fetchActivityFeed(2500),
    timestamp: fetchServerTimestamp(),
    metrics: createMetrics("Streaming"),
  };
}

export default function Streaming({ loaderData }: Route.ComponentProps) {
  const { profile, analytics, recommendations, activities, timestamp, metrics } = loaderData;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">🌊 Streaming SSR</h1>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          HTML streams progressively. Each section resolves independently — the shell renders
          instantly and data flows in as each promise resolves.
        </p>
      </header>

      <CodeSnippet
        code={STREAMING_CODE}
        filename="app/strategies/streaming.tsx"
        strategy="Streaming"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <ProfileSection promise={profile} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AnalyticsSection promise={analytics} />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <RecsSection promise={recommendations} />
      </Suspense>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm mb-4">Activity Feed</h2>
            <TextSkeleton lines={5} />
          </div>
        }
      >
        <ActivitySection promise={activities} />
      </Suspense>

      <p className="text-center text-[11px] font-mono text-zinc-400">
        Shell rendered at edge: {timestamp}
      </p>

      <ComparisonPanel
        pros={["No data waterfalls", "Great perceived performance", "Critical content first"]}
        cons={["More complex to build", "Requires Suspense", "Not all frameworks support it"]}
        related={[
          { to: "/ssr", label: "SSR", emoji: "⚡" },
          { to: "/ppr", label: "PPR", emoji: "🧩" },
          { to: "/islands", label: "Islands", emoji: "🏝️" },
        ]}
      />
    </div>
  );
}

function ProfileSection({ promise }: { promise: ReturnType<typeof fetchUserProfile> }) {
  const p = use(promise);
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
      <h2 className="font-semibold text-sm mb-4">User Profile</h2>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{p.avatar}</span>
        <div>
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-zinc-500">{p.email}</p>
        </div>
      </div>
      <p className="text-[10px] text-cyan-500 mt-3">Resolved after 500ms</p>
    </section>
  );
}

function AnalyticsSection({ promise }: { promise: ReturnType<typeof fetchAnalytics> }) {
  const a = use(promise);
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
      <h2 className="font-semibold text-sm mb-4">Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Page Views</p>
          <p className="text-xl font-bold font-mono">{a.pageViews.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Visitors</p>
          <p className="text-xl font-bold font-mono">{a.uniqueVisitors.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Avg Session</p>
          <p className="text-xl font-bold font-mono">{a.avgSessionDuration}s</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Bounce Rate</p>
          <p className="text-xl font-bold font-mono">{(a.bounceRate * 100).toFixed(0)}%</p>
        </div>
      </div>
      <p className="text-[10px] text-cyan-500 mt-3">Resolved after 1s</p>
    </section>
  );
}

function RecsSection({ promise }: { promise: ReturnType<typeof fetchRecommendations> }) {
  const r = use(promise);
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
      <h2 className="font-semibold text-sm mb-4">Recommendations</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {r.map((rec) => (
          <div key={rec.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
            <p className="font-medium text-xs">{rec.title}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-zinc-400">{rec.category}</span>
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {(rec.score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-cyan-500 mt-3">Resolved after 1.8s</p>
    </section>
  );
}

function ActivitySection({ promise }: { promise: ReturnType<typeof fetchActivityFeed> }) {
  const acts = use(promise);
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <h2 className="font-semibold text-sm mb-4">Activity Feed</h2>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {acts.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <span className="font-medium">{a.action}</span>{" "}
              <span className="text-zinc-500">{a.target}</span>
            </div>
            <time className="text-[11px] font-mono text-zinc-400">
              {new Date(a.timestamp).toLocaleTimeString()}
            </time>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-cyan-500 mt-3">Resolved after 2.5s</p>
    </section>
  );
}

const STREAMING_CODE = `export async function loader() {
  return {
    profile: fetchUserProfile(500),
    analytics: fetchAnalytics(1000),
    recommendations: fetchRecommendations(1800),
    activities: fetchActivityFeed(2500),
  };
}

export default function Page({ loaderData }) {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Profile promise={loaderData.profile} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Analytics promise={loaderData.analytics} />
      </Suspense>
    </>
  );
}`;
