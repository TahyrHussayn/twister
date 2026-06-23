/**
 * latency.ts — Helper to parse simulated delay cookies.
 */

export function getSimulatedLatency(request: Request, defaultDelay = 0): number {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const match = cookieHeader.match(/twister_latency=(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return defaultDelay;
}
