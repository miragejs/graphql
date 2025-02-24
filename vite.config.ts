/// <reference types="vitest" />

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";
import path from "path";

/**
 * Dynamically generate `lib/index.ts` to ensure all modules are exported.
 */
function generateExports() {
  const rootDir = path.resolve("lib");
  const indexFile = path.join(rootDir, "index.ts");

  function getExports(dir: string, prefix = "./") {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      const exportPath = prefix + entry.name.replace(/\.ts$/, "");

      // Ignore __mocks__ directories
      if (entry.isDirectory()) {
        if (entry.name === "__mocks__") return [];
        return getExports(fullPath, exportPath + "/");
      } else if (entry.name.endsWith(".ts") && entry.name !== "index.ts") {
        return `export * from "${exportPath}.js";`;
      }
      return [];
    });
  }

  const exports = getExports(rootDir).join("\n") + "\n";
  fs.writeFileSync(indexFile, exports);
  console.log("✅ Auto-generated exports in index.ts (excluding __mocks__)");
}

// Ensure exports are generated before the build
generateExports();

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
      exclude: ["**/*/__mocks__", "test/**/*"],
      outDir: "dist/types",
      copyDtsFiles: true,
    }),
  ],
});
