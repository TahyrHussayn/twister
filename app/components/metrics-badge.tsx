import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";
import { STRATEGY_ACCENTS } from "~/lib/theme";

const FALLBACK =
  "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";

export function StrategyBadge({ strategy }: { strategy: string }) {
  const cls = STRATEGY_ACCENTS[strategy]?.ring ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide ${cls}`}
    >
      {strategy}
    </span>
  );
}

const CACHE_MAP: Record<CacheStatus, { label: string; cls: string }> = {
  HIT: {
    label: "HIT",
    cls: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  MISS: {
    label: "MISS",
    cls: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  },
  STALE: {
    label: "STALE",
    cls: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  REVALIDATED: {
    label: "REVAL",
    cls: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  BYPASS: {
    label: "BYPASS",
    cls: "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  },
  DYNAMIC: {
    label: "DYN",
    cls: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
};

export function CacheBadge({ status }: { status: CacheStatus }) {
  const { label, cls } = CACHE_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border ${cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "HIT" ? "bg-emerald-500 animate-pulse-soft" : status === "STALE" ? "bg-amber-500" : "bg-current opacity-50"}`}
      />
      {label}
    </span>
  );
}

export function TtfbBadge({ ms }: { ms: number }) {
  const cls =
    ms < 100
      ? "text-emerald-600 dark:text-emerald-400"
      : ms < 300
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono ${cls}`}>
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
