import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const siteOrigin = "https://solvyr.com";
const requiredSitemapFiles = [
  "llms.txt",
  "ai/fast-corpus.md",
  "ai/fast-corpus.json",
  "capabilities.yaml",
  "pricing.yaml",
];

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

function firstTagAttrs(html, tagName, predicate) {
  for (const tag of tags(html, tagName)) {
    const parsed = attrs(tag);
    if (!predicate || predicate(parsed)) return parsed;
  }
  return null;
}

function metaContent(html, key, value) {
  return firstTagAttrs(html, "meta", (attr) => attr[key] === value)?.content || "";
}

function htmlTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() || "";
}

function expectedUrl(relPath) {
  return relPath === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${relPath}`;
}

function languageFor(relPath) {
  return relPath === "nl.html" || relPath.endsWith("-nl.html") ? "nl" : "en";
}

function localTargetExists(fromFile, href) {
  if (/^(https?:|mailto:|javascript:)/.test(href) || href.startsWith("#")) return true;

  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) return true;

  const target = cleanHref.startsWith("/")
    ? resolve(repoRoot, cleanHref.slice(1) || "index.html")
    : resolve(dirname(fromFile), cleanHref);

  return existsSync(target);
}

function sitemapUrls() {
  const sitemap = readFileSync(join(repoRoot, "sitemap.xml"), "utf8");
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function sitemapPathExists(url) {
  if (!url.startsWith(`${siteOrigin}/`)) return false;
  const pathname = new URL(url).pathname;
  if (pathname === "/") return existsSync(join(repoRoot, "index.html"));
  return existsSync(join(repoRoot, pathname.slice(1)));
}

function htmlAlternates(html) {
  return Object.fromEntries(
    tags(html, "link")
      .map(attrs)
      .filter((attr) => attr.rel === "alternate" && attr.hreflang && attr.href)
      .map((attr) => [attr.hreflang, attr.href])
  );
}

function localizedPartner(relPath) {
  if (relPath === "index.html") return { en: "index.html", nl: "nl.html" };
  if (relPath === "nl.html") return { en: "index.html", nl: "nl.html" };
  if (relPath.endsWith("-nl.html")) {
    const en = relPath.replace(/-nl\.html$/, ".html");
    return existsSync(join(repoRoot, en)) ? { en, nl: relPath } : null;
  }
  const nl = relPath.replace(/\.html$/, "-nl.html");
  return existsSync(join(repoRoot, nl)) ? { en: relPath, nl } : null;
}

function robotsBlock(text, userAgent) {
  const escaped = userAgent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    text.match(
      new RegExp(
        `(?:^|\\n)User-agent:\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\nUser-agent:|\\nSitemap:|$)`,
        "i"
      )
    )?.[1] || ""
  );
}

const failures = [];
const htmlFiles = walk(repoRoot).sort();
const sitemap = sitemapUrls();
const sitemapSet = new Set(sitemap);
const robots = readFileSync(join(repoRoot, "robots.txt"), "utf8");

if (!robots.includes("Sitemap: https://solvyr.com/sitemap.xml")) {
  failures.push("robots.txt: missing canonical sitemap URL");
}

const starBlock = robots.match(/User-agent:\s*\*([\s\S]*?)(?=\nUser-agent:|\s*$)/i)?.[1] || "";
if (/Disallow:\s*\/\s*(?:\n|$)/i.test(starBlock)) {
  failures.push("robots.txt: User-agent * blocks /");
}
if (!/Content-signal:\s*search=yes,\s*ai-input=yes,\s*ai-train=no/i.test(starBlock)) {
  failures.push("robots.txt: expected search=yes, ai-input=yes, ai-train=no content signals");
}

for (const userAgent of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]) {
  const block = robotsBlock(robots, userAgent);
  if (!/Allow:\s*\/\s*(?:\n|$)/i.test(block)) {
    failures.push(`robots.txt: ${userAgent} should be allowed for answer-engine discovery`);
  }
  if (/Disallow:\s*\/\s*(?:\n|$)/i.test(block)) {
    failures.push(`robots.txt: ${userAgent} unexpectedly blocks /`);
  }
}

for (const userAgent of ["GPTBot", "ClaudeBot"]) {
  const block = robotsBlock(robots, userAgent);
  if (!/Disallow:\s*\/\s*(?:\n|$)/i.test(block)) {
    failures.push(`robots.txt: ${userAgent} should remain blocked as a training crawler`);
  }
}

const googleExtendedBlock = robotsBlock(robots, "Google-Extended");
for (const path of ["/llms.txt", "/ai/", "/capabilities.yaml", "/pricing.yaml"]) {
  if (!googleExtendedBlock.includes(`Allow: ${path}`)) {
    failures.push(`robots.txt: Google-Extended missing curated allow path ${path}`);
  }
}
if (!/Disallow:\s*\/\s*(?:\n|$)/i.test(googleExtendedBlock)) {
  failures.push("robots.txt: Google-Extended should remain blocked outside the curated agent packet");
}

for (const url of sitemap) {
  if (!url.startsWith(`${siteOrigin}/`)) {
    failures.push(`sitemap.xml: non-canonical origin ${url}`);
  }
  if (!sitemapPathExists(url)) {
    failures.push(`sitemap.xml: listed URL has no matching local file ${url}`);
  }
}

for (const file of requiredSitemapFiles) {
  const url = `${siteOrigin}/${file}`;
  if (!sitemapSet.has(url)) {
    failures.push(`sitemap.xml: missing ${url}`);
  }
}

for (const file of htmlFiles) {
  const relPath = relative(repoRoot, file);
  const html = readFileSync(file, "utf8");
  const url = expectedUrl(relPath);
  const title = htmlTitle(html);
  const description = metaContent(html, "name", "description");
  const canonical = firstTagAttrs(html, "link", (attr) => attr.rel === "canonical")?.href || "";
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDescription = metaContent(html, "property", "og:description");
  const lang = firstTagAttrs(html, "html")?.lang || html.match(/<html\b[^>]*\slang="([^"]+)"/i)?.[1] || "";
  const robotsMeta = metaContent(html, "name", "robots").toLowerCase();

  if (!title) failures.push(`${relPath}: missing <title>`);
  if (!description) failures.push(`${relPath}: missing meta description`);
  if (!ogTitle) failures.push(`${relPath}: missing og:title`);
  if (!ogDescription) failures.push(`${relPath}: missing og:description`);
  if (canonical !== url) failures.push(`${relPath}: canonical expected ${url}, got ${canonical || "none"}`);
  if (lang !== languageFor(relPath)) failures.push(`${relPath}: html lang expected ${languageFor(relPath)}, got ${lang || "none"}`);
  if (robotsMeta.includes("noindex")) failures.push(`${relPath}: contains noindex robots meta`);
  if (!sitemapSet.has(url)) failures.push(`${relPath}: missing from sitemap.xml as ${url}`);

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    if (!localTargetExists(file, match[1])) {
      failures.push(`${relPath}: broken local href ${match[1]}`);
    }
  }

  const partner = localizedPartner(relPath);
  if (partner) {
    const alternates = htmlAlternates(html);
    const enUrl = expectedUrl(partner.en);
    const nlUrl = expectedUrl(partner.nl);
    if (alternates.en !== enUrl) failures.push(`${relPath}: hreflang en expected ${enUrl}, got ${alternates.en || "none"}`);
    if (alternates.nl !== nlUrl) failures.push(`${relPath}: hreflang nl expected ${nlUrl}, got ${alternates.nl || "none"}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Indexability basics are consistent.");
