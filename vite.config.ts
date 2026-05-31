import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
    },
    // Attempting to disable prerendering at the top level
    prerender: {
      enabled: false,
    },
  },
});
