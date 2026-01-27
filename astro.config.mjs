// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "wrangler.toml",
      persist: {
        path: "./.cache/wrangler/v3",
      },
    },
  }),
  integrations: [react(), tailwind({ applyBaseStyles: true })],
  output: "server",
  vite: {
    define: {
      "import.meta.env.PUBLIC_API_URL": JSON.stringify(
        process.env.API_URL || "http://localhost:8080"
      ),
    },
  },
});
