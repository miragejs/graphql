/// <reference types="vitest" />

import { PluginOption, defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import graphql from "@rollup/plugin-graphql";

const graphQLPlugin = graphql as unknown as () => PluginOption;

export default defineConfig({
  plugins: [graphQLPlugin()],
  test: {
    exclude: [...configDefaults.exclude, "test/integration/**/*.test.ts"],
  },
});
