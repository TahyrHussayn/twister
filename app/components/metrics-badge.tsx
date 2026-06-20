import type { CacheStatus } from "~/lib/cache";
import type { RenderMetrics } from "~/lib/metrics";

export function StrategyBadge({ strategy }: { strategy: string }) {
  const colors: Record<string, string> = {
    SSR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CSR: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    SSG: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    ISR: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    Streaming: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    PPR: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Islands: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[strategy] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
    >
      {strategy}
    </span>
  );
}

export function CacheBadge({ status }: { status: CacheStatus }) {
  const config: Record<CacheStatus, { label: string; cls: string }> = {
    HIT: { label: "HIT", cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    MISS: { label: "MISS", cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    STALE: {
      label: "STALE",
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    BYPASS: {
      label: "BYPASS",
      cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    DYNAMIC: { label: "DYN", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  };
  const { label, cls } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${cls}`}
    >
      {label}
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
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      {metrics && <StrategyBadge strategy={metrics.strategy} />}
      {cacheStatus && <CacheBadge status={cacheStatus} />}
      {metrics && (
        <span className="font-mono text-xs">
          TTFB: <b className="text-gray-900 dark:text-white">{metrics.ttfb}ms</b>
        </span>
      )}
    </div>
  );
}
