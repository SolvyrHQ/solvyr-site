import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", ".site-dist", "node_modules", "review"].includes(entry.name)) return [];
      return walk(path);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function localTarget(fromFile, href) {
  if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) return null;

  let parsed;
  try {
    parsed = new URL(href, "https://solvyr.com/");
  } catch {
    return { error: `invalid URL: ${href}` };
  }

  if (parsed.origin !== "https://solvyr.com") return null;

  const isRootRelative = href.startsWith("/") || /^https:\/\/solvyr\.com(?:\/|$)/.test(href);
  const relativePath = href.split(/[?#]/, 1)[0];
  let path = isRootRelative
    ? resolve(repoRoot, `.${decodeURIComponent(parsed.pathname)}`)
    : relativePath
      ? resolve(dirname(fromFile), decodeURIComponent(relativePath))
      : fromFile;

  if (isRootRelative && parsed.pathname === "/") path = join(repoRoot, "index.html");
  if (!extname(path) && !existsSync(path)) path = join(path, "index.html");

  return { path: normalize(path), hash: decodeURIComponent(parsed.hash.slice(1)), href };
}

function hasFragment(html, fragment) {
  if (!fragment || fragment.includes("=")) return true;
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    new RegExp(`\\sid=["']${escaped}["']`).test(html) ||
    new RegExp(`\\sdata-page=["']${escaped}["']`).test(html)
  );
}

const failures = [];
let checked = 0;

for (const file of walk(repoRoot).sort()) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*>/gi)) {
    const target = localTarget(file, match[1]);
    if (!target) continue;
    if (target.error) {
      failures.push(`${relative(repoRoot, file)}: ${target.error}`);
      continue;
    }

    checked += 1;
    if (!target.path.startsWith(repoRoot) || !existsSync(target.path)) {
      failures.push(`${relative(repoRoot, file)}: missing target ${target.href}`);
      continue;
    }

    if (target.hash && target.path.endsWith(".html")) {
      const targetHtml = readFileSync(target.path, "utf8");
      if (!hasFragment(targetHtml, target.hash)) {
        failures.push(`${relative(repoRoot, file)}: missing fragment ${target.href}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Local link audit passed (${checked} internal links checked).`);
