// Stop hook: when Claude wants to finish with uncommitted changes, run the quick checks.
// Exit code 2 = "not yet": Claude receives stderr and keeps working until it passes.
// Guards: stop_hook_active (prevents loops), ITERUS_SKIP_STOP_CHECK=1, missing project.
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  /* ignore */
}

if (payload.stop_hook_active) process.exit(0);
if (process.env.ITERUS_SKIP_STOP_CHECK === "1") process.exit(0);
if (!existsSync("package.json")) process.exit(0);

let scripts = {};
try {
  scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {};
} catch {
  process.exit(0);
}
if (!scripts["check:quick"]) process.exit(0);

const status = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
if (status.status !== 0 || !status.stdout.trim()) process.exit(0); // clean tree → nothing to verify

const run = spawnSync("pnpm", ["-s", "run", "check:quick"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (run.status !== 0) {
  process.stderr.write(
    "check:quick failed. Fix the issues below before finishing (or commit a WIP and explain):\n" +
      (run.stdout || "") +
      (run.stderr || ""),
  );
  process.exit(2);
}
process.exit(0);
