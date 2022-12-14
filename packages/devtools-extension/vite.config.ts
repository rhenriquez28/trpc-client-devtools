import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import pkg from "./package.json";

/**
 * Three ways to declare the manifest:
 * 1. Create a JSON and import to vite.config.ts
 * 2. Declare the manifest inline in the vite.config.ts
 * 3. Use `defineManifest` function here or in own file
 */
const manifest = defineManifest({
  manifest_version: 3,
  name: "tRPC Client Devtools",
  version: pkg.version,
  icons: {
    "16": "src/extension/assets/trpc-logo-16.png",
    "32": "src/extension/assets/trpc-logo-32.png",
    "48": "src/extension/assets/trpc-logo-48.png",
    "128": "src/extension/assets/trpc-logo-128.png",
  },
  description:
    "An unofficial tRPC devtools extension to inspect your queries, mutations and subscriptions",
  background: {
    service_worker: "src/extension/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/extension/content-script.ts"],
      matches: ["<all_urls>"],
      run_at: "document_start",
    },
  ],
  devtools_page: "src/extension/devtools/panel.html",
});

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3002 },
  build: {
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "src/extension/devtools/panel.html"),
      },
    },
  },
  plugins: [react(), crx({ manifest })],
  optimizeDeps: {
    entries: ["src/**/*.html"],
  },
});
