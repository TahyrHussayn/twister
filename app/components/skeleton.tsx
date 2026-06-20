export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded shimmer"
          style={{ width: `${85 - i * 12}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
      role="status"
      aria-label="Loading"
    >
      <div className="h-4 rounded shimmer w-3/4 mb-4" />
      <div className="h-3 rounded shimmer w-full mb-2" />
      <div className="h-3 rounded shimmer w-5/6" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading">
      <div className="h-9 bg-zinc-100 dark:bg-zinc-800/50 rounded-t-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 border-b border-zinc-100 dark:border-zinc-800 flex items-center px-5 gap-6"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-3 rounded shimmer w-1/4" />
          <div className="h-3 rounded shimmer w-2/5" />
          <div className="h-3 rounded shimmer w-1/5 ml-auto" />
        </div>
      ))}
    </div>
  );
}
