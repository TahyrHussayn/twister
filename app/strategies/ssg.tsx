import type { Route } from "./+types/ssg";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "SSG — Static Site Generation" },
    {
      name: "description",
      content:
        "Static Site Generation demo: pre-rendered at build time, served instantly from the edge with zero server-side computation.",
    },
  ];
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
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step active">
          <span className="text-lg">🛠️</span>
          <span>Build Time</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">📄</span>
          <span>Static HTML</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🌍</span>
          <span>CDN Cache</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">⚡</span>
          <span>Instant Serve</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={SSG_CODE} filename="app/strategies/ssg.tsx" strategy="SSG" />

      <div
        className="rounded-2xl border p-5 text-sm my-6 shadow-sm flex items-center gap-4"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <span className="text-2xl filter drop-shadow-sm">🧊</span>
        <div>
          <span className="font-bold text-sm block mb-0.5" style={{ color: "var(--s-text)" }}>
            Data frozen at build time
          </span>
          <span className="text-xs opacity-80" style={{ color: "var(--s-text)" }}>
            This page will not update until the next deployment.
          </span>
        </div>
      </div>

      <SectionDivider label="Live demo" />

      <div className="grid gap-6 sm:grid-cols-2">
        <section
          className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md"
          style={{ borderColor: "var(--s-border)" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-6xl text-emerald-500">👤</span>
          </div>
          <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--s-accent)" }}
            />
            Pre-rendered Profile
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
            Timestamps
          </h2>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Build Time (Frozen)
              </p>
              <code
                className="text-sm font-mono font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
              >
                {buildTimestamp}
              </code>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Now (Browser)
              </p>
              <code className="text-sm font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                {new Date().toISOString()}
              </code>
            </div>
          </div>
        </section>
      </div>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Near-instant TTFB", "Perfect SEO", "Zero runtime compute cost"]}
        cons={["Data can be stale", "Must rebuild to update", "Not for dynamic data"]}
        related={[
          { to: "/isr", label: "ISR", key: "ISR" },
          { to: "/ppr", label: "PPR", key: "PPR" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
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
