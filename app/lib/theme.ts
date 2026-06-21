export type StrategyAccent = {
  hex: string;
  icon: string;
};

export const STRATEGY_ACCENTS: Record<string, StrategyAccent> = {
  SSR: {
    hex: "#3b82f6",
    icon: "🖥️",
  },
  CSR: {
    hex: "#8b5cf6",
    icon: "🌐",
  },
  SSG: {
    hex: "#10b981",
    icon: "⚡",
  },
  Streaming: {
    hex: "#06b6d4",
    icon: "🌊",
  },
  ISR: {
    hex: "#f59e0b",
    icon: "🔄",
  },
  PPR: {
    hex: "#f43f5e",
    icon: "🧩",
  },
  Islands: {
    hex: "#14b8a6",
    icon: "🏝️",
  },
  HTMX: {
    hex: "#6366f1",
    icon: "⚡",
  },
  HYBRID: {
    hex: "#a855f7",
    icon: "🧬",
  },
  "EDGE-VS-ORIGIN": {
    hex: "#ef4444",
    icon: "⏱️",
  },
};
