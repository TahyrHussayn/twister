import { Suspense, use } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/ppr";
import { fetchUserProfile, fetchRecommendations, type UserProfile } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { getEdgeInfo } from "~/lib/edge-info";

export function meta() {
  return [
    { title: "PPR — Partial Prerendering" },
    {
      name: "description",
      content:
        "Partial Prerendering demo: static HTML shell baked at build time with dynamic client-side holes that load progressively after hydration.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const cacheKey = new Request(new URL("/api/profile", url.origin).toString(), {
    method: "GET",
  });

  let profile: UserProfile;

  const cache = typeof caches !== "undefined" ? caches.default : undefined;

  if (cache) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      profile = await cachedResponse.json();
    } else {
      profile = await fetchUserProfile(50);
      const response = new Response(JSON.stringify(profile), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=3600",
        },
      });
      await cache.put(cacheKey, response);
    }
  } else {
    profile = await fetchUserProfile(50);
  }

  const recommendationsPromise = fetchRecommendations(1500);
  const timestampPromise = new Promise<string>((resolve) =>
    setTimeout(() => resolve(new Date().toISOString()), 800),
  );

  return {
    profile,
    recommendationsPromise,
    timestampPromise,
    edgeInfo: getEdgeInfo(request),
    metrics: createMetrics("PPR"),
  };
}

export default function PPR({ loaderData }: Route.ComponentProps) {
  const { profile, recommendationsPromise, timestampPromise, edgeInfo, metrics } = loaderData;

  return (
    <StrategyPage
      strategy="ppr"
      title="Partial Prerendering"
      metrics={metrics}
      description="Pre-rendered HTML shell served from the edge. The profile is cached at the edge. Dynamic sections are streamed in — the shell renders instantly, holes fill in progressively via Suspense."
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step active">
          <span className="text-lg">🔎</span>
          <span>Cache Check</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">⚡</span>
          <span>Instant Shell</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🧩</span>
          <span>Stream Holes</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/ppr.tsx" strategy="PPR" />

      <div
        className="rounded-2xl border p-5 text-sm my-6 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--s-accent)", color: "white" }}
        >
          <span className="text-sm">💡</span>
        </div>
        <p className="font-medium text-xs leading-relaxed" style={{ color: "var(--s-text)" }}>
          Static shell served from Edge Cache — dynamic holes streamed in via Suspense.
        </p>
      </div>

      <SectionDivider label="Live demo" />

      <section
        className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 duration-500 mb-6"
        style={{ borderColor: "var(--s-border)" }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-6xl text-rose-500">🧱</span>
        </div>
        <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
          <span
            className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            STATIC SHELL
          </span>
          User Profile (Edge Cached)
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
          </div>
        </div>
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10 flex flex-wrap gap-4 justify-between items-center">
          <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Cached at Edge
          </p>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5" title="Edge Colo">
              <span className="text-rose-500">📍</span>
              <span className="font-mono">{edgeInfo.colo}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Country">
              <span className="text-rose-500">🌍</span>
              <span className="font-mono">{edgeInfo.country}</span>
            </div>
            <div className="flex items-center gap-1.5" title="City">
              <span className="text-rose-500">🏙️</span>
              <span className="font-mono">{edgeInfo.city}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <DynamicRecs recommendationsPromise={recommendationsPromise} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <DynamicTimestamp timestampPromise={timestampPromise} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<CardSkeleton />}>
          <DynamicCounter />
        </Suspense>
      </div>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Instant static shell", "Dynamic content streamed", "Great LCP & TTFB"]}
        cons={["Complex cache invalidation", "Requires Edge infrastructure", "More moving parts"]}
        related={[
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
          { to: "/islands", label: "Islands", key: "Islands" },
        ]}
      />
    </StrategyPage>
  );
}

function DynamicRecs({
  recommendationsPromise,
}: {
  recommendationsPromise: Promise<Awaited<ReturnType<typeof fetchRecommendations>>>;
}) {
  const data = use(recommendationsPromise);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md h-full">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        Recommendations
      </h2>
      <div className="grid gap-3">
        {data.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] p-3 transition-colors hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]"
          >
            <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
              {r.title}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {r.category}
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                {(r.score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DynamicTimestamp({ timestampPromise }: { timestampPromise: Promise<string> }) {
  const ts = use(timestampPromise);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        Live Edge Timestamp
      </h2>
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 w-full text-center">
          <code className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{ts}</code>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
        <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Streamed from server
        </p>
      </div>
    </section>
  );
}

function DynamicCounter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const count = Number(searchParams.get("count") || "0");

  const increment = () => {
    setSearchParams(
      (prev) => {
        prev.set("count", String(count + 1));
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -mr-8 -mt-8" />
      <h2 className="font-bold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-3 relative z-10">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          DYNAMIC HOLE
        </span>
        URL-Driven Counter
      </h2>
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {count}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500">Current count</p>
        </div>
        <button
          type="button"
          onClick={increment}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-rose-500/20"
        >
          Increment
        </button>
      </div>
      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
        <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Interactive Island
        </p>
      </div>
    </section>
  );
}

const CODE = `// app/strategies/ppr.tsx
export async function loader({ request }: Route.LoaderArgs) {
  // 1. Check Edge Cache for static shell data
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/profile", request.url));
  
  let profile;
  const cached = await cache.match(cacheKey);
  
  if (cached) {
    profile = await cached.json();
  } else {
    profile = await fetchUserProfile(50);
    await cache.put(cacheKey, new Response(JSON.stringify(profile), {
      headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=3600" }
    }));
  }

  // 2. Return un-awaited promises for dynamic holes
  return {
    profile,
    recommendationsPromise: fetchRecommendations(1500),
    timestampPromise: new Promise(res => setTimeout(() => res(new Date().toISOString()), 800))
  };
}

// 3. Render shell instantly, stream holes via Suspense
export default function PPR({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <StaticProfileShell profile={loaderData.profile} />
      <Suspense fallback={<Skeleton />}>
        <DynamicRecs recommendationsPromise={loaderData.recommendationsPromise} />
      </Suspense>
    </>
  );
}`;
