type CardSkeletonProps = { lines?: number };

export function CardSkeleton({ lines = 4 }: CardSkeletonProps) {
  return (
    <div className="data-card p-6 animate-pulse">
      <div className="skeleton h-3 w-20 rounded mb-4" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3 rounded"
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3 rounded" style={{ width: `${50 + (i % 4) * 12}%` }} />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="skeleton w-11 h-11 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-2.5 w-24 rounded" />
      </div>
    </div>
  );
}
