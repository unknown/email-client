import type { Config } from "drizzle-kit";

export default {
  schema: "./electron/database/schema.ts",
  out: "./electron/database/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./db.sqlite",
  },
  verbose: true,
  strict: true,
} satisfies Config;
