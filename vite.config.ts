import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

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
    plugins: [
      {
        name: 'fix-server-js-path',
        writeBundle(options: any) {
          // Check if this is the SSR build by looking at the output directory
          const outDir = options.dir || '';
          if (outDir.endsWith('server')) {
            try {
              const files = fs.readdirSync(outDir);
              // Find the main index.js or any JS file that might be the entry
              const entryFile = files.find(f => f === 'index.js' || (f.endsWith('.js') && !f.includes('-')));
              if (entryFile) {
                fs.copyFileSync(path.join(outDir, entryFile), path.join(outDir, 'server.js'));
                console.log(`[fix-server-js-path] Copied ${entryFile} to server.js in ${outDir}`);
              }
            } catch (err) {
              console.error('[fix-server-js-path] Error:', err);
            }
          }
        }
      }
    ]
  }
});
