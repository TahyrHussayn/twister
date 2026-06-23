import type { Route } from "./+types/csr";
import { useFetcher } from "react-router";
import { makeProducts, type Product } from "~/lib/seed";
import { createMetrics } from "~/lib/metrics";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { FlowDiagram } from "~/components/flow-diagram";
import { CardSkeleton } from "~/components/skeleton";

// ─── Server loader ──────────────────────────────────────────────────────────────
export async function loader() {
  return { serverRenderedAt: new Date().toISOString(), metrics: createMetrics("CSR") };
}

export function headers() {
  return { "Cache-Control": "no-store", "X-Render-Strategy": "CSR" };
}

// ─── Client loader (runs in browser) ────────────────────────────────────────────
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const seed = Math.floor(Date.now() / 10_000);
  const favorites: string[] = JSON.parse(localStorage.getItem("twister_csr_favs") ?? "[]");
  return {
    ...serverData,
    products: makeProducts(seed, 6),
    favorites,
    clientRenderedAt: new Date().toISOString(),
    userAgent: navigator.userAgent.slice(0, 80),
    online: navigator.onLine,
    cores: navigator.hardwareConcurrency ?? "N/A",
    lang: navigator.language,
  };
}
clientLoader.hydrate = true;

// ─── Client action (favorites) ──────────────────────────────────────────────────
export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const id = form.get("id") as string;
  const action = form.get("action") as string;
  const current: string[] = JSON.parse(localStorage.getItem("twister_csr_favs") ?? "[]");
  const updated =
    action === "add" ? [...new Set([...current, id])] : current.filter((x) => x !== id);
  localStorage.setItem("twister_csr_favs", JSON.stringify(updated));
  return { favorites: updated };
}

// ─── HydrateFallback ────────────────────────────────────────────────────────────
export function HydrateFallback() {
  return (
    <div
      style={{
        background: "#0c0d1a",
        minHeight: "100vh",
        padding: "60px 24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
        <div>
          <div
            className="skeleton"
            style={{ width: 200, height: 12, borderRadius: 4, marginBottom: 8 }}
          />
          <div className="skeleton" style={{ width: 320, height: 8, borderRadius: 4 }} />
        </div>
      </div>

      {/* Loading notice */}
      <div
        style={{
          padding: "20px 24px",
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 14,
          marginBottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#8b5cf6",
            boxShadow: "0 0 10px #8b5cf6",
            animation: "pulse 1s infinite ease-in-out",
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#a78bfa", fontSize: 14 }}>
            Client rendering in progress…
          </p>
          <p style={{ margin: 0, color: "#475569", fontSize: 13 }}>
            The server delivered an empty HTML shell. JavaScript is hydrating and running
            clientLoader() to fetch data from localStorage and the browser environment.
          </p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
      </div>

      {/* Skeleton cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Product item component ─────────────────────────────────────────────────────
function ProductItem({ product, isFavorite }: { product: Product; isFavorite: boolean }) {
  const fetcher = useFetcher<{ favorites: string[] }>();

  const pendingAction = fetcher.formData?.get("action") as string | null;
  const isFav = pendingAction === "add" ? true : pendingAction === "remove" ? false : isFavorite;

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${isFav ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <fetcher.Form method="post">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="action" value={isFav ? "remove" : "add"} />
          <button
            type="submit"
            title={isFav ? "Remove from favourites" : "Add to favourites"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              padding: "0 4px",
              transition: "transform 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isFav ? "⭐" : "☆"}
          </button>
        </fetcher.Form>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 3px",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--color-fg, #f1f5f9)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{product.category}</p>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            margin: "0 0 3px",
            fontFamily: "ui-monospace, monospace",
            fontWeight: 800,
            fontSize: 14,
            color: "#8b5cf6",
          }}
        >
          ${product.price}
        </p>
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 9999,
            background: product.inStock ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
            color: product.inStock ? "#10b981" : "#475569",
            fontWeight: 700,
            opacity: product.inStock ? 1 : 0.6,
          }}
        >
          {product.inStock ? "✓ in stock" : "✗ sold out"}
        </span>
      </div>
    </li>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function CSRPage({ loaderData }: Route.ComponentProps) {
  const data = loaderData as Awaited<ReturnType<typeof clientLoader>>;
  const {
    serverRenderedAt,
    products,
    favorites,
    clientRenderedAt,
    userAgent,
    online,
    cores,
    lang,
  } = data;

  const flowSteps = [
    { icon: "🌍", label: "Browser", sublabel: "HTTP request", active: true },
    { icon: "📄", label: "Empty Shell", sublabel: "instant HTML" },
    { icon: "💧", label: "Hydrate", sublabel: "JS bundle loads" },
    { icon: "🔄", label: "clientLoader", sublabel: "browser APIs + data", active: true },
    { icon: "✅", label: "Rendered", sublabel: "full UI painted" },
  ];

  const serverTime = new Date(serverRenderedAt);
  const clientTime = new Date(clientRenderedAt ?? serverRenderedAt);
  const gapMs = clientTime.getTime() - serverTime.getTime();

  const favSet = new Set(favorites ?? []);

  return (
    <StrategyPage
      strategy="csr"
      title="Client-Side Rendering"
      icon="🌐"
      description="The server delivers a bare HTML shell instantly. JavaScript hydrates in the browser and runs clientLoader() to populate the UI with real data from browser APIs and local storage."
    >
      {/* ── Flow Diagram ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Request Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="The Hydration Proof" />

      {/* ── Timestamp Proof ───────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(139,92,246,0.07)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 14,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
            The server rendered an <strong style={{ color: "#e2e8f0" }}>empty shell</strong>. The
            client ran{" "}
            <code
              style={{
                background: "rgba(139,92,246,0.2)",
                padding: "1px 6px",
                borderRadius: 4,
                color: "#a78bfa",
              }}
            >
              clientLoader
            </code>{" "}
            to fill it. Compare the two timestamps below — the gap is the hydration overhead.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* Server time */}
          <div
            style={{
              padding: "24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
              }}
            >
              🖥️ Server Rendered
            </p>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                color: "#64748b",
                wordBreak: "break-all",
              }}
            >
              {serverRenderedAt}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#334155" }}>Empty shell — no real data</p>
          </div>

          {/* Arrow / gap */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, color: "#8b5cf6", marginBottom: 4 }}>→</div>
            <div
              style={{
                padding: "4px 12px",
                background: "rgba(139,92,246,0.2)",
                borderRadius: 9999,
                fontSize: 11,
                fontFamily: "monospace",
                color: "#a78bfa",
                whiteSpace: "nowrap",
                fontWeight: 700,
              }}
            >
              +{gapMs}ms
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>hydration gap</div>
          </div>

          {/* Client time */}
          <div
            style={{
              padding: "24px",
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 14,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                color: "#8b5cf6",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
              }}
            >
              🌐 Client Rendered
            </p>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                color: "#a78bfa",
                wordBreak: "break-all",
              }}
            >
              {clientRenderedAt}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#6d28d9" }}>
              Full data — clientLoader ran
            </p>
          </div>
        </div>
      </section>

      <SectionDivider label="Browser Environment — Proof of CSR" />

      {/* ── Browser Environment Panel ─────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          className="terminal"
          style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <div
            className="terminal-header"
            style={{
              background: "rgba(139,92,246,0.1)",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
                <div
                  key={i}
                  style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
                />
              ))}
            </div>
            <span
              style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 12, color: "#475569" }}
            >
              navigator — browser only 🌐
            </span>
          </div>
          <div
            className="terminal-body"
            style={{ padding: "20px 24px", background: "rgba(0,0,0,0.4)" }}
          >
            {[
              { label: "userAgent", value: userAgent, note: "(truncated to 80 chars)" },
              { label: "onLine", value: String(online), note: "" },
              { label: "hardwareConcurrency", value: String(cores), note: "CPU cores" },
              { label: "language", value: lang, note: "" },
            ].map(({ label, value, note }) => (
              <div
                key={label}
                className="data-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  gap: 12,
                }}
              >
                <span
                  style={{ color: "#475569", fontFamily: "monospace", fontSize: 12, flexShrink: 0 }}
                >
                  navigator.<span style={{ color: "#a78bfa" }}>{label}</span>
                </span>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontFamily: "monospace",
                      fontSize: 12,
                      background: "rgba(139,92,246,0.1)",
                      padding: "2px 10px",
                      borderRadius: 6,
                      wordBreak: "break-all",
                    }}
                  >
                    {value}
                  </span>
                  {note && (
                    <p style={{ margin: "3px 0 0", fontSize: 10, color: "#334155" }}>{note}</p>
                  )}
                </div>
              </div>
            ))}

            <p
              style={{
                margin: "16px 0 0",
                fontSize: 11,
                color: "#334155",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                paddingTop: 12,
              }}
            >
              ⓘ These values only exist in the browser — the server can never access them. This
              proves CSR.
            </p>
          </div>
        </div>
      </section>

      <SectionDivider
        label={`Product Catalog — ${favSet.size} favourite${favSet.size === 1 ? "" : "s"} saved`}
      />

      {/* ── Products ──────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Rendered entirely in the browser from{" "}
            <code
              style={{
                color: "#a78bfa",
                background: "rgba(139,92,246,0.1)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              localStorage
            </code>{" "}
            — star items to persist.
          </p>
          {favSet.size > 0 && (
            <span
              style={{
                padding: "5px 14px",
                borderRadius: 9999,
                background: "rgba(139,92,246,0.2)",
                color: "#a78bfa",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ⭐ {favSet.size} saved
            </span>
          )}
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {(products ?? []).map((product: Product) => (
            <ProductItem key={product.id} product={product} isFavorite={favSet.has(product.id)} />
          ))}
        </ul>
      </section>

      <SectionDivider label="clientLoader Pattern" />

      {/* ── Code snippet ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={csrCodeSnippet} filename="app/strategies/csr.tsx" />
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────────── */}
      <ComparisonPanel
        pros={[
          "Instant HTML shell — great TTFB",
          "Access to browser APIs (localStorage, navigator)",
          "Rich client-side interactivity without server round-trips",
        ]}
        cons={[
          "Content hidden until JS loads and runs",
          "Poor SEO if not paired with SSR",
          "Extra hydration latency gap",
        ]}
        related={[
          { to: "/ssr", label: "SSR", key: "SSR" },
          { to: "/streaming", label: "Streaming", key: "Streaming" },
          { to: "/islands", label: "Islands", key: "Islands" },
        ]}
      />
    </StrategyPage>
  );
}

const csrCodeSnippet = `// Server loader — just sends a shell
export async function loader() {
  return { serverRenderedAt: new Date().toISOString() };
}

// Client loader — runs in the BROWSER after hydration
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  
  // Browser-only APIs: localStorage, navigator
  const favorites = JSON.parse(localStorage.getItem('twister_csr_favs') ?? '[]');
  
  return {
    ...serverData,
    products: makeProducts(seed, 6),
    favorites,
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    cores: navigator.hardwareConcurrency,
  };
}
clientLoader.hydrate = true; // Required for HydrateFallback to render`;
