import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx, defineManifest } from "rollup-plugin-chrome-extension";
import { defineConfig } from "vite";
import { version } from "./package.json";

/**
 * Three ways to declare the manifest:
 * 1. Create a JSON and import to vite.config.ts
 * 2. Declare the manifest inline in the vite.config.ts
 * 3. Use `defineManifest` function here or in own file
 */
const manifest = defineManifest({
  manifest_version: 3,
  name: "CRX React Devtools",
  version,
  content_scripts: [
    {
      js: ["src/content-script.ts"],
      matches: ["<all_urls>"],
      run_at: "document_start",
    },
  ],
  devtools_page: "src/devtools.html",
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "src/panel.html"),
      },
    },
  },
  plugins: [react(), crx({ manifest })],
  optimizeDeps: {
    entries: ["src/devtools.html", "src/panel.html"],
  },
});
