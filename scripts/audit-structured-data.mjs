import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", ".site-dist", "measure", "v2"].includes(entry.name)) return [];
      return walk(path);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function collectTypedItems(value, type, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectTypedItems(item, type, found);
    return found;
  }

  if (!value || typeof value !== "object") return found;

  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  if (types.includes(type)) found.push(value);

  for (const nested of Object.values(value)) collectTypedItems(nested, type, found);
  return found;
}

const failures = [];
let datasetCount = 0;
const productPages = new Set([
  "fast-corpus.html", "fast-corpus-nl.html",
  "use-cases/document-intake.html", "use-cases/document-intake-nl.html",
]);

for (const file of walk(repoRoot).sort()) {
  const relPath = relative(repoRoot, file);
  const html = readFileSync(file, "utf8");
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const items = [];

  for (const [index, block] of blocks.entries()) {
    let data;
    try {
      data = JSON.parse(block[1]);
    } catch (error) {
      failures.push(`${relPath}: JSON-LD block ${index + 1} is invalid JSON (${error.message})`);
      continue;
    }
    items.push(data);

    for (const dataset of collectTypedItems(data, "Dataset")) {
      datasetCount += 1;
      if (typeof dataset.name !== "string" || !dataset.name.trim()) {
        failures.push(`${relPath}: Dataset is missing name`);
      }
      if (
        typeof dataset.description !== "string" ||
        dataset.description.trim().length < 50 ||
        dataset.description.trim().length > 5000
      ) {
        failures.push(`${relPath}: Dataset description must contain 50–5000 characters`);
      }
      const creators = Array.isArray(dataset.creator) ? dataset.creator : [dataset.creator];
      if (
        creators.some(
          (creator) =>
            !creator ||
            typeof creator !== "object" ||
            !["Organization", "Person"].includes(creator["@type"]) ||
            typeof creator.name !== "string" ||
            !creator.name.trim()
        )
      ) {
        failures.push(`${relPath}: Dataset is missing creator`);
      }
      if (typeof dataset.license !== "string" || !/^https:\/\//.test(dataset.license)) {
        failures.push(`${relPath}: Dataset license must be an HTTPS URL`);
      }
    }
  }

  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  if (productPages.has(relPath)) {
    const services = collectTypedItems(items, "Service");
    const pages = collectTypedItems(items, "WebPage");
    if (services.length !== 1 || pages.length !== 1) {
      failures.push(`${relPath}: expected one localized Service and WebPage`);
    } else {
      const service = services[0];
      const page = pages[0];
      const lang = html.match(/<html\b[^>]*lang="([^"]+)"/)?.[1];
      if (service.url !== canonical || page.url !== canonical || page.inLanguage !== lang || page.mainEntity?.["@id"] !== service["@id"]) {
        failures.push(`${relPath}: Service/WebPage does not match its canonical URL, language or main entity`);
      }
      if (service.provider?.["@id"] !== "https://solvyr.com/#organization") {
        failures.push(`${relPath}: Service provider must identify the canonical Solvyr organization`);
      }
      if (relPath.startsWith("use-cases/document-intake") && service.offers) {
        failures.push(`${relPath}: document intake must not inherit Fast Corpus page-based pricing`);
      }
    }
  }
  if (["index.html", "nl.html"].includes(relPath)) {
    const websites = collectTypedItems(items, "WebSite");
    const organizations = collectTypedItems(items, "Organization");
    if (websites.length !== 1 || websites[0].url !== "https://solvyr.com/" || websites[0].name !== "Solvyr" || organizations[0]?.["@id"] !== "https://solvyr.com/#organization") {
      failures.push(`${relPath}: missing canonical Solvyr WebSite/Organization identity`);
    }
  }
}

if (datasetCount === 0) {
  failures.push("No Dataset structured data was found");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Structured data passed: canonical site identity, bilingual product services, and required Dataset fields.");
