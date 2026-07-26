import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { seedDatabase } from "./seed";

async function runMigrationAndSeed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment.");
  }
  console.log("Connecting to Neon PostgreSQL database...");
  const sql = neon(process.env.DATABASE_URL);

  const migrationPath = path.join(process.cwd(), "drizzle", "0000_wealthy_mister_fear.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  console.log("Applying database schema migrations to Neon...");
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (e: any) {
      if (!e.message?.includes("already exists")) {
        console.warn("Notice during statement execution:", e.message || e);
      }
    }
  }

  console.log("Schema migration complete! Seeding initial substitution rules & places...");
  await seedDatabase();
  console.log("Database successfully migrated and seeded!");
}

runMigrationAndSeed().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
