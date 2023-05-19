/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  root: true,
  rules: {
    "array-bracket-spacing": 0,
    "arrow-parens": 0,
    camelcase: 0,
    "no-unused-vars": 0, // @typescript-eslint also has this rule
    "no-var": 0,
    "object-curly-spacing": 0,
    "object-shorthand": 0,
    "prettier/prettier": 2,
    quotes: 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-explicit-any": 0,
  },
};
