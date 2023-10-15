const plugin = require("tailwindcss/plugin");
const fs = require("fs");
const postcss = require("postcss");

module.exports = plugin(function ({ addBase }) {
  const preflightStyles = postcss.parse(
    fs.readFileSync(require.resolve("tailwindcss/lib/css/preflight.css"), "utf8"),
  );

  preflightStyles.walkRules((rule) => {
    const selectors = rule.selector.split(",");
    rule.selector = selectors.map((selector) => `.email-preview ${selector}`).join(",");
    rule.nodes.forEach((node, i) => {
      if (node.type == "decl") {
        rule.nodes[i].value = "revert";
      }
    });
  });

  addBase(preflightStyles.nodes);
});
