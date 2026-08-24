import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * The base path must be absolute.
 *
 * With a relative base ("./"), a nested route like /projects/qcanvas resolves
 * ./assets/index.js against /projects/, requests /projects/assets/index.js, gets
 * the SPA 404 fallback, and the browser refuses to execute HTML as a module — so
 * every deep link to a project page fails to load. An absolute base makes asset
 * URLs independent of route depth.
 *
 * Project site (github.io/portfolio/): "/portfolio/" — the default.
 * User site (username.github.io) or custom domain: set VITE_BASE_PATH=/
 */
const BASE_PATH = process.env.VITE_BASE_PATH ?? "/portfolio/";

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_PATH,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Long-lived vendor chunks so an app change doesn't invalidate the framework.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["motion"],
          forms: ["react-hook-form", "zod", "@hookform/resolvers/zod"],
          query: ["@tanstack/react-query"],
        },
      },
    },
    // The budget in REDESIGN_PLAN.md §12 is 180 KB gzip on first load.
    chunkSizeWarningLimit: 400,
  },
});
