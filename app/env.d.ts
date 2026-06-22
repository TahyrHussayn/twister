/// <reference types="@react-router/node" />
/// <reference types="vite/client" />

import "react-router";

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
      cf: CfProperties;
    };
  }
}
