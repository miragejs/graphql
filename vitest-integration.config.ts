/// <reference types="vitest" />

import { PluginOption, defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import graphql from "@rollup/plugin-graphql";

const graphQLPlugin = graphql as unknown as () => PluginOption;

export default defineConfig({
  plugins: [graphQLPlugin()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: "chrome",
      provider: "webdriverio",
    },
    coverage: {
      exclude: [
        ...configDefaults.coverage.exclude,
        "**/__mocks__/**",
        "codegen.ts",
        "vitest-*.config.ts",
      ],
      provider: "istanbul",
      reporter: ["html"],
    },
    exclude: [...configDefaults.exclude, "test/unit/**/*.test.ts"],
  },
});
