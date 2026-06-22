export type EdgeInfo = {
  colo: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
};

/**
 * Extracts Cloudflare edge datacenter info from request.cf.
 * Returns safe fallbacks in dev mode where request.cf is unavailable.
 */
export function getEdgeInfo(request: Request): EdgeInfo {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
  return {
    colo: (cf?.colo as string) ?? "DEV",
    country: (cf?.country as string) ?? "XX",
    city: (cf?.city as string) ?? "localhost",
    region: (cf?.region as string) ?? "unknown",
    timezone: (cf?.timezone as string) ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
