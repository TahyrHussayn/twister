import { MetricsBar } from "./metrics-badge";
import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";
import { STRATEGY_ACCENTS } from "~/lib/theme";
import { STRATEGY_METADATA } from "~/lib/strategy-metadata";

type StrategyStyle =
  | "ssr"
  | "csr"
  | "ssg"
  | "streaming"
  | "isr"
  | "ppr"
  | "islands"
  | "hybrid"
  | "htmx"
  | "edge-vs-origin";

export function StrategyPage({
  strategy,
  title,
  description,
  metrics,
  cacheStatus,
  children,
}: {
  strategy: StrategyStyle;
  title: string;
  description: React.ReactNode;
  metrics: RenderMetrics;
  cacheStatus?: CacheStatus;
  children: React.ReactNode;
}) {
  const strategyKey =
    strategy === "streaming" ||
    strategy === "islands" ||
    strategy === "hybrid" ||
    strategy === "htmx"
      ? strategy.charAt(0).toUpperCase() + strategy.slice(1)
      : strategy.toUpperCase();
  const icon = STRATEGY_ACCENTS[strategyKey]?.icon || "⚙️";

  const meta = STRATEGY_METADATA[strategy];

  return (
    <div className={`space-y-10 strat-${strategy} strat-header-glow`}>
      {/* Premium hero banner */}
      <div
        className="rounded-2xl border p-8 sm:p-10 -mx-2 sm:-mx-0 relative overflow-hidden"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: "var(--s-accent)" }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span>{icon}</span>
            <span style={{ color: "var(--s-text)" }}>{title}</span>
          </h1>
          {meta && (
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider w-fit ${meta.isReal ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}
            >
              {meta.isReal ? "Native Implementation" : "Illustrative Demo"}
            </div>
          )}
        </div>
        <MetricsBar metrics={metrics} cacheStatus={cacheStatus} />
        <div className="mt-6 text-base sm:text-lg max-w-3xl leading-relaxed text-zinc-600 dark:text-zinc-300">
          {description}
        </div>
      </div>

      {children}
    </div>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="section-divider">
      <span className="section-divider-label">{label}</span>
    </div>
  );
}

export { type StrategyStyle };
