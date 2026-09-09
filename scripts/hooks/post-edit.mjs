// PostToolUse hook: format the file Claude just edited/wrote.
// Safe by design: exits 0 whenever the project is not scaffolded yet.
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  /* no/invalid stdin → nothing to do */
}

const file = payload?.tool_input?.file_path ?? payload?.tool_input?.filePath;
if (!file || !existsSync(file)) process.exit(0);
if (!existsSync("node_modules")) process.exit(0); // bootstrap phase

const formattable = [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".mdx", ".css", ".yml", ".yaml"];
if (!formattable.some((ext) => file.endsWith(ext))) process.exit(0);

spawnSync("pnpm", ["-s", "exec", "prettier", "--write", "--log-level", "warn", file], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(0);
