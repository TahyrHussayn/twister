import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/islands";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";

export function meta() {
  return [{ title: "Islands — React Islands Architecture" }];
}

export async function loader() {
  return {
    profile: await fetchUserProfile(100),
    timestamp: fetchServerTimestamp(),
    metrics: createMetrics("Islands"),
  };
}

export default function Islands({ loaderData }: Route.ComponentProps) {
  const { profile, timestamp, metrics } = loaderData;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">🏝️ React Islands Architecture</h1>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          The page is standard SSR. But each interactive component below is an independent "island"
          — it hydrates on its own, ships only its JS, and doesn't block other islands.
        </p>
        <div className="mt-4 p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950 text-sm">
          <p className="text-teal-700 dark:text-teal-300 font-mono text-xs">
            Each island hydrates independently. No shared state. Minimal JS per component.
          </p>
        </div>
      </header>

      <CodeSnippet code={ISLANDS_CODE} filename="app/strategies/islands.tsx" strategy="Islands" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<SpinnerShell title="Like Button" />}>
          <LikeIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Clock" />}>
          <ClockIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Comments" />}>
          <CommentsIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Share" />}>
          <ShareIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Search" />}>
          <SearchIsland />
        </Suspense>
        <Suspense fallback={<SpinnerShell title="Theme" />}>
          <ThemeIsland />
        </Suspense>
      </div>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-zinc-500">{profile.email}</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 mt-3">This profile is server-rendered (static).</p>
      </section>

      <p className="text-center text-[11px] font-mono text-zinc-400">
        Server timestamp: {timestamp} · Each island ships its own JS bundle
      </p>

      <ComparisonPanel
        pros={["Minimal JS shipped", "Independent hydration", "Excellent performance"]}
        cons={["Not for app-like UIs", "Cross-island communication hard", "Tooling still emerging"]}
        related={[
          { to: "/csr", label: "CSR", emoji: "🖥️" },
          { to: "/ppr", label: "PPR", emoji: "🧩" },
          { to: "/streaming", label: "Streaming", emoji: "🌊" },
        ]}
      />
    </div>
  );
}

function SpinnerShell({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center justify-center h-28">
      <div className="text-center">
        <div className="h-3 w-20 shimmer rounded mx-auto mb-2" />
        <p className="text-[10px] text-zinc-400">{title} loading...</p>
      </div>
    </div>
  );
}

function LikeIsland() {
  const [likes, setLikes] = useState(42);
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5 text-center card-hover">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Like Button
      </p>
      <button
        type="button"
        onClick={() => setLikes((l) => l + 1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors text-sm font-medium"
      >
        ❤️ {likes}
      </button>
    </div>
  );
}

function ClockIsland() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5 text-center card-hover">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Live Clock
      </p>
      <p className="text-2xl font-mono font-bold">{time.toLocaleTimeString()}</p>
    </div>
  );
}

function CommentsIsland() {
  const [comments, setComments] = useState(["Great architecture!", "Islands are the future"]);
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim()) {
      setComments((c) => [...c, input]);
      setInput("");
    }
  };
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Comments
      </p>
      <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto text-xs">
        {[...comments].reverse().map((c, i) => (
          <p
            key={i}
            className="border-b border-zinc-50 dark:border-zinc-800 pb-1 text-zinc-600 dark:text-zinc-400"
          >
            {c}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add comment..."
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
}

function ShareIsland() {
  const [shared, setShared] = useState(false);
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5 text-center card-hover">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Share Widget
      </p>
      {shared ? (
        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Link copied!</p>
      ) : (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
            setShared(true);
          }}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors"
        >
          Share URL
        </button>
      )}
    </div>
  );
}

function SearchIsland() {
  const [query, setQuery] = useState("");
  const items = ["Edge SSR", "Streaming", "ISR", "PPR", "Islands", "Static", "Suspense"];
  const filtered = query ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Search
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search strategies..."
        className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
      />
      {filtered.length > 0 && (
        <ul className="space-y-1">
          {filtered.map((f) => (
            <li key={f} className="text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800">
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThemeIsland() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    setDark((d) => {
      const n = !d;
      document.documentElement.classList.toggle("dark", n);
      return n;
    });
  };
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 p-5 text-center card-hover">
      <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-3 uppercase tracking-wider">
        🏝️ Theme Toggle
      </p>
      <button
        type="button"
        onClick={toggle}
        className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium hover:opacity-80 transition-opacity"
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}

const ISLANDS_CODE = `// Each island is a self-contained component
function LikeButton() {
  const [likes, setLikes] = useState(42);
  return <button onClick={() => setLikes(l=>l+1)}>
    ❤️ {likes}
  </button>;
}

function Clock() {
  const [t, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1e3);
    return () => clearInterval(id);
  }, []);
  return <time>{t.toLocaleTimeString()}</time>;
}`;
