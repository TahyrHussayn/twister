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

export function serverTimingHeader(metrics: RenderMetrics): Record<string, string> {
  return {
    "Server-Timing": `ttfb;dur=${metrics.ttfb};desc="Time to First Byte", server;dur=${metrics.serverTime};desc="Server Render Time"`,
    "X-Render-Strategy": metrics.strategy,
    "X-Rendered-At": metrics.renderedAt,
  };
}
