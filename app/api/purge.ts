import type { Route } from "./+types/purge";
import { purgeCacheEntry } from "~/lib/cache";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  const redirectTo = (formData.get("redirect") as string) || "/";

  if (url) {
    await purgeCacheEntry(new Request(new URL(url, request.url)));
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `${redirectTo}?purged=${Date.now()}` },
  });
}
