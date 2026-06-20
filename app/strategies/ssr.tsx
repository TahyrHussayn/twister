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
      title="Server-Side Rendering"
      metrics={metrics}
      description={
        <>
          HTML is rendered per-request on a Cloudflare Worker. All data fetches run at the edge in
          parallel before streaming to the browser — eliminating client-side waterfalls.
        </>
      }
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
          <span className="text-lg">⚙️</span>
          <span>Server Renders</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">📄</span>
          <span>Full HTML</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="text-lg">💧</span>
          <span>Hydrate</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={SSR_CODE} filename="app/strategies/ssr.tsx" strategy="SSR" />

      <div
        className="rounded-2xl border p-5 text-sm my-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div>
          <span
            className="font-mono text-[13px] font-bold block mb-1"
            style={{ color: "var(--s-text)" }}
          >
            {serverMessage}
          </span>
          <span className="text-xs opacity-80" style={{ color: "var(--s-text)" }}>
            Environment variable injected from Cloudflare bindings
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider"
          style={{
            borderColor: "var(--s-border)",
            color: "var(--s-text)",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          wrangler.jsonc
        </div>
      </div>

      <SectionDivider label="Live demo" />

      <div className="grid gap-6 sm:grid-cols-2">
        <section
          className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-6xl text-blue-500">👤</span>
          </div>
          <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
            User Profile
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
              <p className="text-[10px] font-mono text-zinc-400 mt-1.5 bg-zinc-100 dark:bg-zinc-800/50 inline-block px-2 py-0.5 rounded">
                ID: {profile.id}
              </p>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{ borderColor: "var(--s-border)" }}
        >
          <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
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
                {analytics.pageViews.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Visitors
              </p>
              <p className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                {analytics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Avg Session
              </p>
              <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300">
                {analytics.avgSessionDuration}s
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Bounce Rate
              </p>
              <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300">
                {(analytics.bounceRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm">
        <h2 className="font-bold text-sm mb-5 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--s-accent)" }}
          />
          Activity Feed
        </h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {activities.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between py-3.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50 px-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-xs">
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
      </section>

      <p className="text-center text-[11px] font-mono font-medium text-zinc-500 py-4">
        Edge timestamp: <span style={{ color: "var(--s-text)" }}>{timestamp}</span>
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Always fresh data", "SEO-friendly", "Personalized content per request"]}
        cons={["Higher server cost", "Slower TTFB than static", "Cold starts possible"]}
        related={[
          { to: "/csr", label: "CSR", key: "CSR" },
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
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
