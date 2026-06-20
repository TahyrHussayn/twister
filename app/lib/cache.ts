declare const caches: {
  default: {
    match(req: Request): Promise<Response | undefined>;
    put(req: Request, res: Response): Promise<void>;
    delete(req: Request): Promise<boolean>;
  };
};

export type CacheStatus = "HIT" | "MISS" | "STALE" | "BYPASS" | "DYNAMIC";

export async function getCachedResponse(
  request: Request,
): Promise<{ response: Response; status: CacheStatus } | null> {
  try {
    const cached = await caches.default.match(request);
    if (cached) {
      const age = cached.headers.get("Age");
      const cacheControl = cached.headers.get("Cache-Control");
      const isStale = cacheControl?.includes("stale-while-revalidate") && age && parseInt(age) > 60;
      return {
        response: cached,
        status: isStale ? "STALE" : "HIT",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function putCacheEntry(request: Request, response: Response): Promise<void> {
  try {
    const clone = response.clone();
    await caches.default.put(request, clone);
  } catch {
    // Silently fail if cache is unavailable
  }
}

export async function purgeCacheEntry(request: Request): Promise<boolean> {
  try {
    return await caches.default.delete(request);
  } catch {
    return false;
  }
}

export function withCacheTag(response: Response, tag: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Tag", tag);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function withStaleWhileRevalidate(
  response: Response,
  maxAge = 60,
  staleRevalidate = 3600,
): Response {
  const headers = new Headers(response.headers);
  headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleRevalidate}`,
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function extractCacheStatus(headers: Headers): CacheStatus {
  const cf = headers.get("CF-Cache-Status");
  if (cf === "HIT") return "HIT";
  if (cf === "STALE") return "STALE";
  if (cf === "MISS" || cf === "EXPIRED") return "MISS";
  if (cf === "BYPASS") return "BYPASS";
  return "DYNAMIC";
}
