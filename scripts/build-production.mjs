import { copyFile, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, ".site-dist");

const publicPaths = [
  ".nojekyll",
  ".well-known",
  "044c86eeeacfff6d818b9be1035d5d685450d37abdbdc6f7a20c99fb8f6da16d.txt",
  "CNAME",
  "about-nl.html",
  "about.html",
  "ai",
  "assets/fonts",
  "assets/brand/icon.png",
  "assets/brand/solvyr-icon-hybrid-256.png",
  "assets/brand/solvyr-icon-hybrid.svg",
  "assets/brand/solvyr-logo-hybrid-reversed.svg",
  "assets/brand/solvyr-logo-hybrid.svg",
  "assets/brand/solvyr-social-card.png",
  "assets/brand/solvyr-social-card-nl.png",
  "capabilities.yaml",
  "connectors-nl.html",
  "connectors.html",
  "downloads",
  "favicon.ico",
  "index.html",
  "legal-nl.html",
  "legal.html",
  "llms.txt",
  "measure",
  "nl.html",
  "pilot-intake-nl.html",
  "pilot-intake.html",
  "pricing.yaml",
  "privacy-nl.html",
  "privacy.html",
  "proof",
  "robots.txt",
  "sample-output.html",
  "sample-output-nl.html",
  "sitemap.xml",
  "styles.css",
  "use-cases"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

async function copy(source, destination) {
  const sourceStat = await stat(source);
  if (sourceStat.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const entry of await readdir(source)) {
      await copy(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

for (const relativePath of publicPaths) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  await copy(source, destination);
}

const bannedNames = new Set([
  "jan-wouter-van-dalen.png",
  "maksym-wezdecki.png"
]);

async function walk(directory, prefix = "") {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry);
    const relative = path.join(prefix, entry);
    if ((await stat(absolute)).isDirectory()) files.push(...await walk(absolute, relative));
    else files.push(relative);
  }
  return files;
}

const builtFiles = await walk(output);
const violations = builtFiles.filter((file) => file === "v2" || file.startsWith(`v2${path.sep}`) || bannedNames.has(path.basename(file)));
if (violations.length) throw new Error(`Non-production files entered the build: ${violations.join(", ")}`);

const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
const localRoutes = [...sitemap.matchAll(/<loc>https:\/\/solvyr\.com\/(.*?)<\/loc>/g)]
  .map((match) => match[1] || "index.html")
  .filter((route) => !route.endsWith("/"));
const missingRoutes = [];
for (const route of localRoutes) {
  try { await stat(path.join(output, route)); }
  catch { missingRoutes.push(route); }
}
if (missingRoutes.length) throw new Error(`Sitemap routes missing from production build: ${missingRoutes.join(", ")}`);

console.log(`Built ${builtFiles.length} production files in .site-dist/`);
console.log("Excluded: v2 concept, review files, founder portraits, repository documentation, and build tooling.");
