import { readdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import Database from "better-sqlite3";

const filename = "pilot-test.db";
const path = resolve(process.cwd(), filename);
await rm(path, { force: true });

const migrationRoot = resolve(process.cwd(), "prisma", "migrations");
const folders = (await readdir(migrationRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const database = new Database(path);
try {
  for (const folder of folders) database.exec(await readFile(resolve(migrationRoot, folder, "migration.sql"), "utf8"));
} finally {
  database.close();
}

const env = {
  ...process.env,
  NODE_ENV: "development",
  PILOT_MODE: "true",
  PILOT_LOCAL_TEST_MODE: "true",
  PILOT_WORKSPACE_ID: "mills-trucking-pilot",
  OWNER_OPERATOR_DATABASE_URL: "file:./pilot-test.db",
};
const child = spawn(process.execPath, ["--no-warnings", "--experimental-strip-types", "scripts/seed-pilot.mts"], { cwd: process.cwd(), env, stdio: "inherit" });
const exitCode = await new Promise((resolveExit, reject) => { child.once("error", reject); child.once("exit", (code) => resolveExit(code ?? 1)); });
if (exitCode !== 0) process.exitCode = exitCode;
