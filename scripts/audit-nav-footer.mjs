import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const expected = {
  en: {
    nav: ["Document intake", "Fast Corpus", "Use cases", "Proof", "Security", "Example run", "Discuss a test"],
    useCases: ["Extract and enrich data", "PDF to RAG corpus", "Document re-indexing", "Public-data quality runs"],
    useCaseHrefIncludes: {
      "Extract and enrich data": "use-cases/document-intake.html#output",
      "PDF to RAG corpus": "use-cases/pdf-to-rag-corpus.html",
      "Document re-indexing": "use-cases/document-reindexing.html",
      "Public-data quality runs": "use-cases/public-data-quality.html",
      "Document intake": "use-cases/document-intake.html",
    },
    footer: ["About", "Connectors", "Privacy", "Legal", "llms.txt", "AI brief", "Pricing YAML", "hello@solvyr.com", "Discuss a test"],
    footerHrefIncludes: {
      About: "about.html",
      Connectors: "connectors.html",
      Privacy: "privacy.html",
      Legal: "legal.html",
      "llms.txt": "llms.txt",
      "AI brief": "ai/fast-corpus.md",
      "Pricing YAML": "pricing.yaml",
      "hello@solvyr.com": "mailto:hello@solvyr.com",
      "Discuss a test": "pilot-intake.html",
    },
  },
  nl: {
    nav: ["Documentintake", "Fast Corpus", "Toepassingen", "Proefrun", "Security", "Voorbeeldrun", "Bespreek een test"],
    useCases: ["Gegevens uitlezen en verrijken", "PDF naar RAG-corpus", "Documenten herindexeren", "Publieke datakwaliteit"],
    useCaseHrefIncludes: {
      "Gegevens uitlezen en verrijken": "use-cases/document-intake-nl.html#output",
      "PDF naar RAG-corpus": "use-cases/pdf-to-rag-corpus-nl.html",
      "Documenten herindexeren": "use-cases/document-reindexing-nl.html",
      "Publieke datakwaliteit": "use-cases/public-data-quality-nl.html",
      Documentintake: "use-cases/document-intake-nl.html",
    },
    footer: ["Over", "Connectors", "Privacy", "Juridisch", "llms.txt", "AI brief", "Pricing YAML", "hello@solvyr.com", "Test bespreken"],
    footerHrefIncludes: {
      Over: "about-nl.html",
      Connectors: "connectors-nl.html",
      Privacy: "privacy-nl.html",
      Juridisch: "legal-nl.html",
      "llms.txt": "llms.txt",
      "AI brief": "ai/fast-corpus.md",
      "Pricing YAML": "pricing.yaml",
      "hello@solvyr.com": "mailto:hello@solvyr.com",
      "Test bespreken": "pilot-intake-nl.html",
    },
  },
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Download-bundle HTML is deliberately portable and does not carry the
      // website's global navigation or footer chrome.
      if ([".git", ".site-dist", "downloads", "measure", "v2"].includes(entry.name)) return [];
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

function dropdownFragment(fragment, className) {
  return fragment.match(new RegExp(`<details class="[^"]*${className}[^"]*"[\\s\\S]*?<div class="dropdownMenu">([\\s\\S]*?)<\\/div>[\\s\\S]*?<\\/details>`))?.[1] || "";
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
  const homeHref = lang === "nl" ? "/nl.html" : "/";
  for (const brand of ["brand", "footerBrand"]) {
    const tag = html.match(new RegExp(`<a\\b[^>]*class="${brand}"[^>]*>`))?.[0] || "";
    if (!tag.includes(`href="${homeHref}"`) || !/aria-label="[^"]+"/.test(tag)) {
      failures.push(`${relPath}: ${brand} must link to its language homepage with an accessible name`);
    }
  }
  if (!html.includes('src="/navigation.js?v=20261106-1" defer')) {
    failures.push(`${relPath}: missing shared navigation behavior`);
  }
  const nav = html.match(/<nav class="tabs"[\s\S]*?<\/nav>/);
  const footer = html.match(/<div class="footerLinks">([\s\S]*?)<\/div>/);

  if (!nav) {
    failures.push(`${relPath} nav: missing .tabs`);
  } else {
    const result = compare(relPath, "nav", primaryNavLabels(nav[0]), expected[lang].nav);
    if (result) failures.push(result);
    const documentLinks = links(nav[0]).filter((link) => /use-cases\/document-intake(?:-nl)?\.html$/.test(link.href));
    const documentLabel = lang === "nl" ? "Documentintake" : "Document intake";
    const documentHref = `/use-cases/document-intake${lang === "nl" ? "-nl" : ""}.html`;
    if (documentLinks.length !== 1 || documentLinks[0]?.label !== documentLabel || documentLinks[0]?.href !== documentHref || !/class="tab navDocument/.test(nav[0])) {
      failures.push(`${relPath} nav: document intake must appear once as the direct primary-product link`);
    }
    const corpusLinks = links(nav[0]).filter((link) => link.label === "Fast Corpus");
    const corpusHref = `/fast-corpus${lang === "nl" ? "-nl" : ""}.html`;
    if (corpusLinks.length !== 1 || corpusLinks[0]?.href !== corpusHref || !/class="tab navCorpus/.test(nav[0]) || /\bnavProduct\b/.test(nav[0])) {
      failures.push(`${relPath} nav: Fast Corpus must appear once as a direct product link, without a dropdown`);
    }
    const useCaseLinks = links(dropdownFragment(nav[0], "navUseCases"));
    const dropdownResult = compare(relPath, "use-case dropdown", useCaseLinks.map((link) => link.label), expected[lang].useCases);
    if (dropdownResult) failures.push(dropdownResult);
    for (const link of useCaseLinks) {
      const required = expected[lang].useCaseHrefIncludes[link.label];
      if (required && !link.href.includes(required)) {
        failures.push(`${relPath} use-case href for ${link.label}: expected to include ${required}, got ${link.href}`);
      }
    }
  }

  if (relPath === "fast-corpus.html" || relPath === "fast-corpus-nl.html") {
    if ([...html.matchAll(/<h1\b/g)].length !== 1 || /data-page=|data-tab-target=|setActivePage/.test(html)) {
      failures.push(`${relPath}: Fast Corpus must be one continuous page with one H1 and no tab controller`);
    }
    for (const section of ["overview", "who", "deliver", "security", "pilot"]) {
      if (!html.includes(`id="${section}"`) || !html.includes(`id="${section}-panel"`)) {
        failures.push(`${relPath}: missing native legacy anchor or panel ID for ${section}`);
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
        (link) => link.href.includes("pilot-intake") && /\b(?:Discuss|Bespreek)\b/.test(link.label)
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

const styles = readFileSync(join(repoRoot, "styles.css"), "utf8");
if (/\.tabs:has\(\.navDropdown\[open\]\)[^{]*\{[^}]*display:\s*none/.test(styles)) {
  failures.push("styles.css mobile nav: opening a menu must not hide or move sibling controls");
}
if (!styles.includes("--nav-control-height: 44px") || !styles.includes("grid-template-columns: repeat(4, minmax(0, 1fr))")) {
  failures.push("styles.css mobile nav: shared control height and fixed grid are missing");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Navigation and footer labels are consistent.");
