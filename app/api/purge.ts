import type { Route } from "./+types/purge";
import { purgeCacheEntry } from "~/lib/cache";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  const tag = formData.get("tag") as string;

  const results: string[] = [];

  if (url) {
    const purged = await purgeCacheEntry(new Request(new URL(url, request.url)));
    results.push(`URL "${url}": ${purged ? "purged" : "not found in cache"}`);
  }

  if (tag) {
    results.push(`Tag "${tag}": purge requested (per-datacenter)`);
  }

  if (results.length === 0) {
    return new Response("No URL or tag provided", { status: 400 });
  }

  const redirectTo = (formData.get("redirect") as string) || "/";

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "X-Cache-Purge": JSON.stringify(results),
    },
  });
}
