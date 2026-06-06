import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const expected = {
  en: {
    nav: ["Fast Corpus", "Use cases", "Fit", "Output", "Proof", "Security", "Pilot"],
    useCases: ["PDF to RAG corpus", "Document re-indexing", "Public-data quality runs", "Document intake"],
    useCaseHrefIncludes: {
      "PDF to RAG corpus": "use-cases/pdf-to-rag-corpus.html",
      "Document re-indexing": "use-cases/document-reindexing.html",
      "Public-data quality runs": "use-cases/public-data-quality.html",
      "Document intake": "use-cases/document-intake.html",
    },
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
    nav: ["Fast Corpus", "Toepassingen", "Fit", "Output", "Proefrun", "Security", "Pilot"],
    useCases: ["PDF naar RAG-corpus", "Documenten herindexeren", "Publieke datakwaliteit", "Documentintake"],
    useCaseHrefIncludes: {
      "PDF naar RAG-corpus": "use-cases/pdf-to-rag-corpus-nl.html",
      "Documenten herindexeren": "use-cases/document-reindexing-nl.html",
      "Publieke datakwaliteit": "use-cases/public-data-quality-nl.html",
      Documentintake: "use-cases/document-intake-nl.html",
    },
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

function primaryNavLabels(fragment) {
  return [...fragment.matchAll(/<(a|summary)\b([^>]*)>([\s\S]*?)<\/\1>/g)]
    .filter((match) => /\bclass="[^"]*\btab\b/.test(match[2]))
    .map((match) =>
      match[3]
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

function dropdownFragment(fragment) {
  return fragment.match(/<div class="dropdownMenu">([\s\S]*?)<\/div>/)?.[1] || "";
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
    const result = compare(relPath, "nav", primaryNavLabels(nav[0]), expected[lang].nav);
    if (result) failures.push(result);
    const useCaseLinks = links(dropdownFragment(nav[0]));
    const dropdownResult = compare(relPath, "use-case dropdown", useCaseLinks.map((link) => link.label), expected[lang].useCases);
    if (dropdownResult) failures.push(dropdownResult);
    for (const link of useCaseLinks) {
      const required = expected[lang].useCaseHrefIncludes[link.label];
      if (required && !link.href.includes(required)) {
        failures.push(`${relPath} use-case href for ${link.label}: expected to include ${required}, got ${link.href}`);
      }
    }
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

  if (relPath.startsWith("use-cases/")) {
    const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/);
    if (!hero) {
      failures.push(`${relPath} use-case hero: missing .hero section`);
    } else {
      const heroLinks = links(hero[0]);
      const hasPrimaryScopeCta = heroLinks.some(
        (link) => link.href.includes("pilot-intake") && /\bScope\b/.test(link.label)
      );
      const hasSecondaryCta = heroLinks.length >= 2;
      if (!hasPrimaryScopeCta) {
        failures.push(`${relPath} use-case hero: missing workload-specific scope CTA`);
      }
      if (!hasSecondaryCta) {
        failures.push(`${relPath} use-case hero: missing secondary CTA`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Navigation and footer labels are consistent.");
