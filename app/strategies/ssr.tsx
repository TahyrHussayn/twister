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
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";

export function meta() {
  return [{ title: "SSR — Server-Side Rendering on the Edge" }];
}
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader() {
  const [profile, activities, analytics, timestamp] = await Promise.all([
    fetchUserProfile(400),
    fetchActivityFeed(800),
    fetchAnalytics(600),
    Promise.resolve(fetchServerTimestamp()),
  ]);
  return {
    profile,
    activities,
    analytics,
    timestamp,
    metrics: createMetrics("SSR"),
    serverMessage: env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function SSR({ loaderData }: Route.ComponentProps) {
  const { profile, activities, analytics, timestamp, metrics, serverMessage } = loaderData;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">⚡ Server-Side Rendering</h1>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          HTML is rendered per-request on a Cloudflare Worker. All data fetches run at the edge
          before streaming to the browser.
        </p>
        <div className="mt-4 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-sm">
          <span className="text-blue-600 dark:text-blue-400 font-mono">{serverMessage}</span>
          <span className="block mt-1 text-xs text-blue-500 dark:text-blue-400/70">
            Env var from wrangler.jsonc
          </span>
        </div>
      </header>

      <CodeSnippet code={SSR_CODE} filename="app/strategies/ssr.tsx" strategy="SSR" />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
          <h2 className="font-semibold text-sm mb-4">User Profile</h2>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{profile.avatar}</span>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-xs text-zinc-500">{profile.email}</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-1">ID: {profile.id}</p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
          <h2 className="font-semibold text-sm mb-4">Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Page Views</p>
              <p className="text-xl font-bold font-mono">{analytics.pageViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Visitors</p>
              <p className="text-xl font-bold font-mono">
                {analytics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Avg Session</p>
              <p className="text-xl font-bold font-mono">{analytics.avgSessionDuration}s</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Bounce</p>
              <p className="text-xl font-bold font-mono">
                {(analytics.bounceRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-semibold text-sm mb-4">Activity Feed</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activities.map((a) => (
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
      </section>

      <p className="text-center text-[11px] font-mono text-zinc-400">Edge timestamp: {timestamp}</p>

      <ComparisonPanel
        pros={["Always fresh data", "SEO-friendly", "Personalized content per request"]}
        cons={["Higher server cost", "Slower TTFB than static", "Cold starts possible"]}
        related={[
          { to: "/csr", label: "CSR", emoji: "🖥️" },
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
        ]}
      />
    </div>
  );
}

const SSR_CODE = `export async function loader() {
  const [profile, activities, analytics] =
    await Promise.all([
      fetchUserProfile(400),
      fetchActivityFeed(800),
      fetchAnalytics(600),
    ]);
  return { profile, activities, analytics };
}`;
