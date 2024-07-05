import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "postgresql",
    schema: "./schema.ts",
    out: "./supabase/migrations"
})