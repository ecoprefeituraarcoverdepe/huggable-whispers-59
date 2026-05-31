import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
  vite: {
    build: {
      // For Hostinger/HostGator, we want a pure SPA build.
      // We disable SSR build to avoid prerendering errors and unnecessary server files.
      ssr: false,
    },
  },
});
