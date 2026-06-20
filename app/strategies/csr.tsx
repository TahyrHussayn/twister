import type { Route } from "./+types/csr";
import { createMetrics } from "~/lib/metrics";
import { MetricsBar } from "~/components/metrics-badge";
import { CardSkeleton } from "~/components/skeleton";
import { useState } from "react";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "CSR — Client-Side Rendering" },
    {
      name: "description",
      content: "Live CSR demo: HTML skeleton with data fetched entirely in the browser",
    },
  ];
}

type ClientData = {
  message: string;
  items: { id: number; title: string; body: string }[];
  timestamp: string;
};

async function fetchClientData(): Promise<ClientData> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const items = (await res.json()) as ClientData["items"];
  return {
    message: "This data was fetched entirely in the browser via the clientLoader.",
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
  const metrics = createMetrics("CSR");

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🖥️</span>
          <h1 className="text-3xl font-bold">Client-Side Rendering</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          The server sent only a minimal HTML shell. Data is being fetched from the browser. While
          the clientLoader runs, you see this skeleton UI.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
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
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🖥️</span>
          <h1 className="text-3xl font-bold">Client-Side Rendering</h1>
        </div>
        <MetricsBar metrics={metrics} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
          This page receives a minimal HTML shell from the edge. All data fetching happens in the
          browser via{" "}
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            clientLoader
          </code>
          . A skeleton UI is shown during the{" "}
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            HydrateFallback
          </code>{" "}
          phase.
        </p>
      </header>

      {data ? (
        <>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-700 dark:text-purple-300">{data.message}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
              >
                <h3 className="font-semibold mb-2 capitalize">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{item.body}</p>
              </div>
            ))}
          </div>
          <footer className="text-xs text-gray-400 font-mono text-center">
            Client fetch completed at: {data.timestamp}
          </footer>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
