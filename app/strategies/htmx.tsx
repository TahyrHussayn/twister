import type { Route } from "./+types/htmx";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { useFetcher } from "react-router";

const STRATEGIES = [
  "Static Site Generation (SSG)",
  "Server-Side Rendering (SSR)",
  "Client-Side Rendering (CSR)",
  "Incremental Static Regeneration (ISR)",
  "Partial Prerendering (PPR)",
  "React Server Components (RSC)",
  "Islands Architecture",
  "Single Page Application (SPA)",
  "Hypermedia Driven UI (HTMX)",
];

const QUOTES = [
  "The web is a hypermedia system.",
  "Locality of Behavior makes code easier to maintain.",
  "You might not need that SPA framework.",
  "Return HTML, not JSON.",
  "REST is a software architectural style.",
  "Hypermedia as the Engine of Application State.",
];

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

  if (action === "search-strategies") {
    const q = url.searchParams.get("q")?.toLowerCase() || "";
    const filtered = q ? STRATEGIES.filter((s) => s.toLowerCase().includes(q)) : STRATEGIES;

    // Simulating slight delay for realistic search feel
    await new Promise((resolve) => setTimeout(resolve, 300));

    const items = filtered.length
      ? filtered
          .map(
            (s) =>
              `<li class="px-3 py-2 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 dark:text-zinc-300 animate-in fade-in duration-200">${s}</li>`,
          )
          .join("")
      : `<li class="px-3 py-2 text-sm text-zinc-500 text-center animate-in fade-in">No strategies found</li>`;

    return new Response(items, { headers: { "Content-Type": "text/html" } });
  }

  if (action === "quote-rotator") {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return new Response(
      `<div class="animate-in fade-in slide-in-from-bottom-2 duration-500 italic text-zinc-600 dark:text-zinc-400 font-serif text-lg text-center w-full px-4">"${quote}"</div>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }

  if (action === "rrv8-fetch-time") {
    return { time: new Date().toLocaleTimeString() };
  }

  return {
    metrics: createMetrics("HTMX"),
  };
}

export default function HTMX({ loaderData }: Route.ComponentProps) {
  const metrics = (loaderData as any)?.metrics;
  const fetcher = useFetcher();
  const fetcherData = fetcher.data as { time?: string } | undefined;

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
      <SectionDivider label="Interactive Demos" />

      {/* Load HTMX via CDN for this page */}
      <script
        src="https://unpkg.com/htmx.org@1.9.10"
        integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
        crossOrigin="anonymous"
      ></script>

      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* HTMX Button Fetch */}
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">HTMX HTML Swap</h3>
              <p className="text-sm text-zinc-500">
                Requests raw HTML, swaps it into the DOM directly.
              </p>
            </div>

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
              <span className="text-zinc-400 italic">HTML will appear here...</span>
            </div>
          </div>

          {/* RRv8 useFetcher Equivalent */}
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">RRv8 useFetcher</h3>
              <p className="text-sm text-zinc-500">
                Requests JSON data, updates React component state.
              </p>
            </div>

            <button
              onClick={() => fetcher.load("?action=rrv8-fetch-time")}
              className="px-6 py-2.5 rounded-full font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: "var(--s-accent)" }}
            >
              Fetch JSON Time
            </button>

            <div className="w-full h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              {fetcherData?.time ? (
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                  <span className="text-sm text-zinc-500 block mb-1">JSON Result</span>
                  <strong className="text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
                    {fetcherData.time}
                  </strong>
                </div>
              ) : (
                <span className="text-zinc-400 italic">JSON will appear here...</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* HTMX Live Search */}
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm">
            <div className="text-center w-full">
              <h3 className="font-bold text-lg mb-2">HTMX Live Search</h3>
              <p className="text-sm text-zinc-500">
                keyup delayed search, responds with HTML list items.
              </p>
            </div>

            <div className="w-full">
              <input
                type="text"
                name="q"
                placeholder="Search strategies..."
                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--s-accent)] transition-all"
                {...{
                  "hx-get": "?action=search-strategies",
                  "hx-trigger": "keyup changed delay:200ms",
                  "hx-target": "#search-results",
                }}
              />
              <div className="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-lg max-h-48 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50">
                <ul id="search-results" className="p-0 m-0 list-none">
                  <li className="px-3 py-3 text-sm text-zinc-500 text-center">Type to search...</li>
                </ul>
              </div>
            </div>
          </div>

          {/* HTMX Polling */}
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] shadow-sm justify-center">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">HTMX Polling</h3>
              <p className="text-sm text-zinc-500">
                Triggers automatically on load and every 3 seconds.
              </p>
            </div>

            <div
              className="w-full h-32 flex items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/50"
              {...{
                "hx-get": "?action=quote-rotator",
                "hx-trigger": "load, every 3s",
                "hx-swap": "innerHTML",
              }}
            >
              <span className="text-zinc-400 italic text-sm">Initializing...</span>
            </div>
          </div>
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

const HTMX_CODE = `// 1. HTMX Buttons and Inputs
<button hx-get="?action=fetch-time" hx-target="#time">Fetch Time</button>

<input 
  type="text" name="q"
  hx-get="?action=search" 
  hx-trigger="keyup changed delay:200ms"
  hx-target="#results"
/>

// 2. RRv8 useFetcher Equivalent
function TimeFetcher() {
  const fetcher = useFetcher();
  return (
    <button onClick={() => fetcher.load("?action=rrv8-fetch-time")}>
      Fetch JSON
    </button>
  );
}

// 3. Unified Server Loader
export async function loader({ request }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // HTMX HTML response
  if (action === "fetch-time") {
    return new Response(
      \`<div><strong>\${new Date().toLocaleTimeString()}</strong></div>\`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // RRv8 JSON response
  if (action === "rrv8-fetch-time") {
    return { time: new Date().toLocaleTimeString() };
  }
}
`;
