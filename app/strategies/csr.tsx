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
      title="Client-Side Rendering"
      metrics={createMetrics("CSR")}
      description="The server sent a minimal HTML shell. Data is being fetched from the browser while you see this skeleton."
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram (Fallback State) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step">
          <span className="text-lg">📱</span>
          <span>Client Request</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="text-lg">🦴</span>
          <span>Empty Shell</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">📦</span>
          <span>JS Downloads</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step opacity-50">
          <span className="text-lg">✨</span>
          <span>Client Renders</span>
        </div>
      </div>

      <SectionDivider label="Live demo" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      title="Client-Side Rendering"
      metrics={metrics}
      description={
        <>
          A minimal HTML shell loads from the edge, then{" "}
          <code
            className="px-1.5 py-0.5 rounded font-mono text-[11px] border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            clientLoader
          </code>{" "}
          fetches data in the browser. A skeleton UI renders during the{" "}
          <code
            className="px-1.5 py-0.5 rounded font-mono text-[11px] border"
            style={{
              backgroundColor: "var(--s-bg)",
              color: "var(--s-text)",
              borderColor: "var(--s-border)",
            }}
          >
            HydrateFallback
          </code>{" "}
          phase.
        </>
      }
    >
      <SectionDivider label="Request Lifecycle" />

      {/* Flow Diagram (Loaded State) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]">
        <div className="flow-step">
          <span className="text-lg">📱</span>
          <span>Client Request</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="text-lg">🦴</span>
          <span>Empty Shell</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="text-lg">📦</span>
          <span>JS Downloads</span>
        </div>
        <div className="flow-arrow active">→</div>
        <div className="flow-step active">
          <span className="text-lg">✨</span>
          <span>Client Renders</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={CSR_CODE} filename="app/strategies/csr.tsx" strategy="CSR" />

      <SectionDivider label="Live demo" />
      <div
        className="rounded-2xl border p-5 text-sm my-6 shadow-sm flex items-center gap-4"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <span className="text-2xl filter drop-shadow-sm">🌐</span>
        <div>
          <span className="font-bold text-sm block mb-0.5" style={{ color: "var(--s-text)" }}>
            Client-side Data Fetch
          </span>
          <span className="text-xs opacity-80" style={{ color: "var(--s-text)" }}>
            {message}
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border bg-white dark:bg-[#050505] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
            style={{ borderColor: "var(--s-border)" }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity"
              style={{ color: "var(--s-accent)" }}
            />
            <div className="w-8 h-8 rounded-full mb-4 flex items-center justify-center text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              #{item.id}
            </div>
            <h3 className="font-bold text-sm mb-3 capitalize text-zinc-900 dark:text-zinc-100 leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] font-mono font-medium text-zinc-500 py-6">
        Client fetch completed: <span style={{ color: "var(--s-text)" }}>{timestamp}</span>
      </p>

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={["Fast subsequent navigations", "Rich interactivity", "Very low server load"]}
        cons={["Poor SEO by default", "Slow initial page load", "JavaScript required"]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/ssg", label: "SSG", key: "SSG" },
          { to: "/islands", label: "Islands", key: "Islands" },
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
