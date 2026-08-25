import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const excludedDirectories = new Set([".git", ".site-dist", "docs", "measure", "scripts", "v2"]);
const publicTextExtensions = new Set([".html", ".json", ".md", ".txt", ".yaml"]);
const founderPortraitFiles = ["jan-wouter-van-dalen.png", "maksym-wezdecki.png"];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(path);
    }
    return entry.isFile() && publicTextExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

const failures = [];
const requiredAssets = [
  "assets/brand/solvyr-icon-hybrid-256.png",
  "assets/fonts/InterVariable.woff2",
  "assets/fonts/Inter-OFL.txt",
  "favicon.ico",
];

for (const asset of requiredAssets) {
  if (!existsSync(join(repoRoot, asset))) failures.push(`missing settled production asset: ${asset}`);
}

const styles = readFileSync(join(repoRoot, "styles.css"), "utf8");
if (!styles.includes('url("/assets/fonts/InterVariable.woff2")')) {
  failures.push("styles.css: Inter must use the self-hosted variable font");
}

for (const file of walk(repoRoot)) {
  const relPath = relative(repoRoot, file);
  const source = readFileSync(file, "utf8");

  if (/sales@solvyr\.com/i.test(source)) {
    failures.push(`${relPath}: contains retired public contact sales@solvyr.com`);
  }
  if (/privacy@solvyr\.com/i.test(source)) {
    failures.push(`${relPath}: contains retired public contact privacy@solvyr.com`);
  }

  for (const portrait of founderPortraitFiles) {
    if (source.includes(portrait)) {
      failures.push(`${relPath}: references production-excluded founder portrait ${portrait}`);
    }
  }

  if (!file.endsWith(".html")) continue;

  if (source.includes("assets/brand/icon.png")) {
    failures.push(`${relPath}: references the retired generic brand icon`);
  }

  // Standalone download-bundle viewers must also work after unzipping, where
  // root-relative site assets are unavailable.
  if (!relPath.startsWith("downloads/")) {
    if (!source.includes('href="/favicon.ico')) {
      failures.push(`${relPath}: page head does not use the approved favicon`);
    }
    if (!source.includes('href="/assets/brand/solvyr-icon-hybrid-256.png')) {
      failures.push(`${relPath}: page head does not use the approved compact touch icon`);
    }
  }

  const withoutProtectedEmails = source.replace(
    /<!--email_off-->[\s\S]*?<!--\/email_off-->/gi,
    ""
  );
  if (/href="mailto:hello@solvyr\.com/i.test(withoutProtectedEmails)) {
    failures.push(`${relPath}: public contact link is exposed to Cloudflare email-link rewriting`);
  }

  for (const match of source.matchAll(/<a\b([^>]*\bhref="https:\/\/[^\"]*linkedin\.com\/[^\"]+"[^>]*)>/gi)) {
    const attributes = match[1];
    const rel = attributes.match(/\brel="([^"]*)"/i)?.[1].toLowerCase().split(/\s+/) || [];
    if (!/\btarget="_blank"/i.test(attributes)) {
      failures.push(`${relPath}: LinkedIn link must open in a new tab`);
    }
    if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
      failures.push(`${relPath}: LinkedIn link must use rel="noopener noreferrer"`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Settled production preferences are consistent.");
