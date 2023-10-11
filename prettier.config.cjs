/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/

/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  printWidth: 100,
  singleQuote: false,
  tabWidth: 2,
  semi: true,
  trailingComma: "all",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: ["<THIRD_PARTY_MODULES>", "", "^@/(.*)$", "^[./]"],
};

module.exports = config;
