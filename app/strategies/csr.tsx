import type { Route } from "./+types/csr";
import { Form, useActionData, useNavigation } from "react-router";
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const feedback = formData.get("feedback") as string;

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600));

  if (!feedback || feedback.length < 10) {
    return { error: "Feedback must be at least 10 characters long to be useful!" };
  }

  return { success: true, message: "Thanks for the feedback!" };
}

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
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formAction === "/csr";

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

      <SectionDivider label="Client-Side Form Validation" />
      <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="text-xl">📝</span> Provide Feedback
        </h3>
        <p className="text-sm text-zinc-500 mb-6 font-medium">
          Demonstrates{" "}
          <code className="text-[10px] font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
            clientAction
          </code>{" "}
          and{" "}
          <code className="text-[10px] font-mono text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-1 py-0.5 rounded">
            useActionData
          </code>{" "}
          for hook-less form validation.
        </p>

        <Form method="post" className="space-y-4">
          <div>
            <textarea
              name="feedback"
              placeholder="What do you think of this CSR strategy?..."
              className={`w-full min-h-[100px] px-4 py-3 text-sm font-medium rounded-xl border bg-zinc-50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 transition-colors placeholder:text-zinc-400 ${
                actionData?.error
                  ? "border-rose-500 focus:ring-rose-500/50"
                  : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/50"
              }`}
            />
            {actionData?.error && (
              <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                {actionData.error}
              </p>
            )}
            {actionData?.success && (
              <p className="mt-2 text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                {actionData.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Validating..." : "Submit Feedback"}
            </button>
          </div>
        </Form>
      </div>

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
