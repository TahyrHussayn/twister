/**
 * flow-diagram.tsx — Animated request lifecycle visualizer.
 *
 * Steps are revealed sequentially with CSS animation-delay.
 * All state is either static or controlled by CSS — no hooks.
 */

export type FlowStep = {
  icon?: string;
  label: string;
  sublabel?: string;
  active?: boolean;
};

type FlowDiagramProps = {
  steps: FlowStep[];
};

export function FlowDiagram({ steps }: FlowDiagramProps) {
  const baseDelay = 100; // ms between each step revealing

  return (
    <div className="flow-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flow-step ${step.active !== false ? "active" : ""}`}
            style={{
              animationDelay: step.active !== false ? `${i * baseDelay}ms` : undefined,
            }}
          >
            {step.icon && <span className="icon">{step.icon}</span>}
            <span>{step.label}</span>
            {step.sublabel && (
              <span className="text-[10px] opacity-60" style={{ fontFamily: "var(--font-mono)" }}>
                {step.sublabel}
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flow-arrow ${step.active !== false ? "active" : ""}`}
              aria-hidden="true"
            >
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
