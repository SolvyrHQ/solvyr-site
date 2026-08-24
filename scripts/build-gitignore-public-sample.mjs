#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const [runDirArg, bundleParentArg] = process.argv.slice(2);
if (!runDirArg) {
  console.error("Usage: node scripts/build-gitignore-public-sample.mjs <run-dir> [bundle-parent]");
  process.exit(2);
}

const runDir = path.resolve(runDirArg);
const rawDir = path.join(runDir, "raw_evidence");
const inputDir = path.join(runDir, "input");
const bundleDir = bundleParentArg
  ? path.join(path.resolve(bundleParentArg), "solvyr-fast-corpus-gitignore-sample-2026-08-24")
  : path.join(runDir, "public_bundle", "solvyr-fast-corpus-gitignore-sample-2026-08-24");
const bundleInputDir = path.join(bundleDir, "input");
const bundleSourceDir = path.join(bundleInputDir, "sources");
const deliverableDir = path.join(bundleDir, "deliverable");
const evidenceDir = path.join(bundleDir, "evidence");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const parseJsonl = (text) => text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const secondsBetween = (start, end) => (Date.parse(end) - Date.parse(start)) / 1000;
const htmlEscape = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...values] = rows;
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

async function listFiles(dir, prefix = "") {
  const results = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...await listFiles(absolute, relative));
    else results.push({ relative, absolute });
  }
  return results;
}

await rm(bundleDir, { recursive: true, force: true });
await mkdir(bundleSourceDir, { recursive: true });
await mkdir(deliverableDir, { recursive: true });
await mkdir(evidenceDir, { recursive: true });

const manifestText = await readFile(path.join(inputDir, "source_manifest.csv"), "utf8");
const manifest = parseCsv(manifestText);
const expectedSourceHashes = {
  python_gitignore: "b2580eab7825b9f22f790fb0edb7a6e239616e79907004adf36023c7ec4b9a4c",
  node_gitignore: "ae3ac05cd16b0f6c4251fd30d74c12866d1ba6daa365aacc2e32ddfc09a478f6",
  visualstudio_gitignore: "cbed134c8bc8b85079dd45fbeeab58a54b8b93746c7dabca21d512982320987d",
};
for (const source of manifest) {
  if (expectedSourceHashes[source.source_document_id] !== source.source_sha256) {
    throw new Error(`Unexpected source hash for ${source.source_document_id}`);
  }
}
const manifestById = new Map(manifest.map((row) => [row.source_document_id, row]));
const sourceTextById = new Map();
for (const source of manifest) {
  const sourceBytes = await readFile(path.join(inputDir, "sources", source.source_file_name));
  const actualHash = sha256(sourceBytes);
  if (actualHash !== source.source_sha256) {
    throw new Error(`Source snapshot does not match its manifest: ${source.source_file_name}`);
  }
  sourceTextById.set(source.source_document_id, sourceBytes.toString("utf8"));
}
const preparedText = await readFile(path.join(rawDir, "prepared_input.jsonl"), "utf8");
const prepared = parseJsonl(preparedText);
const rawResultBytes = await readFile(path.join(rawDir, "node_embeddings.json"));
const rawResult = JSON.parse(rawResultBytes.toString("utf8"));
const jobStatus = JSON.parse(await readFile(path.join(rawDir, "job_status_final.json"), "utf8"));
const preparation = JSON.parse(await readFile(path.join(rawDir, "preparation_metadata.json"), "utf8"));
const negativeResponse = JSON.parse(await readFile(path.join(rawDir, "negative_upload_response.json"), "utf8"));
const negativeStatus = Number(await readFile(path.join(rawDir, "negative_upload_status.txt"), "utf8"));
const sourceLicenseBytes = await readFile(path.join(inputDir, "SOURCE-LICENSE-CC0-1.0.txt"));
if (sha256(sourceLicenseBytes) !== "36ffd9dc085d529a7e60e1276d73ae5a030b020313e6c5408593a6ae2af39673") {
  throw new Error("Pinned CC0 license snapshot changed.");
}
if (negativeStatus !== 400) throw new Error(`Expected negative control HTTP 400, received ${negativeStatus}.`);
if (jobStatus.status !== "completed" || jobStatus.task_counts.succeeded !== 1
  || jobStatus.task_counts.permanently_failed !== 0 || jobStatus.retry_count_total !== 0) {
  throw new Error("Expected one completed scheduler task with no permanent failures or retries.");
}

const outputById = new Map(rawResult.items.map((item) => [item.record_id, item]));
const inputIds = prepared.map((row) => row.id);
const outputIds = rawResult.items.map((item) => item.record_id);

if (prepared.length !== 4 || rawResult.record_count !== 4 || rawResult.items.length !== 4) {
  throw new Error("Expected exactly four prepared and returned records.");
}
if (new Set(inputIds).size !== inputIds.length || new Set(outputIds).size !== outputIds.length) {
  throw new Error("Input and output IDs must be unique.");
}
if (inputIds.some((id) => !outputById.has(id))) {
  throw new Error("Every input ID must have one returned item.");
}
if (rawResult.items.some((item) => item.status !== "ok" || item.error !== null)) {
  throw new Error("Every returned item must be successful for this public sample.");
}

const corpusRecords = prepared.map((inputRow) => {
  const match = inputRow.id.match(/^([a-z_]+)__chars_(\d{6})_(\d{6})$/);
  if (!match) throw new Error(`Unexpected record ID: ${inputRow.id}`);
  const [, sourceId, startText, endText] = match;
  const source = manifestById.get(sourceId);
  const returned = outputById.get(inputRow.id);
  if (!source || !returned) throw new Error(`Missing source or output for ${inputRow.id}`);
  if (sourceTextById.get(sourceId).slice(Number(startText), Number(endText)) !== inputRow.text) {
    throw new Error(`Prepared text is not the stated exact source slice: ${inputRow.id}`);
  }
  return {
    schema_version: "solvyr_corpus_record_v1",
    record_id: inputRow.id,
    source_document_id: sourceId,
    source_file_name: source.source_file_name,
    source_title: source.title,
    source_url: source.source_url,
    source_sha256: source.source_sha256,
    chunk_index: prepared.filter((row) => row.id.startsWith(`${sourceId}__`)).findIndex((row) => row.id === inputRow.id),
    char_start: Number(startText),
    char_end: Number(endText),
    text: inputRow.text,
    text_sha256: sha256(Buffer.from(inputRow.text, "utf8")),
    status: returned.status,
    error: returned.error,
    embedding_model: returned.model,
    embedding_dimensions: returned.embedding.length,
    embedding: returned.embedding,
  };
});

const corpusText = corpusRecords.map((record) => JSON.stringify(record)).join("\n") + "\n";
await writeFile(path.join(deliverableDir, "corpus.jsonl"), corpusText, "utf8");

const previewFields = [
  "record_id", "source_title", "char_start", "char_end", "character_count",
  "text_preview", "status", "embedding_model", "embedding_dimensions", "embedding_preview",
];
const previewRows = corpusRecords.map((record) => ({
  record_id: record.record_id,
  source_title: record.source_title,
  char_start: record.char_start,
  char_end: record.char_end,
  character_count: record.text.length,
  text_preview: record.text.replace(/\s+/g, " ").trim().slice(0, 240),
  status: record.status,
  embedding_model: record.embedding_model,
  embedding_dimensions: record.embedding_dimensions,
  embedding_preview: JSON.stringify(record.embedding.slice(0, 6)),
}));
const previewText = [
  previewFields.join(","),
  ...previewRows.map((row) => previewFields.map((field) => csvCell(row[field])).join(",")),
].join("\n") + "\n";
await writeFile(path.join(deliverableDir, "corpus-preview.csv"), previewText, "utf8");

const schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  title: "Solvyr corpus record v1",
  type: "object",
  additionalProperties: false,
  required: Object.keys(corpusRecords[0]),
  properties: {
    schema_version: { const: "solvyr_corpus_record_v1" },
    record_id: { type: "string" },
    source_document_id: { type: "string" },
    source_file_name: { type: "string" },
    source_title: { type: "string" },
    source_url: { type: "string", format: "uri" },
    source_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
    chunk_index: { type: "integer", minimum: 0 },
    char_start: { type: "integer", minimum: 0 },
    char_end: { type: "integer", minimum: 1 },
    text: { type: "string", minLength: 1 },
    text_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
    status: { const: "ok" },
    error: { type: "null" },
    embedding_model: { type: "string" },
    embedding_dimensions: { const: 4096 },
    embedding: { type: "array", minItems: 4096, maxItems: 4096, items: { type: "number" } },
  },
};
await writeFile(path.join(deliverableDir, "schema.json"), JSON.stringify(schema, null, 2) + "\n", "utf8");

const returnedFields = ["task_id", "record_id", "status", "embedding", "error", "model"];
const returnedItems = rawResult.items.map((item) => Object.fromEntries(returnedFields.map((field) => [field, item[field]])));
const returnedItemsText = returnedItems.map((item) => JSON.stringify(item)).join("\n") + "\n";
await writeFile(path.join(evidenceDir, "returned-items.jsonl"), returnedItemsText, "utf8");
await writeFile(path.join(evidenceDir, "failures.jsonl"), "", "utf8");

const sourceCounts = Object.fromEntries(manifest.map((source) => [
  source.source_document_id,
  corpusRecords.filter((record) => record.source_document_id === source.source_document_id).length,
]));
const report = {
  evidence_label: "public_sample",
  evidence_category: "single bounded test-scheduler run",
  corpus_label: preparation.corpus_label,
  data_classification: preparation.data_classification,
  run_date_local: "2026-08-24 Europe/Amsterdam",
  workload_type: "embeddings",
  input_format: "jsonl_text_v1",
  deliverable_format: "solvyr_corpus_record_v1 JSONL",
  observed_facts: {
    source_document_count: manifest.length,
    prepared_chunk_count: prepared.length,
    completed_item_count: rawResult.items.filter((item) => item.status === "ok").length,
    failed_item_count: rawResult.items.filter((item) => item.status !== "ok").length,
    scheduler_tasks_succeeded: jobStatus.task_counts.succeeded,
    scheduler_tasks_permanently_failed: jobStatus.task_counts.permanently_failed,
    scheduler_retry_count: jobStatus.retry_count_total,
    model_label: rawResult.model,
    embedding_dimensions: [...new Set(rawResult.items.map((item) => item.embedding.length))][0],
    chunking_method: preparation.chunking_method,
    chunk_size_chars: preparation.chunk_size_chars,
    chunk_overlap_chars: preparation.chunk_overlap_chars,
    submission_to_completion_wall_clock_seconds: secondsBetween(jobStatus.submitted_at, jobStatus.completed_at),
    execution_wall_clock_seconds: secondsBetween(jobStatus.started_at, jobStatus.completed_at),
    negative_path: {
      case: "one JSONL row with an ID but no text",
      http_status: negativeStatus,
      work_created: false,
      response_detail: negativeResponse.detail,
    },
  },
  reconciliation: {
    prepared_input_sha256: preparation.prepared_input_sha256,
    downloaded_input_sha256: sha256(await readFile(path.join(rawDir, "downloaded_input.jsonl"))),
    input_download_hash_match: preparation.prepared_input_sha256 === sha256(await readFile(path.join(rawDir, "downloaded_input.jsonl")),),
    source_manifest_sha256: preparation.source_manifest_sha256,
    public_returned_items_sha256: sha256(Buffer.from(returnedItemsText, "utf8")),
    customer_corpus_sha256: sha256(Buffer.from(corpusText, "utf8")),
    input_output_identity_match: inputIds.every((id, index) => id === outputIds[index]),
    unique_input_ids: new Set(inputIds).size,
    unique_output_ids: new Set(outputIds).size,
    source_output_counts: sourceCounts,
  },
  derivation: {
    customer_corpus: "Deterministic join of the exact submitted text rows and returned embedding items on record_id.",
    returned_items: "Customer-relevant item-field projection of the actual pipeline result; embedding numeric values are preserved.",
    preview_csv: "Derived from corpus.jsonl; text is shortened and embeddings are limited to the first six values for readability.",
  },
  unavailable_or_withheld: {
    model_digest: "not returned by the supported API artifact",
    retention_duration: "retention_until was null; no duration is inferred",
    exact_test_build_and_job_identifier: "retained in the private QA evidence",
    private_node_telemetry: "withheld from the public bundle",
  },
  claim_boundary: "This tiny plain-text run demonstrates preparation, stable chunk identity, bounded scheduling, embedding generation, result retrieval, input validation, and a usable joined corpus artifact. It is not a PDF/OCR, retrieval-quality, scale, distributed-performance, cost, security, or SLA benchmark.",
};
await writeFile(path.join(evidenceDir, "run-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

await writeFile(path.join(bundleInputDir, "source-manifest.csv"), manifestText, "utf8");
for (const source of manifest) {
  await copyFile(path.join(inputDir, "sources", source.source_file_name), path.join(bundleSourceDir, source.source_file_name));
}

const licenseNotice = `# Source and redistribution notice

This package uses exact snapshots of GitHub's official Python, Node, and
Visual Studio .gitignore templates at commit
57286c3887203259752b747db94e6c3ad10ec53d.

The github/gitignore repository dedicates these templates under CC0-1.0:
https://github.com/github/gitignore

The exact CC0-1.0 legal text from that pinned commit is included as
\`SOURCE-LICENSE-CC0-1.0.txt\`. CC0 permits copying, modification,
distribution, and use without asking permission. Attribution is not required;
the source and immutable commit are nevertheless recorded for provenance and
independent verification.

No customer data, private Solvyr data, credentials, or private runtime details
are included.
`;
await writeFile(path.join(bundleDir, "SOURCE-NOTICE.md"), licenseNotice, "utf8");
await writeFile(path.join(bundleDir, "SOURCE-LICENSE-CC0-1.0.txt"), sourceLicenseBytes);

const readme = `# Solvyr Fast Corpus — WHAT GIT LEAVES OUT

Start with \`START-HERE.html\` for the readable result.

This is a completed, bounded Fast Corpus sample over three files engineers
recognize immediately: GitHub's official Python, Node, and Visual Studio
.gitignore templates. The pinned source repository dedicates them under CC0.

## Result

- 3 exact public source templates
- 4 prepared text chunks
- 4 completed embedding records
- 4,096 values per embedding
- 0 failed items
- 0 scheduler retries

## Where to look

- \`deliverable/corpus.jsonl\`: the usable text-plus-embedding corpus.
- \`deliverable/corpus-preview.csv\`: a compact spreadsheet-friendly preview.
- \`deliverable/schema.json\`: the record contract.
- \`input/sources/\`: the exact, unmodified source snapshots with their notices.
- \`input/source-manifest.csv\`: source URLs, titles, hashes, rights basis, and counts.
- \`evidence/returned-items.jsonl\`: customer-field projection of actual returned pipeline items.
- \`evidence/run-report.json\`: observed facts, reconciliation, derivation, and claim boundary.
- \`evidence/failures.jsonl\`: empty because all four items completed.
- \`evidence/SHA256SUMS\`: integrity hashes for the package files.

## Raw evidence versus customer deliverable

The returned item projection preserves the real vector values and outcome
fields. The customer corpus then joins each returned vector to the exact
submitted chunk using \`record_id\`. The join is documented in the run report;
it is not presented as an unmodified API response.

## Verify

From the package root:

    shasum -a 256 -c evidence/SHA256SUMS

See \`SOURCE-NOTICE.md\` and \`SOURCE-LICENSE-CC0-1.0.txt\` for provenance
and the public-use basis.
`;
await writeFile(path.join(bundleDir, "README.md"), readme, "utf8");

const previewCards = corpusRecords.map((record) => `
  <article class="record">
    <p class="record-source">${htmlEscape(record.source_document_id.toUpperCase())} · chunk ${record.chunk_index + 1}</p>
    <h3>${htmlEscape(record.source_title)}</h3>
    <p class="record-id">${htmlEscape(record.record_id)}</p>
    <blockquote>${htmlEscape(record.text.replace(/\s+/g, " ").trim().slice(0, 360))}…</blockquote>
    <p class="record-proof">${record.text.length.toLocaleString("en")} characters · ${record.embedding_dimensions.toLocaleString("en")} embedding values · <strong>${htmlEscape(record.status)}</strong></p>
  </article>`).join("");

const startHere = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Inspect the completed WHAT GIT LEAVES OUT corpus sample: three pinned CC0 .gitignore templates, four text chunks, complete embedding vectors, and reconciled run evidence.">
  <meta property="og:title" content="WHAT GIT LEAVES OUT — Solvyr Fast Corpus sample">
  <meta property="og:description" content="A completed public text-to-corpus run with pinned CC0 inputs, complete vectors, and inspectable evidence.">
  <link rel="canonical" href="https://solvyr.com/downloads/fast-corpus-gitignore-sample/START-HERE.html">
  <title>WHAT GIT LEAVES OUT — Solvyr Fast Corpus sample</title>
  <style>
    :root { color-scheme: light; --ink:#08101F; --muted:#526078; --line:#E8ECF2; --surface:#F7F9FC; --blue:#1473FF; --green:#12805C; }
    * { box-sizing: border-box; }
    body { margin:0; font:16px/1.55 Inter, ui-sans-serif, system-ui, sans-serif; color:var(--ink); background:white; }
    main { max-width:1040px; margin:auto; padding:64px 28px 80px; }
    .eyebrow { color:var(--blue); font-size:13px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
    h1 { max-width:760px; margin:.2em 0; font-size:clamp(38px,7vw,72px); line-height:.98; letter-spacing:-.05em; }
    .lede { max-width:750px; font-size:21px; color:var(--muted); }
    .facts { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin:42px 0; background:var(--line); border:1px solid var(--line); border-radius:18px; overflow:hidden; }
    .fact { padding:24px; background:white; }
    .fact span { display:block; color:var(--muted); font-size:13px; }
    .fact strong { display:block; margin-top:7px; font-size:25px; }
    .result { padding:28px; border-radius:18px; background:#edf8f3; border:1px solid #cdeadd; }
    .result strong { color:var(--green); }
    h2 { margin-top:58px; font-size:32px; letter-spacing:-.025em; }
    .links { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
    .links a { padding:20px; color:var(--ink); text-decoration:none; border:1px solid var(--line); border-radius:14px; }
    .links a:hover { border-color:var(--blue); }
    .links strong,.links span { display:block; }
    .links span { color:var(--muted); margin-top:5px; }
    .records { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; }
    .record { min-width:0; padding:24px; border:1px solid var(--line); border-radius:16px; }
    .record h3 { margin:.2em 0; }
    .record-source { color:var(--blue); font-size:12px; font-weight:800; letter-spacing:.08em; }
    .record-id,.record-proof { color:var(--muted); font:13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap:anywhere; }
    blockquote { margin:18px 0; padding-left:18px; border-left:3px solid var(--blue); color:#33415b; overflow-wrap:anywhere; word-break:break-word; }
    .boundary { margin-top:48px; padding:24px; background:var(--surface); border-radius:16px; color:var(--muted); }
    @media (max-width:720px) { .facts,.links { grid-template-columns:1fr; } main { padding-top:38px; } }
  </style>
</head>
<body><main>
  <p class="eyebrow">Completed public text run · 24 August 2026</p>
  <h1>WHAT GIT LEAVES OUT.</h1>
  <p class="lede">Three official .gitignore templates engineers recognize immediately became a usable text-and-embedding corpus—with pinned CC0 inputs, stable chunk IDs, complete vectors, and run evidence included.</p>
  <section class="facts" aria-label="Run facts">
    <div class="fact"><span>Sources</span><strong>3 templates</strong></div>
    <div class="fact"><span>Prepared work</span><strong>4 chunks</strong></div>
    <div class="fact"><span>Outcome</span><strong>4 / 4</strong></div>
    <div class="fact"><span>Retries</span><strong>0</strong></div>
  </section>
  <p class="result"><strong>Accepted result:</strong> every submitted chunk returned one 4,096-value embedding, and the retrieved input hash matched the submitted input exactly.</p>

  <h2>Use the result—or inspect the proof.</h2>
  <div class="links">
    <a href="deliverable/corpus.jsonl"><strong>Customer-ready corpus</strong><span>Exact text joined to complete embedding vectors.</span></a>
    <a href="deliverable/corpus-preview.csv"><strong>Readable CSV preview</strong><span>Four rows with text and vector previews.</span></a>
    <a href="input/source-manifest.csv"><strong>Source manifest</strong><span>Official URLs, rights basis, hashes, and counts.</span></a>
    <a href="evidence/run-report.json"><strong>Technical run report</strong><span>Observed facts, reconciliation, derivation, and boundaries.</span></a>
  </div>

  <h2>See what each vector represents.</h2>
  <div class="records">${previewCards}
  </div>

  <div class="boundary"><strong>Evidence boundary.</strong> This tiny plain-text run demonstrates preparation, stable chunk identity, bounded scheduling, embedding generation, result retrieval, input validation, and a usable joined corpus artifact. It is not evidence for PDF extraction, OCR, retrieval quality, broad scale, distributed performance, cost, security, or an SLA.</div>
</main></body></html>
`;
await writeFile(path.join(bundleDir, "START-HERE.html"), startHere, "utf8");

const officialEmails = new Set(
  [...sourceTextById.values()]
    .flatMap((text) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])
    .map((email) => email.toLowerCase()),
);
const preChecksumFiles = await listFiles(bundleDir);
for (const file of preChecksumFiles) {
  const content = await readFile(file.absolute, "utf8");
  const hasPrivateRuntimeField = /api-test\.solvyr\.com|\b(?:node_hostname|node_id|result_ref|platform_build|job_id)\b/i.test(content);
  const hasLocalPath = /\/Users\/|\/private\//.test(content);
  if (hasPrivateRuntimeField || hasLocalPath) {
    throw new Error(`Private runtime detail entered public file: ${file.relative}`);
  }
  const emails = (content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])
    .map((email) => email.toLowerCase());
  const mayContainSourceContacts = file.relative.startsWith("input/sources/")
    || file.relative === "deliverable/corpus.jsonl";
  if (emails.length && (!mayContainSourceContacts || emails.some((email) => !officialEmails.has(email)))) {
    throw new Error(`Unexpected email address entered public file: ${file.relative}`);
  }
}

const filesBeforeChecksums = (await listFiles(bundleDir))
  .filter((file) => file.relative !== "evidence/SHA256SUMS")
  .sort((a, b) => a.relative.localeCompare(b.relative));
const checksums = [];
for (const file of filesBeforeChecksums) {
  checksums.push(`${sha256(await readFile(file.absolute))}  ${file.relative}`);
}
await writeFile(path.join(evidenceDir, "SHA256SUMS"), checksums.join("\n") + "\n", "utf8");

const bundleFiles = await listFiles(bundleDir);
const totalBytes = (await Promise.all(bundleFiles.map(async (file) => (await stat(file.absolute)).size)))
  .reduce((sum, size) => sum + size, 0);

console.log(JSON.stringify({
  bundle_dir: bundleDir,
  source_documents: manifest.length,
  corpus_records: corpusRecords.length,
  embedding_dimensions: corpusRecords[0].embedding_dimensions,
  files: bundleFiles.length,
  total_bytes: totalBytes,
  wall_clock_seconds: report.observed_facts.submission_to_completion_wall_clock_seconds,
}, null, 2));
