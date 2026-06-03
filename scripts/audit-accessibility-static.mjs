import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

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

function attrs(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/\s([a-zA-Z:-]+)="([^"]*)"/g)].map((match) => [match[1].toLowerCase(), match[2]])
  );
}

function tags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function ids(html) {
  return [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
}

function labelTargets(html) {
  return new Set([...html.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map((match) => match[1]));
}

const failures = [];

for (const file of walk(repoRoot).sort()) {
  const relPath = relative(repoRoot, file);
  const html = readFileSync(file, "utf8");
  const htmlAttrs = attrs(html.match(/<html\b[^>]*>/i)?.[0] || "");
  const pageIds = ids(html);
  const seenIds = new Set();
  const labels = labelTargets(html);

  if (!htmlAttrs.lang) failures.push(`${relPath}: missing html lang`);
  if (!/<h1\b/i.test(html)) failures.push(`${relPath}: missing h1`);

  for (const id of pageIds) {
    if (seenIds.has(id)) failures.push(`${relPath}: duplicate id ${id}`);
    seenIds.add(id);
  }

  for (const img of tags(html, "img")) {
    const attr = attrs(img);
    if (!("alt" in attr)) failures.push(`${relPath}: img missing alt`);
  }

  for (const control of [...tags(html, "input"), ...tags(html, "select"), ...tags(html, "textarea")]) {
    const attr = attrs(control);
    if (attr.type === "hidden") continue;
    const hasAccessibleName = attr["aria-label"] || attr["aria-labelledby"] || (attr.id && labels.has(attr.id));
    if (!hasAccessibleName) {
      failures.push(`${relPath}: form control missing label or aria name near ${control.slice(0, 90)}`);
    }
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attr = attrs(`<a ${match[1]}>`);
    const name = stripTags(match[2]) || attr["aria-label"] || attr.title || "";
    if (!name) failures.push(`${relPath}: link missing accessible name`);
  }

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const attr = attrs(`<button ${match[1]}>`);
    const name = stripTags(match[2]) || attr["aria-label"] || attr.title || "";
    if (!name) failures.push(`${relPath}: button missing accessible name`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static accessibility basics are consistent.");
