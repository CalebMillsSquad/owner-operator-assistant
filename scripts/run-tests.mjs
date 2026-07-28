import { spawn } from "node:child_process";
import { readdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import Database from "better-sqlite3";

const databaseFilename = "test.db";
const databaseFiles = [databaseFilename, `${databaseFilename}-wal`, `${databaseFilename}-shm`, `${databaseFilename}-journal`];
const env = {
  ...process.env,
  DATABASE_URL: "file:../test.db",
  OWNER_OPERATOR_DATABASE_URL: "file:./test.db",
  NODE_ENV: "test",
};

function run(command, args) {
  const child = spawn(command, args, { cwd: process.cwd(), env, stdio: "inherit" });

  return new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolveExit(code ?? 1));
  });
}

async function removeTestDatabase() {
  for (const filename of databaseFiles) {
    await rm(resolve(process.cwd(), filename), { force: true });
  }
}

await removeTestDatabase();

const migrationRoot = resolve(process.cwd(), "prisma", "migrations");
const migrationFolders = (await readdir(migrationRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const testDatabase = new Database(resolve(process.cwd(), databaseFilename));

try {
  for (const folder of migrationFolders) {
    const sql = await readFile(resolve(migrationRoot, folder, "migration.sql"), "utf8");
    testDatabase.exec(sql);
  }
} finally {
  testDatabase.close();
}

const testExitCode = await run(process.execPath, ["--no-warnings", "--test", "--experimental-strip-types", "src/lib/*.test.mts"]);

await removeTestDatabase();
process.exitCode = testExitCode;
