import { env } from "cloudflare:workers";
import type { Route } from "./+types/ssr";
import {
  fetchUserProfile,
  fetchActivityFeed,
  fetchAnalytics,
  fetchServerTimestamp,
} from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "SSR — Server-Side Rendering on the Edge" },
    {
      name: "description",
      content:
        "Server-Side Rendering demo: HTML rendered per-request on Cloudflare Workers with parallel data fetching at the edge.",
    },
  ];
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
    <StrategyPage
      strategy="ssr"
      emoji="⚡"
      title="Server-Side Rendering"
      metrics={metrics}
      description={
        <>
          HTML is rendered per-request on a Cloudflare Worker. All data fetches run at the edge in
          parallel before streaming to the browser — no client-side waterfalls.
        </>
      }
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={SSR_CODE} filename="app/strategies/ssr.tsx" strategy="SSR" />

      <div
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <span className="font-mono text-xs" style={{ color: "var(--s-text)" }}>
          {serverMessage}
        </span>
        <span className="block mt-1 text-xs opacity-70" style={{ color: "var(--s-text)" }}>
          Env var from wrangler.jsonc
        </span>
      </div>

      <SectionDivider label="Live demo" />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
          <h2 className="font-semibold text-sm mb-4">User Profile</h2>
          <div className="flex items-center gap-4">
            <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full" />
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

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Always fresh data", "SEO-friendly", "Personalized content per request"]}
        cons={["Higher server cost", "Slower TTFB than static", "Cold starts possible"]}
        related={[
          { to: "/csr", label: "CSR", emoji: "🖥️" },
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
        ]}
      />
    </StrategyPage>
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
