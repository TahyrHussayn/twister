export type CacheStatus = "HIT" | "MISS" | "STALE" | "REVALIDATED" | "BYPASS" | "DYNAMIC";

declare global {
  interface CacheStorage {
    readonly default: Cache;
  }
}

function getCache(): Cache | null {
  try {
    return caches.default;
  } catch {
    return null;
  }
}

export async function getCachedResponse(request: Request): Promise<Response | null> {
  const cache = getCache();
  if (!cache) return null;
  try {
    const match = await cache.match(request);
    return match ?? null;
  } catch {
    return null;
  }
}

export async function putCacheEntry(request: Request, response: Response): Promise<void> {
  const cache = getCache();
  if (!cache) return;
  try {
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
  const cache = getCache();
  if (!cache) return false;
  try {
    return await cache.delete(request);
  } catch {
    return false;
  }
}
