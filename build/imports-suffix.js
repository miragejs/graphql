"use strict";

/**
 * Adds suffix to all paths imported inside MJS files
 *
 * Transforms:
 *  import { foo } from "./bar";
 *  export { foo } from "./bar";
 *
 * to:
 *  import { foo } from "./bar-mjs";
 *  export { foo } from "./bar-mjs";
 */
module.exports = function addExtensionToImportPaths(context, { suffix }) {
  const { types } = context;

  function replaceImportPath(path) {
    if (!path.node.source) {
      return;
    }

    const source = path.node.source.value;

    if (source.startsWith("./") || source.startsWith("../")) {
      const newSourceNode = types.stringLiteral(source + suffix);

      path.get("source").replaceWith(newSourceNode);
    }
  }

  return {
    visitor: {
      ImportDeclaration: replaceImportPath,
      ExportNamedDeclaration: replaceImportPath,
    },
  };
};
