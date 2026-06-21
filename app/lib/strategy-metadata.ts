export type StrategyMeta = {
  isReal: boolean;
  description: string;
};

export const STRATEGY_METADATA: Record<string, StrategyMeta> = {
  ssr: {
    isReal: true,
    description: "Fully implemented using Cloudflare Workers per-request rendering.",
  },
  csr: {
    isReal: true,
    description: "Real client-side React app fetching data via standard browser requests.",
  },
  ssg: {
    isReal: true,
    description: "Pre-rendered at build time with Vite+ and served natively from edge caches.",
  },
  streaming: {
    isReal: true,
    description: "Chunk-by-chunk HTML streaming supported natively by Workers.",
  },
  isr: {
    isReal: true,
    description: "Uses Cloudflare Cache API for background revalidation.",
  },
  ppr: {
    isReal: true,
    description: "Combines edge caching for the shell with dynamic React Suspense holes.",
  },
  islands: {
    isReal: true,
    description: "Progressive hydration using isolated React components.",
  },
  hybrid: {
    isReal: true,
    description: "Mixes SSG and SSR components using React Router v8 config.",
  },
  htmx: {
    isReal: true,
    description: "Client-side hypermedia driven swaps. Very lightweight.",
  },
  "edge-vs-origin": {
    isReal: true,
    description: "Benchmarks latency from a Cloudflare Worker versus an external origin.",
  },
};
