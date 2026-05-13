#!/usr/bin/env node

const host = "solvyr.com";
const key = "044c86eeeacfff6d818b9be1035d5d685450d37abdbdc6f7a20c99fb8f6da16d";
const endpoint = "https://api.indexnow.org/indexnow";

const defaultUrls = [
  "https://solvyr.com/",
  "https://solvyr.com/about.html",
  "https://solvyr.com/connectors.html",
  "https://solvyr.com/use-cases/pdf-to-rag-corpus.html",
  "https://solvyr.com/use-cases/document-reindexing.html",
  "https://solvyr.com/proof/100-pdf-fast-corpus-run.html",
  "https://solvyr.com/sample-output.html",
  "https://solvyr.com/ai/fast-corpus.md",
  "https://solvyr.com/llms.txt"
];

const urls = process.argv.slice(2);
const urlList = urls.length ? urls : defaultUrls;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8"
  },
  body: JSON.stringify({
    host,
    key,
    urlList
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed: ${response.status} ${response.statusText}\n${body}`);
}

console.log(`Submitted ${urlList.length} URL(s) to IndexNow.`);
