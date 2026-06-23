/**
 * edge-info.ts — Extract Cloudflare request metadata.
 *
 * Returns a stable object from request.cf properties.
 * Falls back gracefully in non-CF environments (local dev, Vitest).
 */

export type EdgeInfo = {
  colo: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
};

export function getEdgeInfo(request: Request): EdgeInfo {
  // Cloudflare Workers inject cf metadata on every request
  const cf = (request as Request & { cf?: CfProperties }).cf;

  return {
    colo: (cf?.colo as string | undefined) ?? "LOCAL",
    country: (cf?.country as string | undefined) ?? "Local Dev",
    city: (cf?.city as string | undefined) ?? "Localhost",
    region: (cf?.region as string | undefined) ?? "Dev Region",
    timezone: (cf?.timezone as string | undefined) ?? "UTC",
  };
}
