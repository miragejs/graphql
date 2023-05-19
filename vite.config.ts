/// <reference types="vitest" />

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "lib/index.ts",
      fileName: "mirage-graphql",
      name: "MirageGraphQL",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      output: {
        sourcemap: true,
      },
    },
  },
});
