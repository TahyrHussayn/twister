import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("strategies/dashboard.tsx"),
  route("ssr", "strategies/ssr.tsx"),
  route("csr", "strategies/csr.tsx"),
  route("ssg", "strategies/ssg.tsx"),
  route("streaming", "strategies/streaming.tsx"),
  route("isr", "strategies/isr.tsx"),
  route("ppr", "strategies/ppr.tsx"),
  route("islands", "strategies/islands.tsx"),
  route("htmx", "strategies/htmx.tsx"),
  route("hybrid", "strategies/hybrid.tsx"),
  route("edge-vs-origin", "strategies/edge-vs-origin.tsx"),
  route("api/purge", "api/purge.ts"),
  route("api/benchmark", "api/benchmark.ts"),
] satisfies RouteConfig;
