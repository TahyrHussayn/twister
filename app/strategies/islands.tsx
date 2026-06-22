import { Suspense } from "react";
import { useSearchParams, Form, useSubmit, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/islands";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { getEdgeInfo } from "~/lib/edge-info";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "Islands — React Islands Architecture" },
    {
      name: "description",
      content:
        "React Islands Architecture demo: independent interactive components hydrate on their own, shipping minimal JS without blocking other content.",
    },
  ];
}

let globalComments = [
  { id: "1", text: "Great architecture!" },
  { id: "2", text: "Islands are the future" },
];
let globalLikes = 42;

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "comment") {
    const text = formData.get("comment") as string;
    if (text) {
      globalComments.push({ id: Date.now().toString(36), text });
    }
  } else if (intent === "like") {
    globalLikes++;
  }
  return null;
}

export async function loader({ request }: Route.LoaderArgs) {
  return {
    profile: await fetchUserProfile(100),
    timestamp: fetchServerTimestamp(),
    metrics: createMetrics("Islands"),
    edgeInfo: getEdgeInfo(request),
    comments: globalComments,
    likes: globalLikes,
  };
}

export default function Islands({ loaderData }: Route.ComponentProps) {
  const { profile, timestamp, metrics, edgeInfo } = loaderData;

  return (
    <StrategyPage
      strategy="islands"
      title="React Islands Architecture"
      metrics={metrics}
      description="The page is standard SSR. Each interactive component below is an independent island — it hydrates on its own, ships only its JS, and doesn't block other islands. Static content renders immediately from the server."
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step">
          <span className="text-lg">⚙️</span>
          <span>Server Renders All</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">📄</span>
          <span>Static HTML Sent</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">🏝️</span>
          <span>Islands Hydrate</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">✨</span>
          <span>Interactive</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={CODE} filename="app/strategies/islands.tsx" strategy="Islands" />

      <div
        className="rounded-2xl border p-5 text-sm my-6 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--s-accent)", color: "white" }}
        >
          <span className="text-sm">🏝️</span>
        </div>
        <p className="font-medium text-xs leading-relaxed" style={{ color: "var(--s-text)" }}>
          Each island hydrates independently. No shared state. Minimal JS per component.
        </p>
      </div>

      <SectionDivider label="Live demo — 6 independent islands" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Suspense fallback={<SpinnerShell title="Like Button" />}>
          <LikeIsland serverLikes={loaderData.likes} />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Clock" />}>
          <PingIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Comments" />}>
          <CommentsIsland comments={loaderData.comments} />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Share" />}>
          <ShareIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Search" />}>
          <SearchIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Tabs" />}>
          <TabsIsland />
        </Suspense>
      </div>

      <section className="relative overflow-hidden rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-shadow hover:shadow-md border-zinc-200 dark:border-zinc-800">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-6xl text-zinc-500">📄</span>
        </div>
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
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
          <p className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            This profile is server-rendered (static).
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] text-[11px] font-mono text-zinc-500 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Served from {edgeInfo.colo} ({edgeInfo.city}, {edgeInfo.country})
        </div>
        <p className="text-center text-[11px] font-mono font-medium text-zinc-500">
          Server timestamp: <span style={{ color: "var(--s-text)" }}>{timestamp}</span> · Each
          island ships its own JS bundle
        </p>
      </div>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Minimal JS shipped", "Independent hydration", "Excellent performance"]}
        cons={["Not for app-like UIs", "Cross-island communication hard", "Tooling still emerging"]}
        related={[
          { to: "/csr", label: "CSR", key: "CSR" },
          { to: "/ppr", label: "PPR", key: "PPR" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
        ]}
      />
    </StrategyPage>
  );
}

function SpinnerShell({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 flex flex-col items-center justify-center h-40 shadow-sm">
      <div className="h-4 w-24 shimmer rounded-full mx-auto mb-3 bg-zinc-100 dark:bg-zinc-800" />
      <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{title}</p>
    </div>
  );
}

function LikeIsland({ serverLikes }: { serverLikes: number }) {
  const fetcher = useFetcher();
  const isLiking = fetcher.formData?.get("intent") === "like";
  const optimisticLikes = serverLikes + (isLiking ? 1 : 0);

  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-6 text-center shadow-sm transition-all hover:shadow-md flex flex-col h-40"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-auto"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ Fetcher Like Button
      </p>
      <div className="flex justify-center mt-auto">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="like" />
          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold transition-transform shadow-sm ${
              isLiking ? "scale-110" : "hover:scale-105 active:scale-95"
            }`}
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            <span className="text-lg">❤️</span>
            <span className="text-base">{optimisticLikes}</span>
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

function PingIsland() {
  const fetcher = useFetcher();
  const isPinging = fetcher.state !== "idle";
  const timestamp = fetcher.data ? new Date().toLocaleTimeString() : "--:--:--";

  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-6 text-center shadow-sm transition-all hover:shadow-md flex flex-col h-40"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-auto"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ Edge Ping
      </p>
      <div className="mt-auto mb-2 flex flex-col gap-2">
        <button
          onClick={() => fetcher.load("/api/benchmark")}
          disabled={isPinging}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: "var(--s-accent)" }}
        >
          {isPinging ? "Pinging..." : "Ping Server"}
        </button>
        <p className="text-[10px] font-mono font-medium text-zinc-500">Last ping: {timestamp}</p>
      </div>
    </div>
  );
}

function CommentsIsland({ comments }: { comments: { id: string; text: string }[] }) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  // Optimistic UI for comments
  const optimisticComments = [...comments];
  if (isSubmitting && fetcher.formData?.get("comment")) {
    optimisticComments.push({
      id: "optimistic",
      text: fetcher.formData.get("comment") as string,
    });
  }

  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-5 shadow-sm transition-all hover:shadow-md flex flex-col h-40 row-span-2 sm:row-span-1 sm:col-span-2 lg:col-span-1"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-3 text-center"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ Fetcher Comments
      </p>
      <div className="space-y-2 mb-3 overflow-y-auto flex-1 text-xs pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
        {[...optimisticComments].reverse().map((c) => (
          <div
            key={c.id}
            className={`rounded-lg bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 border border-zinc-100 dark:border-zinc-800/50 transition-opacity ${c.id === "optimistic" ? "opacity-50" : "opacity-100"}`}
          >
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">{c.text}</p>
          </div>
        ))}
      </div>
      <fetcher.Form method="post" className="flex gap-2 mt-auto">
        <input type="hidden" name="intent" value="comment" />
        <input
          type="text"
          name="comment"
          required
          placeholder="Add comment..."
          className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 placeholder:text-zinc-400"
          style={{ "--tw-ring-color": "var(--s-accent)" } as any}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-xs rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm text-white disabled:opacity-70 disabled:pointer-events-none"
          style={{ backgroundColor: "var(--s-accent)" }}
        >
          {isSubmitting ? "..." : "Post"}
        </button>
      </fetcher.Form>
    </div>
  );
}

function ShareIsland() {
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (shared) {
      const id = setTimeout(() => setShared(false), 2000);
      return () => clearTimeout(id);
    }
  }, [shared]);

  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-6 text-center shadow-sm transition-all hover:shadow-md flex flex-col h-40"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-auto"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ URL-Driven Share
      </p>
      <div className="mt-auto">
        {shared ? (
          <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 animate-in zoom-in duration-300">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
              <span className="text-base">✅</span> Copied!
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
              setShared(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm"
            style={{ backgroundColor: "var(--s-accent)" }}
          >
            <span className="text-base">🔗</span> Share URL
          </button>
        )}
      </div>
    </div>
  );
}

function SearchIsland() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const submit = useSubmit();
  const items = ["Edge SSR", "Streaming", "ISR", "PPR", "Islands", "Static", "Suspense"];
  const filtered = query ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-5 shadow-sm transition-all hover:shadow-md flex flex-col h-40"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-3 text-center"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ URL Search
      </p>
      <Form replace preventScrollReset>
        <input
          type="text"
          name="q"
          defaultValue={query}
          onChange={(e) =>
            submit(e.currentTarget.form, { replace: true, preventScrollReset: true })
          }
          placeholder="Search..."
          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-zinc-950 transition-colors mb-2"
          style={{ "--tw-ring-color": "var(--s-accent)" } as any}
        />
      </Form>
      <div className="flex-1 overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          <ul className="space-y-1.5">
            {filtered.map((f) => (
              <li
                key={f}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
              >
                {f}
              </li>
            ))}
          </ul>
        ) : query ? (
          <p className="text-[10px] text-zinc-400 text-center mt-2 font-medium">No matches</p>
        ) : null}
      </div>
    </div>
  );
}

function TabsIsland() {
  const [tab, setTab] = useState(0);
  const items = ["Edge SSR", "Streaming", "ISR", "PPR"];
  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#050505] p-5 shadow-sm transition-all hover:shadow-md flex flex-col h-40"
      style={{ borderColor: "var(--s-border)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-3 text-center"
        style={{ color: "var(--s-accent)" }}
      >
        🏝️ URL Tabs
      </p>
      <div className="flex flex-wrap gap-1.5 mb-auto justify-center">
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(i)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${i === tab ? "shadow-sm text-white scale-105" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
            style={i === tab ? { backgroundColor: "var(--s-accent)" } : {}}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30">
        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 text-center">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{items[tab]}</span> is a
          rendering strategy.
        </p>
      </div>
    </div>
  );
}

const CODE = `// Each island is a self-contained component using RRv8 features
function LikeButton() {
  const fetcher = useFetcher();
  const formData = fetcher.formData;
  const isLiking = formData?.get("action") === "like";
  const optimisticLikes = isLiking ? likes + 1 : likes;

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="action" value="like" />
      <button type="submit">❤️ {optimisticLikes}</button>
    </fetcher.Form>
  );
}

function Tabs() {
  const [tab, setTab] = useState(0);
  return <button onClick={() => setTab(1)}>Tab {tab}</button>;
}`;
