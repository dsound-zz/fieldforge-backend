import fs from "fs";
import path from "path";
import { pool } from "../config/db";
import { logger } from "../config/logger";

const migrationsDir = path.join(__dirname, "../../migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const res = await pool.query("SELECT filename FROM schema_migrations");
  return new Set(res.rows.map((row) => row.filename as string));
}

async function applyMigration(filename: string) {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, "utf-8");
  logger.info({ filename }, "Applying migration");
  await pool.query("BEGIN");
  try {
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations(filename) VALUES($1)", [filename]);
    await pool.query("COMMIT");
    logger.info({ filename }, "Migration applied");
  } catch (err) {
    await pool.query("ROLLBACK");
    logger.error({ err, filename }, "Migration failed");
    throw err;
  }
}

async function main() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      logger.debug({ file }, "Skipping already applied migration");
      continue;
    }
    await applyMigration(file);
  }

  await pool.end();
}

main().catch((err) => {
  logger.error({ err }, "Migration runner failed");
  process.exit(1);
});
