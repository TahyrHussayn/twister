import type { Route } from "./+types/htmx";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { FlowDiagram } from "~/components/flow-diagram";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { useFetcher } from "react-router";
import { useEffect } from "react";

const QUOTES = [
  "Hypermedia as the Engine of Application State. — Roy Fielding",
  "Locality of Behavior makes code easier to reason about.",
  "Return HTML from your server. Simplify everything.",
  "You might not need a JavaScript framework for this.",
  "REST: Representational State Transfer. HTML IS state.",
  "The web was designed for hypermedia exchange.",
];

const STRATEGIES_LIST = [
  "Server-Side Rendering (SSR)",
  "Client-Side Rendering (CSR)",
  "Static Site Generation (SSG)",
  "Streaming SSR",
  "Incremental Static Regeneration (ISR)",
  "Streaming + Edge Cache",
  "Islands Architecture",
  "HTMX Hypermedia",
  "Hybrid Rendering",
  "Edge vs Origin",
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "time") {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return new Response(
      `<div style="font-family:monospace;font-size:1.75rem;font-weight:700;color:#6366f1;text-align:center;padding:1rem;border-radius:0.75rem;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);">${time}</div>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }

  if (action === "search") {
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const filtered = q
      ? STRATEGIES_LIST.filter((s) => s.toLowerCase().includes(q))
      : STRATEGIES_LIST;
    await new Promise((r) => setTimeout(r, 150));
    const items = filtered.length
      ? filtered
          .map(
            (s) =>
              `<li style="padding:0.625rem 0.875rem;font-size:0.875rem;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1;">${s.replace(
                new RegExp(q, "gi"),
                (m) => `<strong style="color:#6366f1;">${m}</strong>`,
              )}</li>`,
          )
          .join("")
      : `<li style="padding:0.625rem;font-size:0.875rem;color:#64748b;text-align:center;">No results found</li>`;
    return new Response(items, { headers: { "Content-Type": "text/html" } });
  }

  if (action === "quote") {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return new Response(
      `<div style="font-size:0.9375rem;font-style:italic;color:#94a3b8;text-align:center;padding:1rem;line-height:1.6;">&ldquo;${quote}&rdquo;</div>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }

  if (action === "fetcher-time") {
    return { time: new Date().toLocaleTimeString() };
  }

  return { metrics: createMetrics("HTMX") };
}

export function headers() {
  return { "X-Render-Strategy": "HTMX" };
}

export default function HTMXPage({ loaderData }: Route.ComponentProps) {
  const metrics = "metrics" in loaderData ? loaderData.metrics : undefined;
  const fetcher = useFetcher<{ time: string }>();

  const flowSteps = [
    { icon: "🖱️", label: "User Action", active: true },
    { icon: "📡", label: "hx-get Request", active: true },
    { icon: "🖥️", label: "Server Response", active: true },
    { icon: "🧱", label: "HTML Fragment", active: true },
    { icon: "🔄", label: "DOM Swap", active: true },
  ];

  // Process HTMX dynamically when component mounts or updates
  useEffect(() => {
    // Check if HTMX is loaded from the script tag
    const htmx = (window as any).htmx;
    if (htmx) {
      htmx.process(document.body);
    }
  });

  return (
    <StrategyPage
      strategy="htmx"
      title="HTMX Hypermedia UI"
      icon="⚡"
      description="HTML fragments are returned directly by the server and swapped into the DOM. Eliminates the need for heavy client-side JavaScript libraries or manual state synchronization."
      metrics={metrics}
    >
      {/* Load HTMX from CDN */}
      <script src="https://unpkg.com/htmx.org@1.9.10" />

      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="HTMX vs React useFetcher" />

      {/* Side by side comparison */}
      <section
        style={{
          marginBottom: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {/* Left: HTMX Swap */}
        <div
          className="glass-card p-6"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <h3 className="eyebrow" style={{ color: "var(--s-accent)" }}>
            HTMX (Swaps HTML fragment)
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
            Clicking this button fires a standard HTTP GET request. The server returns a snippet of
            raw HTML, which HTMX automatically swaps into the div below.
          </p>
          <button
            {...{
              "hx-get": "?action=time",
              "hx-target": "#htmx-time",
              "hx-swap": "innerHTML",
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.3)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Get Server Time (HTML)
          </button>
          <div
            id="htmx-time"
            style={{
              minHeight: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#475569", fontSize: 13 }}>Waiting for click...</span>
          </div>
        </div>

        {/* Right: React useFetcher */}
        <div
          className="glass-card p-6"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <h3 className="eyebrow">React useFetcher (JSON API)</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
            Fires a client-side route request. The loader returns a JSON object, React updates the
            local state, and re-renders the component with the new data.
          </p>
          <button
            onClick={() => {
              void fetcher.submit({}, { method: "get", action: "?action=fetcher-time" });
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Get Server Time (JSON)
          </button>
          <div
            style={{
              minHeight: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {fetcher.data?.time ? (
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {fetcher.data.time}
              </div>
            ) : (
              <span style={{ color: "#475569", fontSize: 13 }}>Waiting for click...</span>
            )}
          </div>
        </div>
      </section>

      <SectionDivider label="HTMX Live Search" />

      {/* HTMX Live Search */}
      <section
        className="glass-card p-6 animate-in"
        style={{ marginBottom: 48, display: "flex", flexDirection: "column", gap: 16 }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
          Search strategy routes in real-time. HTMX issues a request on keyup (with a 200ms delay to
          throttle typing) and swaps the resulting list.
        </p>
        <input
          type="text"
          placeholder="Type to search strategies..."
          {...{
            "hx-get": "?action=search",
            "hx-trigger": "keyup changed delay:200ms",
            "hx-target": "#search-results",
            "hx-indicator": "#search-spinner",
          }}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 14,
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            id="search-spinner"
            className="htmx-indicator"
            style={{ display: "none", fontSize: 12, color: "var(--s-accent)", marginBottom: 8 }}
          >
            Searching...
          </div>
          <ul
            id="search-results"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
            }}
          >
            {STRATEGIES_LIST.map((s) => (
              <li
                key={s}
                style={{
                  padding: "10px 14px",
                  fontSize: "14px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionDivider label="HTMX Auto-Polling Quote" />

      {/* Auto polling */}
      <section className="glass-card p-6" style={{ marginBottom: 48 }}>
        <p className="eyebrow" style={{ color: "#64748b", marginBottom: 8 }}>
          Auto-polling every 3 seconds
        </p>
        <div
          {...{
            "hx-get": "?action=quote",
            "hx-trigger": "load, every 3s",
            "hx-swap": "innerHTML",
          }}
          style={{
            minHeight: 50,
            borderRadius: 8,
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#475569", fontSize: 13 }}>Loading first quote...</span>
        </div>
      </section>

      <SectionDivider label="How it works" />
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={HTMX_CODE} filename="app/strategies/htmx.tsx" language="html" />
      </section>

      <SectionDivider label="Strategy Assessment" />
      <ComparisonPanel
        pros={["Zero client JS framework", "Standard HTML semantics", "Simple mental model"]}
        cons={[
          "Server roundtrip per interaction",
          "Complex client state is hard",
          "Less ecosystem tooling",
        ]}
        related={[
          { to: "/ssr", label: "SSR" },
          { to: "/islands", label: "Islands" },
          { to: "/csr", label: "CSR" },
        ]}
      />
    </StrategyPage>
  );
}

const HTMX_CODE = `<!-- Include HTMX library via CDN -->
<script src="https://unpkg.com/htmx.org@1.9.10"></script>

<!-- Trigger request and swap innerHTML -->
<button hx-get="/htmx?action=time"
        hx-target="#time-display"
        hx-swap="innerHTML">
  Get Time
</button>

<div id="time-display">
  <!-- Raw HTML snippet swapped here -->
</div>`;
