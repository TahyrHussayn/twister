import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { useState } from "react";

export function meta() {
  return [{ title: "CSR — Client-Side Rendering" }];
}

type ClientData = {
  message: string;
  items: { id: number; title: string; body: string }[];
  timestamp: string;
};

async function fetchClientData(): Promise<ClientData> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=6");
  const items = (await res.json()) as ClientData["items"];
  return {
    message: "This data was fetched entirely in the browser via clientLoader.",
    items,
    timestamp: new Date().toISOString(),
  };
}

let _hydrated = false;

export async function clientLoader() {
  _hydrated = true;
  return fetchClientData();
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">🖥️ Client-Side Rendering</h1>
        <MetricsBar metrics={createMetrics("CSR")} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          The server sent a minimal HTML shell. Data is being fetched from the browser.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export async function loader() {
  return { metrics: createMetrics("CSR") };
}

export default function CSR() {
  const [data, setData] = useState<ClientData | null>(null);
  const metrics = createMetrics("CSR");
  if (!_hydrated) {
    void fetchClientData().then(setData);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold mb-1">🖥️ Client-Side Rendering</h1>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          A minimal HTML shell loads from the edge, then{" "}
          <code className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-xs font-mono text-purple-700 dark:text-purple-300">
            clientLoader
          </code>{" "}
          fetches data in the browser. A skeleton UI renders during{" "}
          <code className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-xs font-mono text-purple-700 dark:text-purple-300">
            HydrateFallback
          </code>
          .
        </p>
      </header>

      <CodeSnippet code={CSR_CODE} filename="app/strategies/csr.tsx" strategy="CSR" />

      {data ? (
        <>
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-sm text-purple-700 dark:text-purple-300">
            {data.message}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 card-hover"
              >
                <h3 className="font-semibold text-sm mb-2 capitalize">{item.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-mono text-zinc-400">
            Client fetch completed: {data.timestamp}
          </p>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      <ComparisonPanel
        pros={["Fast subsequent navigations", "Rich interactivity", "Very low server load"]}
        cons={["Poor SEO by default", "Slow initial page load", "JavaScript required"]}
        related={[
          { to: "/ssr", label: "SSR", emoji: "⚡" },
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/islands", label: "Islands", emoji: "🏝️" },
        ]}
      />
    </div>
  );
}

const CSR_CODE = `export async function clientLoader() {
  return fetchClientData();
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <LoadingSkeleton />;
}`;
