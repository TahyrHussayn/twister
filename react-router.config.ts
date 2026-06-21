import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  prerender: ["/ssg", "/ppr", "/hybrid"],
} satisfies Config;
