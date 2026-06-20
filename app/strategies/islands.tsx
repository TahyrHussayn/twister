import { Suspense, useState, useEffect } from "react";
import type { Route } from "./+types/islands";
import { fetchUserProfile, fetchServerTimestamp } from "~/lib/data";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Islands — React Islands Architecture" },
    {
      name: "description",
      content: "Live Islands demo: static HTML with independently hydrated interactive components",
    },
  ];
}

export async function loader() {
  const profile = await fetchUserProfile(100);
  const timestamp = fetchServerTimestamp();
  const metrics = createMetrics("Islands");
  return { profile, timestamp, metrics };
}

export default function Islands({ loaderData }: Route.ComponentProps) {
  const { profile, timestamp, metrics } = loaderData;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏝️</span>
          <h1 className="text-3xl font-bold">React Islands Architecture</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          The page itself is standard SSR. But each interactive component below is an independent
          "island" — it hydrates on its own, ships only the JS it needs, and doesn't block other
          islands from becoming interactive. The static content renders immediately from the server.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
          <p className="text-sm font-mono text-teal-700 dark:text-teal-300">
            Each island hydrates independently. No shared state. Minimal JS per component.
          </p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<IslandShell title="Like Button" />}>
          <LikeButtonIsland />
        </Suspense>
        <Suspense fallback={<IslandShell title="Clock" />}>
          <ClockIsland />
        </Suspense>
        <Suspense fallback={<IslandShell title="Comments" />}>
          <CommentsIsland />
        </Suspense>
        <Suspense fallback={<IslandShell title="Share Widget" />}>
          <ShareIsland />
        </Suspense>
        <Suspense fallback={<IslandShell title="Search" />}>
          <SearchIsland />
        </Suspense>
        <Suspense fallback={<IslandShell title="Dark Mode Toggle" />}>
          <ThemeToggleIsland />
        </Suspense>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">This profile card is server-rendered (static).</p>
      </section>

      <footer className="text-xs text-gray-400 font-mono text-center">
        Server timestamp: {timestamp}
        <br />
        Each island loads its own JS bundle independently
      </footer>
    </div>
  );
}

function IslandShell({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center justify-center h-32">
      <div className="text-center">
        <div className="animate-pulse h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
        <p className="text-xs text-gray-400">{title} loading...</p>
      </div>
    </div>
  );
}

function LikeButtonIsland() {
  const [likes, setLikes] = useState(42);

  return (
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6 text-center">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Like Button</p>
      <button
        type="button"
        onClick={() => setLikes((l) => l + 1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors font-medium"
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
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6 text-center">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Live Clock</p>
      <p className="text-2xl font-mono font-bold">{time.toLocaleTimeString()}</p>
    </div>
  );
}

function CommentsIsland() {
  const [comments, setComments] = useState<string[]>([
    "Great architecture!",
    "Islands are the future",
  ]);
  const [input, setInput] = useState("");

  const add = () => {
    if (input.trim()) {
      setComments((c) => [...c, input.trim()]);
      setInput("");
    }
  };

  return (
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Comments</p>
      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {comments.map((c, i) => (
          <p key={i} className="text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
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
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
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
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6 text-center">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Share Widget</p>
      {shared ? (
        <p className="text-green-600 dark:text-green-400 font-medium text-sm">Link copied!</p>
      ) : (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
            setShared(true);
          }}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
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
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Search</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search strategies..."
        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mb-2"
      />
      {filtered.length > 0 && (
        <ul className="space-y-1">
          {filtered.map((f) => (
            <li key={f} className="text-sm px-2 py-1 rounded bg-gray-50 dark:bg-gray-800">
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThemeToggleIsland() {
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-6 text-center">
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">🏝️ Theme Toggle</p>
      <button
        type="button"
        onClick={toggle}
        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium hover:opacity-80 transition-opacity"
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
