import { Link } from "react-router";

type ComparisonPanelProps = {
  pros: string[];
  cons: string[];
  related?: { to: string; label: string; key?: string }[];
};

export function ComparisonPanel({ pros, cons, related }: ComparisonPanelProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-2">
      {/* Pros */}
      <div className="data-card p-5">
        <p className="eyebrow mb-3" style={{ color: "#10b981" }}>
          ✓ When it shines
        </p>
        <ul className="space-y-1">
          {pros.map((p) => (
            <li key={p} className="pro-item">
              <span className="pro-dot" style={{ background: "#10b981" }} />
              <span className="text-sm text-[var(--color-fg-dim)]">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div className="data-card p-5">
        <p className="eyebrow mb-3" style={{ color: "#f43f5e" }}>
          ✕ Trade-offs
        </p>
        <ul className="space-y-1">
          {cons.map((c) => (
            <li key={c} className="pro-item">
              <span className="pro-dot" style={{ background: "#f43f5e" }} />
              <span className="text-sm text-[var(--color-fg-dim)]">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="sm:col-span-2 data-card p-5">
          <p className="eyebrow mb-3">Related strategies</p>
          <div className="flex flex-wrap gap-2">
            {related.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="tag hover:border-white/20 transition-colors no-underline"
                style={{ textDecoration: "none" }}
              >
                → {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
