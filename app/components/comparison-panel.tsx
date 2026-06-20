import { Link } from "react-router";

export function ComparisonPanel({
  pros,
  cons,
  related,
}: {
  pros: string[];
  cons: string[];
  related: { to: string; label: string; emoji: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {pros.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Trade-offs
        </h3>
        <ul className="space-y-2">
          {cons.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-red-500 mt-0.5 shrink-0">-</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h3 className="font-semibold text-sm mb-3">Compare with other strategies</h3>
        <div className="flex flex-wrap gap-2">
          {related.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              viewTransition
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors card-hover"
            >
              <span>{r.emoji}</span>
              {r.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
