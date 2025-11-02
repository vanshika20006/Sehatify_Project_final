import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Use Neon's connection pooler to avoid "too many clients" errors
const pooledUrl = process.env.DATABASE_URL.includes('.us-east-2')
  ? process.env.DATABASE_URL.replace('.us-east-2', '-pooler.us-east-2')
  : process.env.DATABASE_URL;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: pooledUrl,
  },
});
