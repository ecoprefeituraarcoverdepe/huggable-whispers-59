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
