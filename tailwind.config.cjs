/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg))",
        "bg-2": "rgb(var(--color-bg-2))",
        ui: "rgb(var(--color-ui))",
        "ui-2": "rgb(var(--color-ui-2))",
        "ui-3": "rgb(var(--color-ui-3))",
        tx: "rgb(var(--color-tx))",
        "tx-2": "rgb(var(--color-tx-2))",
        "tx-3": "rgb(var(--color-tx-3))",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("./unpreflight.plugin.cjs"),
    require("./animation-delay.plugin.cjs"),
  ],
};
