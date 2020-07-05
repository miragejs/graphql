module.exports = {
  root: true,
  parser: "babel-eslint",
  plugins: ["import"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:prettier/recommended",
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  rules: {
    camelcase: 0,
    "object-curly-spacing": 0,
    quotes: 0,
    "array-bracket-spacing": 0,
    "no-var": 0,
    "object-shorthand": 0,
    "arrow-parens": 0,
    "no-unused-vars": ["error", { args: "none" }],
  },
  overrides: [
    {
      files: [
        "jest.config.js",
      ],
      env: {
        browser: false,
        node: true,
      },
    },
    {
      files: [
        "**/__mocks__/**",
        "__tests__/**"
      ],
      plugins: ["jest"],
      env: {
        "jest/globals": true,
      },
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
    },
  ],
  settings: {
    "import/resolver": {
      alias: [
        ["@lib", "./lib"],
        ["@tests", "./__tests__"],
      ],
      node: {
        extensions: ["js"],
      },
    },
  },
};
