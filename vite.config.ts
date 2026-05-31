import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { viteSingleFile } from "vite-plugin-singlefile";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  vite: {
    plugins: [viteSingleFile()],
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 100000000, // Inline all assets
    },
    base: "./",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});

