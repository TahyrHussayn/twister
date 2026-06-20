export type StrategyAccent = {
  hex: string;
  ring: string;
  style: string;
};

export const STRATEGY_ACCENTS: Record<string, StrategyAccent> = {
  SSR: { hex: "#2563eb", ring: "strat-ssr", style: "strat-ssr" },
  CSR: { hex: "#7c3aed", ring: "strat-csr", style: "strat-csr" },
  SSG: { hex: "#059669", ring: "strat-ssg", style: "strat-ssg" },
  Streaming: { hex: "#0891b2", ring: "strat-streaming", style: "strat-streaming" },
  ISR: { hex: "#d97706", ring: "strat-isr", style: "strat-isr" },
  PPR: { hex: "#db2777", ring: "strat-ppr", style: "strat-ppr" },
  Islands: { hex: "#0d9488", ring: "strat-islands", style: "strat-islands" },
};
