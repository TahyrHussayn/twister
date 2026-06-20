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
import { TextSkeleton, CardSkeleton } from "~/components/skeleton";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Streaming — Progressive SSR with Suspense" },
    {
      name: "description",
      content: "Live streaming demo: content renders progressively as data resolves",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader() {
  const metrics = createMetrics("Streaming");
  const timestamp = fetchServerTimestamp();
  const profilePromise = fetchUserProfile(500);
  const analyticsPromise = fetchAnalytics(1000);
  const recommendationsPromise = fetchRecommendations(1800);
  const activityPromise = fetchActivityFeed(2500);

  return {
    profile: profilePromise,
    analytics: analyticsPromise,
    recommendations: recommendationsPromise,
    activities: activityPromise,
    timestamp,
    metrics,
  };
}

export default function Streaming({ loaderData }: Route.ComponentProps) {
  const { profile, analytics, recommendations, activities, timestamp, metrics } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🌊</span>
          <h1 className="text-3xl font-bold">Streaming SSR</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page streams HTML progressively. Each section resolves independently — the shell
          renders immediately, and data loads in as it becomes available. No single slow query
          blocks the entire page.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <ProfileSection promise={profile} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AnalyticsSection promise={analytics} />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <RecommendationsSection promise={recommendations} />
      </Suspense>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="font-bold text-lg mb-4">Activity Feed</h2>
            <TextSkeleton lines={5} />
          </div>
        }
      >
        <ActivitySection promise={activities} />
      </Suspense>

      <footer className="text-xs text-gray-400 font-mono text-center">
        Shell rendered at edge: {timestamp}
      </footer>
    </div>
  );
}

function ProfileSection({ promise }: { promise: ReturnType<typeof fetchUserProfile> }) {
  const profile = use(promise);
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">User Profile</h2>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{profile.avatar}</span>
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Resolved after 500ms</p>
    </section>
  );
}

function AnalyticsSection({ promise }: { promise: ReturnType<typeof fetchAnalytics> }) {
  const analytics = use(promise);
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Page Views</p>
          <p className="text-2xl font-bold font-mono">{analytics.pageViews.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Visitors</p>
          <p className="text-2xl font-bold font-mono">
            {analytics.uniqueVisitors.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg Session</p>
          <p className="text-2xl font-bold font-mono">{analytics.avgSessionDuration}s</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bounce Rate</p>
          <p className="text-2xl font-bold font-mono">{(analytics.bounceRate * 100).toFixed(0)}%</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Resolved after 1s</p>
    </section>
  );
}

function RecommendationsSection({ promise }: { promise: ReturnType<typeof fetchRecommendations> }) {
  const recs = use(promise);
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">Recommendations</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recs.map((r) => (
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
      <p className="text-xs text-gray-400 mt-4">Resolved after 1.8s</p>
    </section>
  );
}

function ActivitySection({ promise }: { promise: ReturnType<typeof fetchActivityFeed> }) {
  const activities = use(promise);
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="font-bold text-lg mb-4">Activity Feed</h2>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {activities.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-3">
            <div>
              <span className="font-medium">{a.action}</span>
              <span className="text-gray-500 dark:text-gray-400"> {a.target}</span>
            </div>
            <time className="text-xs font-mono text-gray-400">
              {new Date(a.timestamp).toLocaleTimeString()}
            </time>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">Resolved after 2.5s</p>
    </section>
  );
}
