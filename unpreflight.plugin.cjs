const plugin = require("tailwindcss/plugin");
const fs = require("fs");
const postcss = require("postcss");

module.exports = plugin(function ({ addBase, addUtilities }) {
  const preflightStyles = postcss.parse(
    fs.readFileSync(require.resolve("tailwindcss/lib/css/preflight.css"), "utf8"),
  );

  preflightStyles.walkRules((rule) => {
    rule.selectors = rule.selectors.map((selector) => `${selector}:where(:not(.unpreflight *))`);
    rule.selector = rule.selectors.join(",");
  });

  addBase(preflightStyles.nodes);
  addUtilities({
    ".unpreflight": {
      all: "revert",
    },
  });
});
