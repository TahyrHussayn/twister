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
