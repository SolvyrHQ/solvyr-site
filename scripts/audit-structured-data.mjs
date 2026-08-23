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

for (const file of walk(repoRoot).sort()) {
  const relPath = relative(repoRoot, file);
  const html = readFileSync(file, "utf8");
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const [index, block] of blocks.entries()) {
    let data;
    try {
      data = JSON.parse(block[1]);
    } catch (error) {
      failures.push(`${relPath}: JSON-LD block ${index + 1} is invalid JSON (${error.message})`);
      continue;
    }

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
}

if (datasetCount === 0) {
  failures.push("No Dataset structured data was found");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Structured data is valid and Dataset fields match Google guidance.");
