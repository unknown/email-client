import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: "src/electron/main.ts",
      },
      preload: {
        input: "src/electron/preload.ts",
      },
    }),
  ],
});
