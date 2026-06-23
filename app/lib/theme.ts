export type StrategyAccent = {
  hex: string;
  icon: string;
  label: string;
};

export const STRATEGY_ACCENTS: Record<string, StrategyAccent> = {
  SSR: { hex: "#3b82f6", icon: "🖥️", label: "SSR" },
  CSR: { hex: "#8b5cf6", icon: "🌐", label: "CSR" },
  SSG: { hex: "#10b981", icon: "⚡", label: "SSG" },
  Streaming: { hex: "#06b6d4", icon: "🌊", label: "Streaming" },
  ISR: { hex: "#f59e0b", icon: "🔄", label: "ISR" },
  PPR: { hex: "#f43f5e", icon: "🧩", label: "Streaming+Cache" },
  Islands: { hex: "#14b8a6", icon: "🏝️", label: "Islands" },
  HTMX: { hex: "#6366f1", icon: "⚡", label: "HTMX" },
  HYBRID: { hex: "#a855f7", icon: "🧬", label: "Hybrid" },
  "EDGE-VS-ORIGIN": { hex: "#ef4444", icon: "⏱️", label: "Edge vs Origin" },
};

/** Comparison matrix data for the /compare route */
export type StrategyCompareRow = {
  key: string;
  name: string;
  to: string;
  ttfb: "Instant" | "Fast" | "Medium" | "Slow";
  freshness: "Always" | "Configurable" | "Build time";
  seo: "Native" | "Partial" | "None";
  clientJS: "Full" | "Hydration" | "Per-island" | "None";
  cfNative: boolean;
  caching: "Edge Cache" | "Browser" | "Both" | "None";
  useCase: string;
};

export const STRATEGY_COMPARE: StrategyCompareRow[] = [
  {
    key: "SSR",
    name: "Server-Side Rendering",
    to: "/ssr",
    ttfb: "Medium",
    freshness: "Always",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "None",
    useCase: "Personalised content, real-time data, per-request auth checks",
  },
  {
    key: "CSR",
    name: "Client-Side Rendering",
    to: "/csr",
    ttfb: "Fast",
    freshness: "Always",
    seo: "Partial",
    clientJS: "Full",
    cfNative: true,
    caching: "Browser",
    useCase: "Dashboards, internal tools, apps behind authentication",
  },
  {
    key: "SSG",
    name: "Static Site Generation",
    to: "/ssg",
    ttfb: "Instant",
    freshness: "Build time",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "Edge Cache",
    useCase: "Marketing pages, blogs, docs — content that rarely changes",
  },
  {
    key: "Streaming",
    name: "Streaming SSR",
    to: "/streaming",
    ttfb: "Instant",
    freshness: "Always",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "None",
    useCase: "Pages with multiple slow data sources; AI-generated content",
  },
  {
    key: "ISR",
    name: "Incremental Static Regen",
    to: "/isr",
    ttfb: "Instant",
    freshness: "Configurable",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "Edge Cache",
    useCase: "Product catalogs, news feeds — acceptable staleness window",
  },
  {
    key: "PPR",
    name: "Streaming + Edge Cache",
    to: "/ppr",
    ttfb: "Instant",
    freshness: "Configurable",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "Both",
    useCase: "Pages with a cacheable shell and isolated dynamic sections",
  },
  {
    key: "Islands",
    name: "React Islands",
    to: "/islands",
    ttfb: "Medium",
    freshness: "Always",
    seo: "Native",
    clientJS: "Per-island",
    cfNative: true,
    caching: "None",
    useCase: "Mostly static pages with a few interactive hot-spots",
  },
  {
    key: "HTMX",
    name: "HTMX Hypermedia",
    to: "/htmx",
    ttfb: "Medium",
    freshness: "Always",
    seo: "Native",
    clientJS: "None",
    cfNative: true,
    caching: "None",
    useCase: "Forms, partial updates, admin UIs without a JS framework",
  },
  {
    key: "HYBRID",
    name: "Hybrid Rendering",
    to: "/hybrid",
    ttfb: "Instant",
    freshness: "Configurable",
    seo: "Native",
    clientJS: "Full",
    cfNative: true,
    caching: "Edge Cache",
    useCase: "Mix of static shell + client-driven personalisation layer",
  },
  {
    key: "EDGE-VS-ORIGIN",
    name: "Edge vs Origin",
    to: "/edge-vs-origin",
    ttfb: "Instant",
    freshness: "Always",
    seo: "Native",
    clientJS: "Hydration",
    cfNative: true,
    caching: "Edge Cache",
    useCase: "Latency-critical apps where geographic proximity matters most",
  },
];
