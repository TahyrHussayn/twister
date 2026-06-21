import type { Route } from "./+types/htmx";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";

export function meta() {
  return [
    { title: "HTMX — Hypermedia Driven UI" },
    {
      name: "description",
      content:
        "HTMX demo: Using attributes to trigger AJAX requests and swap HTML responses, eliminating heavy client JS.",
    },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "fetch-time") {
    const time = new Date().toLocaleTimeString();
    // Return an HTML fragment for HTMX to swap in
    return new Response(
      `<div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center animate-in fade-in zoom-in duration-300">
        <span class="text-sm text-zinc-500 block mb-1">Server Time</span>
        <strong class="text-2xl text-emerald-600 dark:text-emerald-400 font-mono">${time}</strong>
      </div>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  return {
    metrics: createMetrics("HTMX"),
  };
}

export default function HTMX({ loaderData }: Route.ComponentProps) {
  const { metrics } = loaderData;

  return (
    <StrategyPage
      strategy="htmx"
      title="Hypermedia Driven UI (HTMX)"
      metrics={metrics}
      description={
        <>
          HTMX gives you access to AJAX, CSS Transitions, WebSockets and Server Sent Events directly
          in HTML, using attributes. This eliminates the need for heavy client-side JavaScript
          frameworks. The server sends HTML fragments instead of JSON.
        </>
      }
    >
      <SectionDivider label="Interactive Demo" />

      {/* Load HTMX via CDN for this page */}
      <script
        src="https://unpkg.com/htmx.org@1.9.10"
        integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
        crossOrigin="anonymous"
      ></script>

      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm max-w-xl mx-auto">
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">HTMX Server Swap</h3>
          <p className="text-sm text-zinc-500">
            Clicking the button sends a request to the server, which responds with an HTML fragment.
            HTMX swaps it into the target div automatically.
          </p>
        </div>

        {/*
          hx-get triggers a GET request
          hx-target tells it where to put the result
          hx-swap tells it how to swap (innerHTML by default)
        */}
        <button
          className="px-6 py-2.5 rounded-full font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
          style={{ backgroundColor: "var(--s-accent)" }}
          {...{
            "hx-get": "?action=fetch-time",
            "hx-target": "#time-result",
            "hx-swap": "innerHTML",
          }}
        >
          Fetch Current Time
        </button>

        <div
          id="time-result"
          className="w-full h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl"
        >
          <span className="text-zinc-400 italic">Result will appear here...</span>
        </div>
      </div>

      <SectionDivider label="How it works" />
      <CodeSnippet code={HTMX_CODE} filename="app/strategies/htmx.tsx" strategy="HTMX" />

      <SectionDivider label="When to use it" />
      <ComparisonPanel
        pros={[
          "Zero client JS framework required",
          "Simple mental model",
          "Uses standard HTML attributes",
        ]}
        cons={[
          "Requires server roundtrips for interaction",
          "UI state lives on the server",
          "Harder to build highly complex client state",
        ]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/islands", label: "Islands", key: "Islands" },
          { to: "/csr", label: "CSR", key: "CSR" },
        ]}
      />
    </StrategyPage>
  );
}

const HTMX_CODE = `// 1. Client Button with HTMX attributes
<button
  hx-get="?action=fetch-time"
  hx-target="#time-result"
  hx-swap="innerHTML"
>
  Fetch Current Time
</button>

// 2. Target Container
<div id="time-result">...</div>

// 3. Server Endpoint returning raw HTML
export async function loader({ request }) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "fetch-time") {
    return new Response(
      \`<div class="p-4 bg-zinc-100 rounded-lg text-center">
        <strong>\${new Date().toLocaleTimeString()}</strong>
      </div>\`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
`;
