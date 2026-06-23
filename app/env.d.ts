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

/** Injected by Vite at build time — used by SSG to prove data is frozen */
declare const __BUILD_TIME__: number;
declare const __BUILD_ID__: string;
