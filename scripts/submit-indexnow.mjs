#!/usr/bin/env node

import https from "node:https";
import { readFileSync } from "node:fs";

const host = "solvyr.com";
const key = "044c86eeeacfff6d818b9be1035d5d685450d37abdbdc6f7a20c99fb8f6da16d";
const endpoint = "https://api.indexnow.org/indexnow";

const defaultUrls = [
  "https://solvyr.com/",
  "https://solvyr.com/nl.html",
  "https://solvyr.com/use-cases/document-intake.html",
  "https://solvyr.com/use-cases/document-intake-nl.html",
  "https://solvyr.com/fast-corpus.html",
  "https://solvyr.com/fast-corpus-nl.html",
  "https://solvyr.com/llms.txt",
  "https://solvyr.com/ai/fast-corpus.md",
  "https://solvyr.com/ai/fast-corpus.json",
  "https://solvyr.com/capabilities.yaml",
  "https://solvyr.com/pricing.yaml"
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urls = args.filter((arg) => arg !== "--dry-run");
const urlList = [...new Set(urls.length ? urls : defaultUrls)];
const sitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
const canonicalUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
for (const url of urlList) {
  if (!canonicalUrls.has(url)) throw new Error(`Only exact canonical sitemap URLs may be submitted: ${url}`);
}

if (dryRun) {
  console.log(`Dry run: ${urlList.length} canonical URL(s); no network requests.\n${urlList.join("\n")}`);
  process.exit(0);
}

// This verification key is intentionally public and already ships at the site root.
const keyResponse = await fetch(`https://${host}/${key}.txt`, { signal: AbortSignal.timeout(15000) });
if (keyResponse.status !== 200 || (await keyResponse.text()).trim() !== key) {
  throw new Error("The live IndexNow verification file is unavailable or does not match; nothing submitted.");
}

const body = JSON.stringify({
  host,
  key,
  urlList
});

const response = await new Promise((resolve, reject) => {
  const request = https.request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-length": Buffer.byteLength(body)
    }
  }, (res) => {
    let responseBody = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      responseBody += chunk;
    });
    res.on("end", () => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        body: responseBody
      });
    });
  });

  request.setTimeout(20000, () => request.destroy(new Error("IndexNow submission timed out")));
  request.on("error", reject);
  request.end(body);
});

if (!response.ok) {
  throw new Error(
    `IndexNow submission failed: ${response.statusCode} ${response.statusMessage}\n${response.body}`
  );
}

console.log(`IndexNow received ${urlList.length} URL(s): HTTP ${response.statusCode} ${response.statusMessage}. This confirms receipt, not indexing.`);
