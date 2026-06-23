import type { Route } from "./+types/compare";
import { Link } from "react-router";
import { STRATEGY_COMPARE } from "~/lib/theme";
import type { StrategyCompareRow } from "~/lib/theme";

// ─── Meta ─────────────────────────────────────────────────────────────────
export function meta() {
  return [
    { title: "Compare Strategies — Twister" },
    {
      name: "description",
      content:
        "Compare all 10 web rendering strategies: SSR, CSR, SSG, Streaming, ISR, Islands, HTMX, Hybrid, and more.",
    },
  ];
}

// ─── Loader ──────────────────────────────────────────────────────────────────
export async function loader() {
  return { strategies: STRATEGY_COMPARE };
}

// ─── Badge Components ────────────────────────────────────────────────────────
function TTFBBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    Instant: "#10b981",
    Fast: "#06b6d4",
    Medium: "#f59e0b",
    Slow: "#f43f5e",
  };
  const c = colors[value] ?? "#64748b";
  return (
    <span className="tag" style={{ color: c, borderColor: c + "40", background: c + "15" }}>
      {value}
    </span>
  );
}

function FreshnessBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    Always: "#10b981",
    Configurable: "#f59e0b",
    "Build time": "#f43f5e",
  };
  const c = colors[value] ?? "#64748b";
  return (
    <span className="tag" style={{ color: c, borderColor: c + "40", background: c + "15" }}>
      {value}
    </span>
  );
}

function SEOBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    Native: "#10b981",
    Partial: "#f59e0b",
    None: "#f43f5e",
  };
  const c = colors[value] ?? "#64748b";
  return (
    <span className="tag" style={{ color: c, borderColor: c + "40", background: c + "15" }}>
      {value}
    </span>
  );
}

function ClientJSBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    None: "#10b981",
    "Per-island": "#06b6d4",
    Hydration: "#f59e0b",
    Full: "#f43f5e",
  };
  const c = colors[value] ?? "#64748b";
  return (
    <span className="tag" style={{ color: c, borderColor: c + "40", background: c + "15" }}>
      {value}
    </span>
  );
}

// ─── Default Component ───────────────────────────────────────────────────────
export default function Compare({ loaderData }: Route.ComponentProps) {
  const { strategies } = loaderData;

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="border-b border-white/06 py-16"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="eyebrow mb-3">All 10 strategies</p>
          <h1 className="display text-4xl md:text-5xl mb-3">Strategy Comparison</h1>
          <p className="text-[var(--color-fg-dim)] max-w-xl text-lg">
            Compare all rendering strategies across the dimensions that matter most.
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Desktop table */}
        <div
          className="hidden md:block overflow-x-auto rounded-2xl border border-white/07"
          style={{ background: "#0c0d1a" }}
        >
          <table className="compare-table w-full">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  Strategy
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  TTFB
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  Freshness
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  SEO
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  Client JS
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  Caching
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  CF Native
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-subtle)]">
                  Best for
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/05">
              {strategies.map((s: StrategyCompareRow) => (
                <tr key={s.key} className="hover:bg-white/02 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[var(--color-fg)]">{s.name}</div>
                    <div className="text-xs text-[var(--color-subtle)] font-mono">
                      {s.key.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <TTFBBadge value={s.ttfb} />
                  </td>
                  <td className="px-4 py-4">
                    <FreshnessBadge value={s.freshness} />
                  </td>
                  <td className="px-4 py-4">
                    <SEOBadge value={s.seo} />
                  </td>
                  <td className="px-4 py-4">
                    <ClientJSBadge value={s.clientJS} />
                  </td>
                  <td className="px-4 py-4 text-xs text-[var(--color-fg-dim)]">{s.caching}</td>
                  <td className="px-4 py-4">
                    {s.cfNative ? (
                      <span style={{ color: "#10b981" }}>✓</span>
                    ) : (
                      <span style={{ color: "#f43f5e" }}>✗</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-[var(--color-fg-dim)] max-w-xs">
                    {s.useCase}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={s.to}
                      className="tag hover:border-white/20 no-underline"
                      style={{ textDecoration: "none" }}
                    >
                      Explore →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden mt-6 space-y-4">
          {strategies.map((s: StrategyCompareRow) => (
            <Link
              key={s.key}
              to={s.to}
              className="data-card p-5 block no-underline"
              style={{ textDecoration: "none" }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-[var(--color-fg)]">{s.name}</p>
                  <p className="text-xs font-mono text-[var(--color-subtle)]">{s.key}</p>
                </div>
                <TTFBBadge value={s.ttfb} />
              </div>
              <p className="text-sm text-[var(--color-fg-dim)]">{s.useCase}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <FreshnessBadge value={s.freshness} />
                <SEOBadge value={s.seo} />
                <ClientJSBadge value={s.clientJS} />
              </div>
            </Link>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "TTFB",
              desc: "Time to First Byte. How fast the server sends the first byte.",
            },
            {
              label: "Freshness",
              desc: "How up-to-date the HTML is when the user receives it.",
            },
            {
              label: "SEO",
              desc: "Whether crawlers see full content without executing JS.",
            },
            {
              label: "Client JS",
              desc: "How much JavaScript must run in the browser to render.",
            },
          ].map(({ label, desc }) => (
            <div key={label} className="glass-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-subtle)] mb-1">
                {label}
              </p>
              <p className="text-xs text-[var(--color-fg-dim)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
