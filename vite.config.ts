import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
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
          // Force the SSR entry point to be named server.js so the prerenderer can find it
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'server' || chunkInfo.facadeModuleId?.includes('server')) {
              return 'server.js';
            }
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
  },
});
