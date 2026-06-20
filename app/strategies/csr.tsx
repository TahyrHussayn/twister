import type { Route } from "./+types/csr";
import { createMetrics } from "~/lib/metrics";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { CardSkeleton } from "~/components/skeleton";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";

export function meta() {
  return [
    { title: "CSR — Client-Side Rendering" },
    {
      name: "description",
      content:
        "Live CSR demo: minimal HTML shell with data fetched entirely in the browser via clientLoader",
    },
  ];
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

export async function loader() {
  return { metrics: createMetrics("CSR") };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const clientData = await fetchClientData();
  return { ...serverData, ...clientData };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <StrategyPage
      strategy="csr"
      emoji="🖥️"
      title="Client-Side Rendering"
      metrics={createMetrics("CSR")}
      description="The server sent a minimal HTML shell. Data is being fetched from the browser while you see this skeleton."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </StrategyPage>
  );
}

export default function CSR({ loaderData }: Route.ComponentProps) {
  const { metrics, message, items, timestamp } = loaderData as ClientData & {
    metrics: ReturnType<typeof createMetrics>;
  };

  return (
    <StrategyPage
      strategy="csr"
      emoji="🖥️"
      title="Client-Side Rendering"
      metrics={metrics}
      description={
        <>
          A minimal HTML shell loads from the edge, then{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            clientLoader
          </code>{" "}
          fetches data in the browser. A skeleton UI renders during the{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--s-bg)", color: "var(--s-text)" }}
          >
            HydrateFallback
          </code>{" "}
          phase.
        </>
      }
    >
      <SectionDivider label="How it works" />
      <CodeSnippet code={CSR_CODE} filename="app/strategies/csr.tsx" strategy="CSR" />

      <SectionDivider label="Live demo" />
      <div
        className="rounded-xl border p-4 text-sm"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <span style={{ color: "var(--s-text)" }}>{message}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
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
        Client fetch completed: {timestamp}
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Fast subsequent navigations", "Rich interactivity", "Very low server load"]}
        cons={["Poor SEO by default", "Slow initial page load", "JavaScript required"]}
        related={[
          { to: "/ssr", label: "SSR", emoji: "⚡" },
          { to: "/ssg", label: "SSG", emoji: "🏗️" },
          { to: "/islands", label: "Islands", emoji: "🏝️" },
        ]}
      />
    </StrategyPage>
  );
}

const CSR_CODE = `export async function clientLoader({ serverLoader }) {
  const serverData = await serverLoader();
  const clientData = await fetchClientData();
  return { ...serverData, ...clientData };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <LoadingSkeleton />;
}`;
