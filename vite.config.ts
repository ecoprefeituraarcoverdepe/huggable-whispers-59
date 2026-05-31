import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    viteSingleFile(),
  ],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
  base: "./",
});
