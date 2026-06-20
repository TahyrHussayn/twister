import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request) {
    try {
      return await requestHandler(request);
    } catch (e) {
      console.error("Worker request failed:", e instanceof Error ? e.message : String(e));
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
