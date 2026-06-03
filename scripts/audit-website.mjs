import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const checks = [
  "audit-release-safety.mjs",
  "audit-indexability.mjs",
  "audit-nav-footer.mjs",
  "audit-accessibility-static.mjs",
];

for (const check of checks) {
  execFileSync("node", [join(repoRoot, "scripts", check)], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

console.log("Website audit suite passed.");
