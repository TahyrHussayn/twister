export type RenderMetrics = {
  ttfb: number;
  strategy: string;
};

const start = typeof performance !== "undefined" ? performance.now() : Date.now();

export function createMetrics(strategy: string): RenderMetrics {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  return {
    ttfb: Math.round(now - start),
    strategy,
  };
}
