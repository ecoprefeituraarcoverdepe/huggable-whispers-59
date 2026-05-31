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
        // This hook runs during the build process
        generateBundle(options, bundle) {
          if (options.ssr) {
            // In SSR build, look for the entry chunk and ensure it's named correctly or shadowed
            for (const file of Object.values(bundle)) {
              if (file.type === 'chunk' && file.isEntry) {
                // If it's the entry point, we can't easily rename it here without breaking references
                // but we can note it.
              }
            }
          }
        },
        writeBundle(options, bundle) {
          if (options.ssr) {
            const outDir = options.dir || 'dist/server';
            // Find any .js file in the root of outDir and copy it to server.js
            const files = fs.readdirSync(outDir);
            const jsFile = files.find(f => f.endsWith('.js') && !f.includes('-'));
            if (jsFile) {
              fs.copyFileSync(path.join(outDir, jsFile), path.join(outDir, 'server.js'));
              console.log(`[fix-server-js-path] Copied ${jsFile} to server.js`);
            }
          }
        }
      }
    ]
  }
});
