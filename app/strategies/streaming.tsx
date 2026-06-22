import { Suspense, use } from "react";
import type { Route } from "./+types/streaming";
import {
  fetchUserProfile,
  fetchActivityFeed,
  fetchRecommendations,
  fetchAnalytics,
  fetchServerTimestamp,
} from "~/lib/data";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton, TextSkeleton } from "~/components/skeleton";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "Streaming — Progressive SSR with Suspense" },
    {
      name: "description",
      content:
        "Streaming SSR demo: HTML streams progressively with React Suspense — each section resolves independently without blocking the full page.",
    },
  ];
}
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ request }: Route.LoaderArgs) {
  return {
    profile: fetchUserProfile(500),
    analytics: fetchAnalytics(1000),
    recommendations: fetchRecommendations(1800),
    activities: fetchActivityFeed(2500),
    timestamp: fetchServerTimestamp(),
    metrics: createMetrics("Streaming"),
    edgeInfo: getEdgeInfo(request),
  };
}

export default function Streaming({ loaderData }: Route.ComponentProps) {
  const { profile, analytics, recommendations, activities, timestamp, metrics, edgeInfo } =
    loaderData;

  return (
    <StrategyPage
      strategy="streaming"
      title="Streaming SSR"
      metrics={metrics}
      description="HTML streams progressively. Each section resolves independently — the shell renders instantly and data flows in as each promise resolves. No single slow query blocks the entire page."
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step">
          <span className="text-lg">📱</span>
          <span>Client Request</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🦴</span>
          <span>Shell Sent</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🌊</span>
          <span>Data Streams</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">✨</span>
          <span>Progressive Render</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/streaming.tsx" strategy="Streaming" />

      <SectionDivider label="Live demo" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <ProfileSection promise={profile} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AnalyticsSection promise={analytics} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<CardSkeleton />}>
          <RecsSection promise={recommendations} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm">
              <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--s-accent)" }}
                />
                Activity Feed
              </h2>
              <TextSkeleton lines={5} />
            </div>
          }
        >
          <ActivitySection promise={activities} />
        </Suspense>
      </div>

      <div className="flex flex-col items-center gap-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] text-[11px] font-mono text-zinc-500 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Served from {edgeInfo.colo} ({edgeInfo.city}, {edgeInfo.country})
        </div>
        <p className="text-center text-[11px] font-mono font-medium text-zinc-500">
          Shell rendered at edge: <span style={{ color: "var(--s-text)" }}>{timestamp}</span>
        </p>
      </div>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["No data waterfalls", "Great perceived performance", "Critical content first"]}
        cons={["More complex to build", "Requires Suspense", "Not all frameworks support it"]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/ppr", label: "PPR", key: "PPR" },
          { to: "/islands", label: "Islands", key: "Islands" },
        ]}
      />
    </StrategyPage>
  );
}

function ProfileSection({ promise }: { promise: ReturnType<typeof fetchUserProfile> }) {
  const p = use(promise);
  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 duration-500"
      style={{ borderColor: "var(--s-border)" }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="text-6xl text-cyan-500">👤</span>
      </div>
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2 relative z-10">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--s-accent)" }} />
        User Profile
      </h2>
      <div className="flex items-center gap-5 relative z-10">
        <img
          src={p.avatar}
          alt={p.name}
          className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-sm"
        />
        <div>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</p>
          <p className="text-sm text-zinc-500">{p.email}</p>
        </div>
      </div>
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <p
          className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
          style={{ color: "var(--s-accent)" }}
        >
          <span className="w-1 h-1 rounded-full animate-pulse bg-current" />
          Resolved after 500ms
        </p>
      </div>
    </section>
  );
}

function AnalyticsSection({ promise }: { promise: ReturnType<typeof fetchAnalytics> }) {
  const a = use(promise);
  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 duration-500"
      style={{ borderColor: "var(--s-border)" }}
    >
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--s-accent)" }} />
        Analytics
      </h2>
      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Page Views
          </p>
          <p
            className="text-2xl font-bold font-mono tracking-tight"
            style={{ color: "var(--s-text)" }}
          >
            {a.pageViews.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Visitors
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
            {a.uniqueVisitors.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Avg Session
          </p>
          <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300">
            {a.avgSessionDuration}s
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Bounce Rate
          </p>
          <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300">
            {(a.bounceRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <p
          className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
          style={{ color: "var(--s-accent)" }}
        >
          <span className="w-1 h-1 rounded-full animate-pulse bg-current" />
          Resolved after 1.0s
        </p>
      </div>
    </section>
  );
}

function RecsSection({ promise }: { promise: ReturnType<typeof fetchRecommendations> }) {
  const r = use(promise);
  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 duration-500"
      style={{ borderColor: "var(--s-border)" }}
    >
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--s-accent)" }} />
        Recommendations
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {r.map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] p-4 transition-colors hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]"
          >
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
              {rec.title}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {rec.category}
              </span>
              <span
                className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                style={{ color: "var(--s-text)", backgroundColor: "var(--s-bg)" }}
              >
                {(rec.score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <p
          className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
          style={{ color: "var(--s-accent)" }}
        >
          <span className="w-1 h-1 rounded-full animate-pulse bg-current" />
          Resolved after 1.8s
        </p>
      </div>
    </section>
  );
}

function ActivitySection({ promise }: { promise: ReturnType<typeof fetchActivityFeed> }) {
  const acts = use(promise);
  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <h2 className="font-bold text-sm mb-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--s-accent)" }} />
        Activity Feed
      </h2>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {acts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between py-3.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50 px-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                {a.action.charAt(0)}
              </span>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{a.action}</span>{" "}
                <span className="text-zinc-500">{a.target}</span>
              </div>
            </div>
            <time className="text-[11px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded">
              {new Date(a.timestamp).toLocaleTimeString()}
            </time>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <p
          className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
          style={{ color: "var(--s-accent)" }}
        >
          <span className="w-1 h-1 rounded-full animate-pulse bg-current" />
          Resolved after 2.5s
        </p>
      </div>
    </section>
  );
}

const CODE = `export async function loader() {
  return {
    profile: fetchUserProfile(500),
    analytics: fetchAnalytics(1000),
    recommendations: fetchRecommendations(1800),
    activities: fetchActivityFeed(2500),
  };
}

// Component — each section with Suspense
<Suspense fallback={<Skeleton />}>
  <Profile promise={loaderData.profile} />
</Suspense>`;
