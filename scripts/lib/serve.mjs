// Starts the production server of apps/web (`next start`) for scripts that need real responses
// (check-schema, check-links, smoke checks). Cross-platform: spawns Node directly, no shell.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const WEB_DIR = path.join(ROOT, "apps", "web");

const OUTPUT_KEEP = 8_000; // characters of server output kept for error messages
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
  const keep = (chunk) => {
    output = (output + chunk.toString("utf8")).slice(-OUTPUT_KEEP);
  };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);

  // Never leave the server behind if the calling script crashes or is interrupted.
  const stop = () => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  };
  process.once("exit", stop);
  process.once("SIGINT", () => {
    stop();
    process.exit(130);
  });

  const base = `http://localhost:${port}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `next start exited (code ${child.exitCode}, signal ${child.signalCode})\n${output}`,
      );
    }
    try {
      const response = await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return { base, stop };
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  stop();
  throw new Error(`next start did not become ready within ${timeoutMs} ms\n${output}`);
}
