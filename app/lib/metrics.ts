export type RenderMetrics = {
  ttfb: number;
  serverTime: number;
  renderedAt: string;
  strategy: string;
};

const start = typeof performance !== "undefined" ? performance.now() : Date.now();

export function createMetrics(strategy: string): RenderMetrics {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  return {
    ttfb: Math.round(now - start),
    serverTime: Math.round(now - start),
    renderedAt: new Date().toISOString(),
    strategy,
  };
}
