import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";
import { STRATEGY_ACCENTS } from "~/lib/theme";

export function StrategyBadge({ strategy }: { strategy: string }) {
  const accent = STRATEGY_ACCENTS[strategy];

  if (accent) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-sm"
        style={{
          backgroundColor: `var(--s-bg, ${accent.hex}10)`,
          borderColor: `var(--s-border, ${accent.hex}30)`,
          color: `var(--s-text, ${accent.hex})`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: accent.hex, boxShadow: `0 0 8px ${accent.hex}80` }}
        />
        {strategy}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
      {strategy}
    </span>
  );
}

const CACHE_MAP: Record<CacheStatus, { label: string; cls: string; dot: string }> = {
  HIT: {
    label: "HIT",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] pulse-glow",
  },
  MISS: {
    label: "MISS",
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
    dot: "bg-red-500",
  },
  STALE: {
    label: "STALE",
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] pulse-glow",
  },
  REVALIDATED: {
    label: "REVAL",
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  },
  BYPASS: {
    label: "BYPASS",
    cls: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
    dot: "bg-zinc-400",
  },
  DYNAMIC: {
    label: "DYN",
    cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    dot: "bg-blue-500",
  },
};

export function CacheBadge({ status }: { status: CacheStatus }) {
  const { label, cls, dot } = CACHE_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border shadow-sm ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function TtfbBadge({ ms }: { ms: number }) {
  const isFast = ms < 100;
  const isMedium = ms >= 100 && ms < 300;

  const cls = isFast
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
    : isMedium
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border shadow-sm ${cls}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {ms}ms
    </span>
  );
}

export function MetricsBar({
  metrics,
  cacheStatus,
}: {
  metrics?: RenderMetrics;
  cacheStatus?: CacheStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {metrics && <StrategyBadge strategy={metrics.strategy} />}
      {cacheStatus && <CacheBadge status={cacheStatus} />}
      {metrics && <TtfbBadge ms={metrics.ttfb} />}
    </div>
  );
}
