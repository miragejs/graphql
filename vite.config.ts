/// <reference types="vitest" />

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

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
  plugins: [
    dts({
      exclude: [
        "**/*/__mocks__",
        "test/**/*",
      ],
      outDir: "dist/types",
    }),
  ],
});
