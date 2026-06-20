export type StrategyAccent = {
  hex: string;
  ring: string;
  style: string;
  label: string;
  icon: string;
};

export const STRATEGY_ACCENTS: Record<string, StrategyAccent> = {
  SSR: {
    hex: "#3b82f6",
    ring: "strat-ssr",
    style: "strat-ssr",
    label: "Server-Side Rendering",
    icon: "🖥️",
  },
  CSR: {
    hex: "#8b5cf6",
    ring: "strat-csr",
    style: "strat-csr",
    label: "Client-Side Rendering",
    icon: "🌐",
  },
  SSG: {
    hex: "#10b981",
    ring: "strat-ssg",
    style: "strat-ssg",
    label: "Static Site Generation",
    icon: "⚡",
  },
  Streaming: {
    hex: "#06b6d4",
    ring: "strat-streaming",
    style: "strat-streaming",
    label: "Streaming SSR",
    icon: "🌊",
  },
  ISR: {
    hex: "#f59e0b",
    ring: "strat-isr",
    style: "strat-isr",
    label: "Incremental Static Regen",
    icon: "🔄",
  },
  PPR: {
    hex: "#f43f5e",
    ring: "strat-ppr",
    style: "strat-ppr",
    label: "Partial Pre-Rendering",
    icon: "🧩",
  },
  Islands: {
    hex: "#14b8a6",
    ring: "strat-islands",
    style: "strat-islands",
    label: "Islands Architecture",
    icon: "🏝️",
  },
};
