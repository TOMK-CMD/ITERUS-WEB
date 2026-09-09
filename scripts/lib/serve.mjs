// Starts the production server of apps/web (`next start`) for scripts that need real responses
// (check-schema, check-links, smoke checks). Cross-platform: spawns Node directly, no shell.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const WEB_DIR = path.join(ROOT, "apps", "web");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {{ port?: number, timeoutMs?: number }} [options]
 * @returns {Promise<{ base: string, stop: () => void }>}
 */
export async function startServer({ port = 3100, timeoutMs = 90_000 } = {}) {
  const nextBin = path.join(WEB_DIR, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: WEB_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(port), NEXT_TELEMETRY_DISABLED: "1" },
  });
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  const base = `http://localhost:${port}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited with code ${child.exitCode}\n${output}`);
    }
    try {
      const response = await fetch(`${base}/robots.txt`);
      if (response.ok) return { base, stop: () => child.kill() };
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  child.kill();
  throw new Error(`next start did not become ready within ${timeoutMs} ms\n${output}`);
}
