import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const expected = {
  en: {
    nav: ["Fast Corpus", "Fit", "Output", "Proof", "Security", "Pilot"],
    footer: ["About", "Connectors", "Privacy", "Legal", "llms.txt", "AI brief", "Pricing YAML", "Pilot intake"],
  },
  nl: {
    nav: ["Fast Corpus", "Fit", "Output", "Proefrun", "Security", "Pilot"],
    footer: ["Over", "Connectors", "Privacy", "Juridisch", "llms.txt", "AI brief", "Pricing YAML", "Pilot intake"],
  },
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "v2") return [];
      return walk(path);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function textLabels(fragment) {
  return [...fragment.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((match) =>
    match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function languageFor(relPath) {
  return relPath === "nl.html" || relPath.endsWith("-nl.html") ? "nl" : "en";
}

function compare(relPath, area, actual, wanted) {
  if (actual.length !== wanted.length || actual.some((label, index) => label !== wanted[index])) {
    return `${relPath} ${area}: expected [${wanted.join(" | ")}], got [${actual.join(" | ")}]`;
  }
  return null;
}

const failures = [];

for (const file of walk(repoRoot).sort()) {
  const relPath = relative(repoRoot, file);
  const html = readFileSync(file, "utf8");
  const lang = languageFor(relPath);

  const nav = html.match(/<nav class="tabs"[\s\S]*?<\/nav>/);
  const footer = html.match(/<div class="footerLinks">([\s\S]*?)<\/div>/);

  if (!nav) {
    failures.push(`${relPath} nav: missing .tabs`);
  } else {
    const result = compare(relPath, "nav", textLabels(nav[0]), expected[lang].nav);
    if (result) failures.push(result);
  }

  if (!footer) {
    failures.push(`${relPath} footer: missing .footerLinks`);
  } else {
    const result = compare(relPath, "footer", textLabels(footer[1]), expected[lang].footer);
    if (result) failures.push(result);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Navigation and footer labels are consistent.");
