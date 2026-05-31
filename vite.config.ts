import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      // Disable prerendering as it's failing in this environment 
      // and we will handle index.html generation manually.
      prerender: false,
    },
  },
});
