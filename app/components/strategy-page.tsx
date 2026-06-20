import { MetricsBar } from "./metrics-badge";
import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";

const STYLE_MAP = ["ssr", "csr", "ssg", "streaming", "isr", "ppr", "islands"] as const;
type StrategyStyle = (typeof STYLE_MAP)[number];

export function StrategyPage({
  strategy,
  emoji,
  title,
  description,
  metrics,
  cacheStatus,
  children,
}: {
  strategy: StrategyStyle;
  emoji: string;
  title: string;
  description: React.ReactNode;
  metrics: RenderMetrics;
  cacheStatus?: CacheStatus;
  children: React.ReactNode;
}) {
  return (
    <div className={`animate-fade-in space-y-10 strat-${strategy}`}>
      {/* Tinted hero banner */}
      <div
        className="rounded-2xl border p-6 sm:p-8 -mx-2 sm:-mx-0"
        style={{ backgroundColor: "var(--s-bg)", borderColor: "var(--s-border)" }}
      >
        <div className="flex items-center gap-4 mb-3">
          <span className="text-4xl">{emoji}</span>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </div>
        <MetricsBar metrics={metrics} cacheStatus={cacheStatus} />
        <div className="mt-4 text-sm max-w-2xl leading-relaxed" style={{ color: "var(--s-text)" }}>
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
