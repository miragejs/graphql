"use strict";

const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

const DIST_PATH = "./dist";
const SRC_PATH = "./lib";

function babelBuild(srcPath, options) {
  options.comments = false;

  return babel.transformFileSync(srcPath, options).code + "\n";
}

function readdirRecursive(dirPath, opts = {}) {
  const result = [];
  const { ignoreDir } = opts;

  for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const { name } = dirent;

    if (!dirent.isDirectory()) {
      result.push(name);
      continue;
    }

    if (ignoreDir && ignoreDir.test(name)) {
      continue;
    }

    const list = readdirRecursive(path.join(dirPath, name), opts).map((f) =>
      path.join(name, f)
    );

    result.push(...list);
  }

  return result;
}

function rmdirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const fullPath = path.join(dirPath, dirent.name);

      if (dirent.isDirectory()) {
        rmdirRecursive(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }

    fs.rmdirSync(dirPath);
  }
}

if (require.main === module) {
  rmdirRecursive(DIST_PATH);

  fs.mkdirSync(DIST_PATH);

  const srcFiles = readdirRecursive(SRC_PATH, { ignoreDir: /^__.*__$/ });

  for (const filepath of srcFiles) {
    const srcPath = path.join(SRC_PATH, filepath);
    const destPath = path.join(DIST_PATH, filepath);
    const cjs = babelBuild(srcPath, { envName: "cjs" });
    const mjs = babelBuild(srcPath, { envName: "mjs" });

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, cjs);
    fs.writeFileSync(destPath.replace(/\.js$/, "-mjs.js"), mjs);
  }
}
