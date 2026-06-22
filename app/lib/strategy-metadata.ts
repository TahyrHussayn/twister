export type StrategyMeta = {
  isReal: boolean;
  description: string;
};

export const STRATEGY_METADATA: Record<string, StrategyMeta> = {
  ssr: {
    isReal: true,
    description:
      "HTML rendered per-request on Cloudflare Workers with parallel data fetching at the edge.",
  },
  csr: {
    isReal: true,
    description: "Standard client-side React app fetching data via browser requests.",
  },
  ssg: {
    isReal: true,
    description: "Pre-rendered at build time and served statically from edge caches.",
  },
  streaming: {
    isReal: true,
    description: "Progressive HTML streaming using React Suspense.",
  },
  isr: {
    isReal: true,
    description: "On-demand cache revalidation using Cloudflare Cache API.",
  },
  ppr: {
    isReal: true,
    description: "Combines Cache API for the static shell with streaming for dynamic content.",
  },
  islands: {
    isReal: true,
    description: "Independent React components hydrating separately on a static page.",
  },
  hybrid: {
    isReal: true,
    description: "Combines build-time prerendering with clientLoader for dynamic client-side data.",
  },
  htmx: {
    isReal: true,
    description: "Client-side hypermedia-driven swaps with lightweight server endpoints.",
  },
  "edge-vs-origin": {
    isReal: true,
    description: "Benchmarks latency from a Cloudflare Worker versus an external origin.",
  },
};
