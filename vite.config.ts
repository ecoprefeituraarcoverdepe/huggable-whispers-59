import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
    nitro: {
      preset: "cloudflare-pages",
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@tanstack')) {
                return 'vendor-tanstack';
              }
              if (id.includes('react')) {
                return 'vendor-react';
              }
              if (id.includes('@lucide') || id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              return 'vendor';
            }
          },
        },
      },
    },
    plugins: [
      {
        name: 'fix-server-js-path',
        writeBundle(options: any) {
          const outDir = options.dir || '';
          if (outDir.endsWith('server')) {
            try {
              const files = fs.readdirSync(outDir);
              const entryFile = files.find(f => f === 'index.js' || (f.endsWith('.js') && !f.includes('-')));
              if (entryFile) {
                fs.copyFileSync(path.join(outDir, entryFile), path.join(outDir, 'server.js'));
              }
            } catch (err) {
              // Silently fail if dir doesn't exist yet
            }
          }
        }
      }
    ]
  }
});
