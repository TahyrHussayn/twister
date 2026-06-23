export type StrategyMeta = {
  isReal: boolean;
  description: string;
  cfFeatures: string[];
  rrv8Exports: string[];
};

export const STRATEGY_METADATA: Record<string, StrategyMeta> = {
  ssr: {
    isReal: true,
    description:
      "HTML rendered per-request on Cloudflare Workers with parallel edge data fetching.",
    cfFeatures: ["Workers Runtime", "request.cf metadata", "Environment Bindings"],
    rrv8Exports: ["loader", "headers", "ErrorBoundary"],
  },
  csr: {
    isReal: true,
    description: "Minimal HTML shell; all rendering and data fetching happens in the browser.",
    cfFeatures: ["Static Asset Serving"],
    rrv8Exports: ["loader", "clientLoader", "clientAction", "HydrateFallback"],
  },
  ssg: {
    isReal: true,
    description:
      "Pre-rendered at build time by the RRv8 build process, served as static HTML from the edge.",
    cfFeatures: ["Cache API", "Static Asset Serving"],
    rrv8Exports: ["loader", "headers"],
  },
  streaming: {
    isReal: true,
    description:
      "Progressive HTML streaming using React Suspense — each section resolves independently.",
    cfFeatures: ["Workers Streaming", "Cloudflare AI (Workers AI)", "request.cf metadata"],
    rrv8Exports: ["loader", "headers"],
  },
  isr: {
    isReal: true,
    description:
      "On-demand cache revalidation using the Cloudflare Cache API with stale-while-revalidate.",
    cfFeatures: ["Cache API", "cache.match/put/delete"],
    rrv8Exports: ["loader", "headers", "action (purge)"],
  },
  ppr: {
    isReal: true,
    description:
      "Edge-cached shell served instantly; dynamic data holes streamed in via React Suspense.",
    cfFeatures: ["Cache API", "Workers Streaming", "request.cf metadata"],
    rrv8Exports: ["loader", "headers"],
  },
  islands: {
    isReal: true,
    description:
      "SSR page with isolated, independently-hydrating React components backed by Cloudflare D1.",
    cfFeatures: ["D1 Database", "request.cf metadata"],
    rrv8Exports: ["loader", "action"],
  },
  hybrid: {
    isReal: true,
    description:
      "Build-time prerendered shell hydrated with client-fetched dynamic data via clientLoader.",
    cfFeatures: ["Static Asset Serving", "prerender config"],
    rrv8Exports: ["loader", "clientLoader", "clientAction", "HydrateFallback"],
  },
  htmx: {
    isReal: true,
    description:
      "Server-rendered HTML fragments swapped directly into the DOM — no React on the client.",
    cfFeatures: ["Workers Runtime", "HTML fragment responses"],
    rrv8Exports: ["loader", "headers"],
  },
  "edge-vs-origin": {
    isReal: true,
    description:
      "Server-side latency benchmark comparing Cloudflare Edge compute vs simulated origin.",
    cfFeatures: ["Workers Runtime", "request.cf metadata", "Cache API"],
    rrv8Exports: ["loader", "headers"],
  },
};
