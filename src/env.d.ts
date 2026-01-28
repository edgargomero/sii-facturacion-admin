/// <reference path="../.astro/types.d.ts" />
import type { SupabaseUser, Perfil } from "./lib/sii-api/types";

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    CUSTOMER_WORKFLOW: Workflow;
    DB: D1Database;
    // Auth data populated by middleware
    user?: SupabaseUser;
    perfil?: Perfil;
    isAuthenticated: boolean;
  }
}
