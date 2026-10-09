import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    globals: true,

    environment: "node",

    setupFiles: ["./tests/setup.ts"],

    include: [
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "tests/components/**/*.{test,spec}.{ts,tsx}",
      "tests/integration/**/*.{test,spec}.{ts,tsx}",
    ],

    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],

    coverage: {
      reporter: ["text", "html", "json"],

      exclude: ["node_modules/", ".next/", "tests/"],
    },
  },
});
