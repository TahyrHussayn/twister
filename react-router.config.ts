import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  prerender: ["/ssg", "/hybrid"],
} satisfies Config;
