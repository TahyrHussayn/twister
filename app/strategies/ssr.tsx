import { env } from "cloudflare:workers";
import type { Route } from "./+types/ssr";
import {
  fetchUserProfile,
  fetchActivityFeed,
  fetchAnalytics,
  fetchServerTimestamp,
} from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "SSR — Server-Side Rendering on the Edge" },
    {
      name: "description",
      content: "Live SSR demo: HTML rendered per-request on Cloudflare Workers",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader() {
  const [profile, activities, analytics, timestamp] = await Promise.all([
    fetchUserProfile(),
    fetchActivityFeed(),
    fetchAnalytics(),
    Promise.resolve(fetchServerTimestamp()),
  ]);
  const metrics = createMetrics("SSR");
  return {
    profile,
    activities,
    analytics,
    timestamp,
    metrics,
    serverMessage: env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function SSR({ loaderData }: Route.ComponentProps) {
  const { profile, activities, analytics, timestamp, metrics, serverMessage } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚡</span>
          <h1 className="text-3xl font-bold">Server-Side Rendering</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page is fully rendered on a Cloudflare Worker per-request. All data is fetched at the
          edge before HTML is streamed to the browser. Below is live data from the server, including
          an environment variable from the Cloudflare Worker context:
        </p>
        <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <code className="text-sm font-mono text-blue-700 dark:text-blue-300">
            {serverMessage}
          </code>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-bold text-lg mb-4">User Profile</h2>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{profile.avatar}</span>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">ID: {profile.id}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-bold text-lg mb-4">Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Page Views</p>
              <p className="text-2xl font-bold font-mono">{analytics.pageViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Visitors</p>
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
              <p className="text-2xl font-bold font-mono">
                {(analytics.bounceRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
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
      </section>

      <footer className="text-xs text-gray-400 font-mono text-center">
        Edge timestamp: {timestamp}
        <br />
        Rendered on Cloudflare Worker at {metrics.renderedAt}
      </footer>
    </div>
  );
}
