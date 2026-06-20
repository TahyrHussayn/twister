export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80"
          style={{
            width: `${85 - i * 12}%`,
            animationDelay: `${i * 0.15}s`,
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 bg-white dark:bg-[#050505] shadow-sm"
      role="status"
      aria-label="Loading"
    >
      <div
        className="h-4 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-3/4 mb-5"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        }}
      />
      <div className="space-y-2.5">
        <div
          className="h-3 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-full"
          style={{
            animationDelay: "0.1s",
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
        <div
          className="h-3 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-5/6"
          style={{
            animationDelay: "0.2s",
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-[#050505]"
    >
      <div className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/80 dark:border-zinc-800/80" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-b last:border-0 border-zinc-100 dark:border-zinc-800/50 flex items-center px-6 gap-6"
        >
          <div
            className="h-3 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-1/4"
            style={{
              animationDelay: `${i * 0.1}s`,
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            }}
          />
          <div
            className="h-3 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-2/5"
            style={{
              animationDelay: `${i * 0.1 + 0.1}s`,
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            }}
          />
          <div
            className="h-3 rounded-full shimmer bg-zinc-200 dark:bg-zinc-800/80 w-1/5 ml-auto"
            style={{
              animationDelay: `${i * 0.1 + 0.2}s`,
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
