import type { Route } from "./+types/ssg";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [{ title: "SSG — Static Site Generation" }];
}

export async function loader() {
  const profile = await fetchUserProfile(100);
  return { profile, buildTimestamp: fetchServerTimestamp(), metrics: createMetrics("SSG") };
}

export default function SSG({ loaderData }: Route.ComponentProps) {
  const { profile, buildTimestamp, metrics } = loaderData;

  return (
    <StrategyPage
      strategy="ssg"
      emoji="🏗️"
      title="Static Site Generation"
      metrics={metrics}
      description={
        <>
          This page was pre-rendered at <strong>build time</strong>. The HTML is static — served
          instantly from the edge with zero server-side computation. The data is baked into the HTML
          when the build runs.
        </>
      }
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={SSG_CODE} filename="app/strategies/ssg.tsx" strategy="SSG" />

      <div
        className="rounded-xl border p-4 text-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <p className="font-mono text-xs" style={{ color: "var(--s-text)" }}>
          Data frozen at build time — this page will not update until the next build.
        </p>
      </div>

      <SectionDivider label="Live demo" />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
          <h2 className="font-semibold text-sm mb-4">Pre-rendered Profile</h2>
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
          <h2 className="font-semibold text-sm mb-4">Timestamps</h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Build Time</p>
              <code className="text-xs font-mono" style={{ color: "var(--s-accent)" }}>
                {buildTimestamp}
              </code>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Now (Browser)</p>
              <code className="text-xs font-mono text-zinc-500">{new Date().toISOString()}</code>
            </div>
          </div>
        </section>
      </div>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Near-instant TTFB", "Perfect SEO", "Zero runtime compute cost"]}
        cons={["Data can be stale", "Must rebuild to update", "Not for dynamic data"]}
        related={[
          { to: "/isr", label: "ISR", emoji: "🔄" },
          { to: "/ppr", label: "PPR", emoji: "🧩" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
        ]}
      />
    </StrategyPage>
  );
}

const SSG_CODE = `// react-router.config.ts
export default {
  prerender: ["/ssg", "/ppr"],
} satisfies Config;

// app/strategies/ssg.tsx
export async function loader() {
  const profile = await fetchUserProfile(100);
  return { profile, buildTimestamp };
}`;
