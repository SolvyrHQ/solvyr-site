#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const [sourceDirArg, runDirArg] = process.argv.slice(2);

if (!sourceDirArg || !runDirArg) {
  console.error("Usage: node scripts/prepare-gitignore-public-sample.mjs <source-dir> <run-dir>");
  process.exit(2);
}

const sourceDir = path.resolve(sourceDirArg);
const runDir = path.resolve(runDirArg);
const sourceOutputDir = path.join(runDir, "input", "sources");
const rawDir = path.join(runDir, "raw_evidence");
const manifestDir = path.join(runDir, "input");

const chunkSizeChars = 6000;
const chunkOverlapChars = 500;

const sources = [
  {
    id: "python_gitignore",
    fileName: "Python.gitignore",
    title: "Python .gitignore template",
    url: "https://github.com/github/gitignore/blob/57286c3887203259752b747db94e6c3ad10ec53d/Python.gitignore",
    published: "commit 57286c3887203259752b747db94e6c3ad10ec53d",
    sha256: "b2580eab7825b9f22f790fb0edb7a6e239616e79907004adf36023c7ec4b9a4c",
    rightsBasis: "GitHub gitignore repository, dedicated under CC0-1.0.",
  },
  {
    id: "node_gitignore",
    fileName: "Node.gitignore",
    title: "Node .gitignore template",
    url: "https://github.com/github/gitignore/blob/57286c3887203259752b747db94e6c3ad10ec53d/Node.gitignore",
    published: "commit 57286c3887203259752b747db94e6c3ad10ec53d",
    sha256: "ae3ac05cd16b0f6c4251fd30d74c12866d1ba6daa365aacc2e32ddfc09a478f6",
    rightsBasis: "GitHub gitignore repository, dedicated under CC0-1.0.",
  },
  {
    id: "visualstudio_gitignore",
    fileName: "VisualStudio.gitignore",
    title: "Visual Studio .gitignore template",
    url: "https://github.com/github/gitignore/blob/57286c3887203259752b747db94e6c3ad10ec53d/VisualStudio.gitignore",
    published: "commit 57286c3887203259752b747db94e6c3ad10ec53d",
    sha256: "cbed134c8bc8b85079dd45fbeeab58a54b8b93746c7dabca21d512982320987d",
    rightsBasis: "GitHub gitignore repository, dedicated under CC0-1.0.",
  },
];

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

await mkdir(sourceOutputDir, { recursive: true });
await mkdir(rawDir, { recursive: true });
await mkdir(manifestDir, { recursive: true });

const preparedRows = [];
const manifestRows = [];

for (const source of sources) {
  const sourcePath = path.join(sourceDir, source.fileName);
  const raw = await readFile(sourcePath);
  const actualSourceSha256 = sha256(raw);
  if (actualSourceSha256 !== source.sha256) {
    throw new Error(`Pinned source snapshot changed: ${source.fileName} (${actualSourceSha256} != ${source.sha256})`);
  }
  const text = raw.toString("utf8");
  const copiedPath = path.join(sourceOutputDir, source.fileName);
  await copyFile(sourcePath, copiedPath);

  let start = 0;
  let chunkIndex = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSizeChars, text.length);
    const id = `${source.id}__chars_${String(start).padStart(6, "0")}_${String(end).padStart(6, "0")}`;
    preparedRows.push({
      id,
      text: text.slice(start, end),
    });
    chunkIndex += 1;
    if (end === text.length) break;
    start = end - chunkOverlapChars;
  }

  manifestRows.push({
    source_document_id: source.id,
    source_file_name: source.fileName,
    title: source.title,
    source_url: source.url,
    source_media_type: "text/plain; charset=utf-8",
    source_published: source.published,
    publishability_basis: source.rightsBasis,
    source_sha256: actualSourceSha256,
    source_bytes: raw.length,
    extracted_character_count: text.length,
    chunk_count: chunkIndex,
    extraction_method: "UTF-8 decode with Node.js standard library",
  });
}

const preparedText = preparedRows
  .map((row) => JSON.stringify(row))
  .join("\n") + "\n";
await writeFile(path.join(rawDir, "prepared_input.jsonl"), preparedText, "utf8");

const fields = Object.keys(manifestRows[0]);
const manifestText = [
  fields.join(","),
  ...manifestRows.map((row) => fields.map((field) => csvCell(row[field])).join(",")),
].join("\n") + "\n";
await writeFile(path.join(manifestDir, "source_manifest.csv"), manifestText, "utf8");

const licenseBytes = await readFile(path.join(sourceDir, "LICENSE"));
const expectedLicenseSha256 = "36ffd9dc085d529a7e60e1276d73ae5a030b020313e6c5408593a6ae2af39673";
if (sha256(licenseBytes) !== expectedLicenseSha256) {
  throw new Error("Pinned CC0 license snapshot changed.");
}
await copyFile(path.join(sourceDir, "LICENSE"), path.join(manifestDir, "SOURCE-LICENSE-CC0-1.0.txt"));

const metadata = {
  corpus_label: "WHAT GIT LEAVES OUT",
  data_classification: "public CC0 .gitignore templates",
  source_document_count: sources.length,
  prepared_chunk_count: preparedRows.length,
  chunking_method: "fixed_character_windows",
  chunk_size_chars: chunkSizeChars,
  chunk_overlap_chars: chunkOverlapChars,
  prepared_input_sha256: sha256(Buffer.from(preparedText, "utf8")),
  source_manifest_sha256: sha256(Buffer.from(manifestText, "utf8")),
  source_license_sha256: expectedLicenseSha256,
};
await writeFile(
  path.join(rawDir, "preparation_metadata.json"),
  JSON.stringify(metadata, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(metadata, null, 2));
