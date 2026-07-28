import { spawn } from "node:child_process";

const pilot = process.env.PILOT_MODE === "true";
function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

await run(process.execPath, ["node_modules/prisma/build/index.js", "generate", ...(pilot ? ["--schema", "prisma/pilot/schema.prisma"] : [])]);
await run(process.execPath, ["node_modules/next/dist/bin/next", "build"], { ...process.env, NEXT_DIST_DIR: ".next-build" });
