/**
 * Vite configuration for the SyllaMe client.
 *
 * Vite replaces Create React App (react-scripts). Analogy: CRA was a
 * pre-built kitchen you could not rearrange; Vite is a kitchen where every
 * appliance is a plugin you can swap. It is also dramatically faster because
 * in development it serves source files as native ES modules instead of
 * bundling the whole app on every change.
 *
 * @see https://vite.dev/config/
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    /**
     * Forward `/api/*` to the Express server during development so the
     * browser sees one origin and no CORS setup is needed. This replaces the
     * `"proxy": "http://localhost:5000"` line CRA supported in package.json.
     */
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },

  build: {
    /** Express serves this folder in production (see ../app.js). */
    outDir: "dist"
  },

  /** Vitest reads its settings from the same file. */
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false
  }
});
