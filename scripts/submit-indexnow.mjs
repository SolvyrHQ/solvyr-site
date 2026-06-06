#!/usr/bin/env node

import https from "node:https";

const host = "solvyr.com";
const key = "044c86eeeacfff6d818b9be1035d5d685450d37abdbdc6f7a20c99fb8f6da16d";
const endpoint = "https://api.indexnow.org/indexnow";

const defaultUrls = [
  "https://solvyr.com/",
  "https://solvyr.com/about.html",
  "https://solvyr.com/connectors.html",
  "https://solvyr.com/use-cases/pdf-to-rag-corpus.html",
  "https://solvyr.com/use-cases/pdf-to-rag-corpus-nl.html",
  "https://solvyr.com/use-cases/document-reindexing.html",
  "https://solvyr.com/use-cases/document-reindexing-nl.html",
  "https://solvyr.com/use-cases/public-data-quality.html",
  "https://solvyr.com/use-cases/public-data-quality-nl.html",
  "https://solvyr.com/proof/100-pdf-fast-corpus-run.html",
  "https://solvyr.com/sample-output.html",
  "https://solvyr.com/ai/fast-corpus.md",
  "https://solvyr.com/llms.txt"
];

const urls = process.argv.slice(2);
const urlList = urls.length ? urls : defaultUrls;

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

  request.on("error", reject);
  request.end(body);
});

if (!response.ok) {
  throw new Error(
    `IndexNow submission failed: ${response.statusCode} ${response.statusMessage}\n${response.body}`
  );
}

console.log(`Submitted ${urlList.length} URL(s) to IndexNow.`);
