export type CacheStatus = "HIT" | "MISS" | "STALE" | "REVALIDATED" | "BYPASS" | "DYNAMIC";

export async function getCachedResponse(request: Request): Promise<Response | null> {
  try {
    const cache = (globalThis as any).caches?.default || (caches as any)?.default;
    if (!cache) return null;
    const match = await cache.match(request);
    return match ?? null;
  } catch {
    return null;
  }
}

export async function putCacheEntry(request: Request, response: Response): Promise<void> {
  try {
    const cache = (globalThis as any).caches?.default || (caches as any)?.default;
    if (!cache) return;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=3600");
    headers.set("Cache-Tag", "isr-products");
    const toCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    await cache.put(request, toCache);
  } catch {}
}

export async function purgeCacheEntry(request: Request): Promise<boolean> {
  try {
    const cache = (globalThis as any).caches?.default || (caches as any)?.default;
    if (!cache) return false;
    return await cache.delete(request);
  } catch {
    return false;
  }
}

export function extractCacheStatus(headers: Headers): CacheStatus {
  const age = parseInt(headers.get("Age") ?? "0", 10);
  const cacheControl = headers.get("Cache-Control") ?? "";
  if (age === 0 && !cacheControl.includes("stale")) return "MISS";
  if (cacheControl.includes("stale-while-revalidate") && age > 60) return "STALE";
  if (age > 0) return "HIT";
  return "MISS";
}
