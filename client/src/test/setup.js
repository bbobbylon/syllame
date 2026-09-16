/**
 * Runs before every Vitest file (see `test.setupFiles` in vite.config.js).
 * Registers jest-dom matchers such as `toBeInTheDocument()` on Vitest's `expect`.
 */

import "@testing-library/jest-dom/vitest";
