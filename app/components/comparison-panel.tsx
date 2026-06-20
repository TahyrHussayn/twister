import { Link } from "react-router";
import { STRATEGY_ACCENTS } from "~/lib/theme";

export function ComparisonPanel({
  pros,
  cons,
  related,
}: {
  pros: string[];
  cons: string[];
  related: { to: string; label: string; key?: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Pros Panel */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 p-8 shadow-sm">
        <h3 className="font-semibold text-sm mb-5 flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Strengths
        </h3>
        <ul className="space-y-3.5">
          {pros.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 text-sm text-emerald-900/80 dark:text-emerald-200/70"
            >
              <span className="text-emerald-500 font-bold mt-[-1px] text-base">+</span>
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Panel */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 p-8 shadow-sm">
        <h3 className="font-semibold text-sm mb-5 flex items-center gap-2 text-rose-800 dark:text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          Trade-offs
        </h3>
        <ul className="space-y-3.5">
          {cons.map((c) => (
            <li
              key={c}
              className="flex items-start gap-3 text-sm text-rose-900/80 dark:text-rose-200/70"
            >
              <span className="text-rose-500 font-bold mt-[-1px] text-base">-</span>
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Strategies */}
      <div className="sm:col-span-2 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] p-8 shadow-sm">
        <h3 className="font-semibold text-sm mb-4 text-zinc-800 dark:text-zinc-200">
          Compare with other strategies
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {related.map((r) => {
            const accent = r.key ? STRATEGY_ACCENTS[r.key] : undefined;
            return (
              <Link
                key={r.to}
                to={r.to}
                viewTransition
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={
                  accent
                    ? {
                        backgroundColor: `var(--tw-bg-opacity, ${accent.hex}10)`,
                        borderColor: `var(--tw-border-opacity, ${accent.hex}30)`,
                        color: accent.hex,
                      }
                    : {
                        color: "var(--tw-text-opacity, rgba(113, 113, 122, 1))",
                      }
                }
              >
                {accent && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: accent.hex }}
                  />
                )}
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
