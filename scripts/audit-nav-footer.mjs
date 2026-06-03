import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const expected = {
  en: {
    nav: ["Fast Corpus", "Fit", "Output", "Proof", "Security", "Pilot"],
    footer: ["About", "Connectors", "Privacy", "Legal", "llms.txt", "AI brief", "Pricing YAML", "Pilot intake"],
    footerHrefIncludes: {
      About: "about.html",
      Connectors: "connectors.html",
      Privacy: "privacy.html",
      Legal: "legal.html",
      "llms.txt": "llms.txt",
      "AI brief": "ai/fast-corpus.md",
      "Pricing YAML": "pricing.yaml",
      "Pilot intake": "pilot-intake.html",
    },
  },
  nl: {
    nav: ["Fast Corpus", "Fit", "Output", "Proefrun", "Security", "Pilot"],
    footer: ["Over", "Connectors", "Privacy", "Juridisch", "llms.txt", "AI brief", "Pricing YAML", "Pilot intake"],
    footerHrefIncludes: {
      Over: "about-nl.html",
      Connectors: "connectors-nl.html",
      Privacy: "privacy-nl.html",
      Juridisch: "legal-nl.html",
      "llms.txt": "llms.txt",
      "AI brief": "ai/fast-corpus.md",
      "Pricing YAML": "pricing.yaml",
      "Pilot intake": "pilot-intake-nl.html",
    },
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

function links(fragment) {
  return [...fragment.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => {
    const href = match[1].match(/\shref="([^"]+)"/)?.[1] || "";
    const label = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return { href, label };
  });
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
    const footerLinks = links(footer[1]);
    const result = compare(relPath, "footer", footerLinks.map((link) => link.label), expected[lang].footer);
    if (result) failures.push(result);
    for (const link of footerLinks) {
      const required = expected[lang].footerHrefIncludes[link.label];
      if (required && !link.href.includes(required)) {
        failures.push(`${relPath} footer href for ${link.label}: expected to include ${required}, got ${link.href}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Navigation and footer labels are consistent.");
