import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/",
      },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) => {
            // Force the entry point to be 'server.js' in the SSR build
            if (chunkInfo.name === 'server' || chunkInfo.facadeModuleId?.includes('server.ts')) {
              return 'server.js';
            }
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
  },
});
