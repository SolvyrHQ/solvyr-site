import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const allowPublicRemoval = process.env.SOLVYR_APPROVE_PUBLIC_REMOVAL === "1";
const allowSitemapRemoval = process.env.SOLVYR_APPROVE_SITEMAP_REMOVAL === "1";

function git(args, options = {}) {
  return execSync(`git ${args}`, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function isProtectedPath(path) {
  return (
    path.endsWith(".html") ||
    path === "robots.txt" ||
    path === "sitemap.xml" ||
    path === "llms.txt" ||
    path === "capabilities.yaml" ||
    path === "pricing.yaml" ||
    path === "CNAME" ||
    path === "favicon.ico" ||
    path === "solvyr-logo-2000.png" ||
    path.startsWith("ai/") ||
    path.startsWith("assets/brand/")
  );
}

function changedEntries() {
  const raw = git("diff --name-status -z HEAD --");
  if (!raw) return [];
  const parts = raw.split("\0").filter(Boolean);
  const entries = [];

  for (let index = 0; index < parts.length; index += 1) {
    const status = parts[index];
    if (status.startsWith("R") || status.startsWith("C")) {
      entries.push({ status, from: parts[index + 1], to: parts[index + 2] });
      index += 2;
    } else {
      entries.push({ status, path: parts[index + 1] });
      index += 1;
    }
  }

  return entries;
}

function sitemapLocs(text) {
  return new Set([...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()));
}

const failures = [];
const entries = changedEntries();

for (const entry of entries) {
  if (entry.status === "D" && isProtectedPath(entry.path) && !allowPublicRemoval) {
    failures.push(
      `${entry.path}: protected public file deletion requires explicit approval and SOLVYR_APPROVE_PUBLIC_REMOVAL=1`
    );
  }

  if (entry.status.startsWith("R") && (isProtectedPath(entry.from) || isProtectedPath(entry.to)) && !allowPublicRemoval) {
    failures.push(
      `${entry.from} -> ${entry.to}: protected public file rename requires explicit approval and SOLVYR_APPROVE_PUBLIC_REMOVAL=1`
    );
  }
}

if (existsSync(join(repoRoot, "sitemap.xml"))) {
  let previousSitemap = "";
  try {
    previousSitemap = git("show HEAD:sitemap.xml");
  } catch {
    previousSitemap = "";
  }

  if (previousSitemap) {
    const before = sitemapLocs(previousSitemap);
    const after = sitemapLocs(readFileSync(join(repoRoot, "sitemap.xml"), "utf8"));
    for (const url of before) {
      if (!after.has(url) && !allowSitemapRemoval) {
        failures.push(`${url}: sitemap URL removal requires explicit approval and SOLVYR_APPROVE_SITEMAP_REMOVAL=1`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Release safety guardrails passed.");
