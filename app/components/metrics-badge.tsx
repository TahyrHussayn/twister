import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";

const ACCENTS: Record<string, { bg: string; text: string; border: string }> = {
  SSR: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  CSR: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  SSG: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Streaming: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  ISR: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  PPR: {
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
  },
  Islands: {
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
};

export function StrategyBadge({ strategy }: { strategy: string }) {
  const c = ACCENTS[strategy] ?? {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border} tracking-wide`}
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
