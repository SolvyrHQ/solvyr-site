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

const failures = [];

const robots = await get(`${origin}/robots.txt`);
if (robots.status !== 200) failures.push(`robots.txt: expected 200, got ${robots.status}`);
const robotsText = await robots.text();
if (!robotsText.includes(`Sitemap: ${origin}/sitemap.xml`)) failures.push("robots.txt: missing sitemap reference");

const sitemap = await get(`${origin}/sitemap.xml`);
if (sitemap.status !== 200) failures.push(`sitemap.xml: expected 200, got ${sitemap.status}`);
const sitemapText = await sitemap.text();
const urls = locs(sitemapText);
if (!urls.length) failures.push("sitemap.xml: no URLs found");

for (const url of urls.slice(0, maxUrls)) {
  const response = await get(url);
  if (response.status !== 200) {
    failures.push(`${url}: expected 200, got ${response.status}`);
    continue;
  }

  if (url.endsWith(".html") || url === `${origin}/`) {
    const html = await response.text();
    const declaredCanonical = canonical(html);
    if (declaredCanonical !== url) {
      failures.push(`${url}: live canonical expected ${url}, got ${declaredCanonical || "none"}`);
    }
    if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) {
      failures.push(`${url}: live HTML contains noindex`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Live deploy basics passed for ${urls.length} sitemap URLs.`);
