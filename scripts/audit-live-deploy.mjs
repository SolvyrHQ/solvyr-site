import { get as httpsGet } from "node:https";

const origin = "https://solvyr.com";
const maxUrls = 40;
const timeoutMs = 10000;

async function get(url) {
  const parsed = new URL(url);
  if (parsed.origin !== origin) {
    throw new Error(`Refusing to fetch non-Solvyr URL: ${url}`);
  }

  return new Promise((resolve, reject) => {
    const request = httpsGet(url, (response) => {
      const status = response.statusCode || 0;
      const redirect = response.headers.location;

      if (status >= 300 && status < 400 && redirect) {
        const nextUrl = new URL(redirect, url).toString();
        if (new URL(nextUrl).origin !== origin) {
          reject(new Error(`Refusing redirected non-Solvyr URL: ${url} -> ${nextUrl}`));
          return;
        }
        response.resume();
        get(nextUrl).then(resolve, reject);
        return;
      }

      const chunks = [];
      response.setEncoding("utf8");
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          headers: response.headers,
          status,
          url,
          text: async () => chunks.join(""),
        });
      });
    });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Timed out fetching ${url}`));
    });
    request.on("error", reject);
  });
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function canonical(html) {
  return html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] || "";
}

function metaContent(html, key, value) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  for (const tag of tags) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/\s([a-zA-Z:-]+)="([^"]*)"/g)].map((match) => [match[1].toLowerCase(), match[2]])
    );
    if (attributes[key] === value) return attributes.content || "";
  }
  return "";
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

const robots = await get(`${origin}/robots.txt`);
if (robots.status !== 200) failures.push(`robots.txt: expected 200, got ${robots.status}`);
const robotsText = await robots.text();
if (!robotsText.includes(`Sitemap: ${origin}/sitemap.xml`)) failures.push("robots.txt: missing sitemap reference");
if (!/Content-signal:\s*search=yes,\s*ai-input=yes,\s*ai-train=no/i.test(robotsText)) {
  failures.push("robots.txt: missing GEO content signals");
}
for (const userAgent of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]) {
  if (!/Allow:\s*\/\s*(?:\n|$)/i.test(robotsBlock(robotsText, userAgent))) {
    failures.push(`robots.txt: ${userAgent} is not explicitly allowed`);
  }
}
for (const userAgent of ["GPTBot", "ClaudeBot"]) {
  if (!/Disallow:\s*\/\s*(?:\n|$)/i.test(robotsBlock(robotsText, userAgent))) {
    failures.push(`robots.txt: ${userAgent} is not blocked`);
  }
}
const googleExtendedBlock = robotsBlock(robotsText, "Google-Extended");
for (const path of ["/llms.txt", "/ai/", "/capabilities.yaml", "/pricing.yaml"]) {
  if (!googleExtendedBlock.includes(`Allow: ${path}`)) {
    failures.push(`robots.txt: Google-Extended missing ${path}`);
  }
}
if (!/Disallow:\s*\/\s*(?:\n|$)/i.test(googleExtendedBlock)) {
  failures.push("robots.txt: Google-Extended is not bounded to the curated agent packet");
}

const sitemap = await get(`${origin}/sitemap.xml`);
if (sitemap.status !== 200) failures.push(`sitemap.xml: expected 200, got ${sitemap.status}`);
const sitemapText = await sitemap.text();
const urls = locs(sitemapText);
if (!urls.length) failures.push("sitemap.xml: no URLs found");
if (new Set(urls).size !== urls.length) failures.push("sitemap.xml: contains duplicate URLs");
if (urls.length > maxUrls) failures.push(`sitemap.xml: ${urls.length} URLs exceed live audit limit ${maxUrls}`);
for (const url of urls) {
  if (new URL(url).origin !== origin) failures.push(`sitemap.xml: non-Solvyr URL ${url}`);
}

const missingPage = await get(`${origin}/__solvyr-indexability-probe-not-found__`);
if (missingPage.status !== 404) {
  failures.push(`unknown route: expected hard 404, got ${missingPage.status}`);
}

let datasetCount = 0;

for (const url of urls.slice(0, maxUrls)) {
  const response = await get(url);
  if (response.status !== 200) {
    failures.push(`${url}: expected 200, got ${response.status}`);
    continue;
  }

  if (url.endsWith(".html") || url === `${origin}/`) {
    const html = await response.text();
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || "";
    const declaredCanonical = canonical(html);
    if (!title) failures.push(`${url}: live HTML is missing title`);
    if (!metaContent(html, "name", "description")) failures.push(`${url}: live HTML is missing meta description`);
    if (!metaContent(html, "property", "og:title")) failures.push(`${url}: live HTML is missing og:title`);
    if (!metaContent(html, "property", "og:description")) failures.push(`${url}: live HTML is missing og:description`);
    if (declaredCanonical !== url) {
      failures.push(`${url}: live canonical expected ${url}, got ${declaredCanonical || "none"}`);
    }
    if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) {
      failures.push(`${url}: live HTML contains noindex`);
    }
    if (/\bnoindex\b/i.test(String(response.headers["x-robots-tag"] || ""))) {
      failures.push(`${url}: live response has a noindex X-Robots-Tag`);
    }
    if (/href="\/cdn-cgi\/l\/email-protection/i.test(html)) {
      failures.push(`${url}: Cloudflare rewrote a public contact link into a crawlable /cdn-cgi URL`);
    }

    const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const [index, block] of blocks.entries()) {
      let data;
      try {
        data = JSON.parse(block[1]);
      } catch (error) {
        failures.push(`${url}: JSON-LD block ${index + 1} is invalid JSON (${error.message})`);
        continue;
      }

      for (const dataset of collectTypedItems(data, "Dataset")) {
        datasetCount += 1;
        if (typeof dataset.name !== "string" || !dataset.name.trim()) {
          failures.push(`${url}: Dataset is missing name`);
        }
        if (
          typeof dataset.description !== "string" ||
          dataset.description.trim().length < 50 ||
          dataset.description.trim().length > 5000
        ) {
          failures.push(`${url}: Dataset description must contain 50–5000 characters`);
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
          failures.push(`${url}: Dataset is missing creator`);
        }
        if (typeof dataset.license !== "string" || !/^https:\/\//.test(dataset.license)) {
          failures.push(`${url}: Dataset license must be an HTTPS URL`);
        }
      }
    }
  }
}

if (datasetCount === 0) failures.push("No live Dataset structured data was found");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Live deploy basics passed for ${urls.length} sitemap URLs.`);
