const plugin = require("tailwindcss/plugin");
const fs = require("fs");
const postcss = require("postcss");

module.exports = plugin(function ({ addBase, addUtilities }) {
  const preflightStyles = postcss.parse(
    fs.readFileSync(require.resolve("tailwindcss/lib/css/preflight.css"), "utf8"),
  );

  preflightStyles.walkRules((rule) => {
    rule.selectors = rule.selectors.map((selector) => `.unpreflight ${selector}`);
    rule.selector = rule.selectors.join(",");
    rule.nodes.forEach((node, i) => {
      if (node.type === "decl") {
        rule.nodes[i].value = "revert";
      }
    });
  });

  addBase(preflightStyles.nodes);
  addUtilities({
    ".unpreflight": {
      all: "revert",
    },
  });
});
