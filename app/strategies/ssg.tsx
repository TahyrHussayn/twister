import type { Route } from "./+types/ssg";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "SSG — Static Site Generation" },
    {
      name: "description",
      content: "Live SSG demo: page pre-rendered at build time, served as static HTML",
    },
  ];
}

export async function loader() {
  const profile = await fetchUserProfile(100);
  const buildTimestamp = fetchServerTimestamp();
  const metrics = createMetrics("SSG");
  return { profile, buildTimestamp, metrics };
}

export default function SSG({ loaderData }: Route.ComponentProps) {
  const { profile, buildTimestamp, metrics } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏗️</span>
          <h1 className="text-3xl font-bold">Static Site Generation</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page was pre-rendered at <strong>build time</strong>. The HTML is static — served
          instantly from Cloudflare's edge network with zero server-side computation. The data below
          was baked into the HTML when the build ran.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <p className="text-sm font-mono text-green-700 dark:text-green-300">
            Data frozen at build time — this page will not update until the next build.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 max-w-md">
        <h2 className="font-bold text-lg mb-4">Pre-rendered Profile</h2>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            <p className="text-xs text-gray-400 font-mono mt-1">ID: {profile.id}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="font-semibold mb-2 text-sm">Build Timestamp</h3>
          <code className="text-xs font-mono text-gray-500 block">{buildTimestamp}</code>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="font-semibold mb-2 text-sm">Current Time (Browser)</h3>
          <ClientTimestamp />
        </div>
      </div>

      <footer className="text-xs text-gray-400 font-mono text-center">
        This page is pre-rendered via <code>prerender</code> in react-router.config.ts
      </footer>
    </div>
  );
}

function ClientTimestamp() {
  return <code className="text-xs font-mono text-gray-500">{new Date().toISOString()}</code>;
}
