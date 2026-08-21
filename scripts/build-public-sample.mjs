import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.resolve(
  root,
  "../solvyr-knowledge/operations/testing_and_pilot/runs/run_004_pdf_text_chunking_embeddings/results/public_sample_bundle"
);
const output = path.join(root, "downloads/fast-corpus-public-sample");
const archive = path.join(root, "downloads/solvyr-fast-corpus-public-sample-2026-08-21.zip");

const checksumText = await readFile(path.join(source, "SHA256SUMS"), "utf8");
const expectedChecksums = new Map(
  checksumText.trim().split("\n").map((line) => {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (!match) throw new Error(`Invalid source checksum line: ${line}`);
    return [match[2], match[1]];
  })
);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

for (const [file, expected] of expectedChecksums) {
  const actual = sha256(await readFile(path.join(source, file)));
  if (actual !== expected) {
    throw new Error(`Source evidence changed: ${file} (${actual} != ${expected})`);
  }
}

const rawRows = (await readFile(path.join(source, "sample_output.jsonl"), "utf8"))
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
const rawReport = JSON.parse(await readFile(path.join(source, "sample_run_report.json"), "utf8"));

const publicRows = rawRows.map(({ task_id, record_id, status, embedding, error, model }) => ({
  task_id,
  record_id,
  status,
  embedding,
  error,
  model
}));

const allowedOutputFields = ["task_id", "record_id", "status", "embedding", "error", "model"];
for (const row of publicRows) {
  if (JSON.stringify(Object.keys(row)) !== JSON.stringify(allowedOutputFields)) {
    throw new Error(`Unexpected public output fields for ${row.record_id}`);
  }
  if (!Array.isArray(row.embedding) || row.embedding.length !== 4096) {
    throw new Error(`Unexpected embedding length for ${row.record_id}`);
  }
}

const publicReport = {
  acceptance_decision: "safe for public website use",
  evidence_label: "public_sample",
  run_date: rawReport.run_date,
  workload_label: rawReport.workload_label,
  input_format: rawReport.input_format,
  output_artifact_shape:
    "Public projection of actual returned pipeline items: task_id, record_id, status, embedding, error, and model.",
  observed_facts: {
    data_classification: rawReport.observed_facts.data_classification,
    document_count: rawReport.observed_facts.document_count,
    prepared_chunk_count: rawReport.observed_facts.prepared_chunk_count,
    completed_item_count: rawReport.observed_facts.completed_item_count,
    failed_item_count: rawReport.observed_facts.failed_item_count,
    retry_count: rawReport.observed_facts.retry_count,
    model_label: rawReport.observed_facts.model_label,
    chunking_method: rawReport.observed_facts.chunking_method,
    chunk_size_chars: rawReport.observed_facts.chunk_size_chars,
    chunk_overlap_chars: rawReport.observed_facts.chunk_overlap_chars,
    extraction_method: rawReport.observed_facts.extraction_method,
    ocr_used: rawReport.observed_facts.ocr_used,
    layout_parsing_used: rawReport.observed_facts.layout_parsing_used,
    vector_database_indexing_included: rawReport.observed_facts.vector_database_indexing_included,
    page_count: rawReport.observed_facts.page_count,
    page_count_status: rawReport.observed_facts.page_count_status,
    scheduler_tasks_succeeded: rawReport.observed_facts.scheduler_task_counts.succeeded,
    scheduler_tasks_permanently_failed: rawReport.observed_facts.scheduler_task_counts.permanently_failed,
    negative_path: {
      case: rawReport.observed_facts.negative_path.case,
      http_status: rawReport.observed_facts.negative_path.http_status,
      work_created: rawReport.observed_facts.negative_path.work_created
    }
  },
  derived_metrics: {
    all_vectors_same_length: rawReport.derived_metrics.all_vectors_same_length,
    embedding_vector_length: rawReport.derived_metrics.embedding_vector_length,
    submission_to_completion_wall_clock_seconds:
      rawReport.derived_metrics.submission_to_completion_wall_clock_seconds,
    source_output_counts: rawReport.derived_metrics.source_output_counts
  },
  reconciliation: rawReport.reconciliation,
  unavailable_or_withheld: {
    chunk_text_in_output:
      "Not returned. The manifest preserves public source identity and the character range encoded in each record ID.",
    prepared_input_rows:
      "Not included in the public bundle. The internal evidence archive retains the exact run evidence.",
    model_digest: rawReport.unavailable_or_withheld.model_digest,
    page_count: rawReport.unavailable_or_withheld.page_count,
    per_item_retry_count: rawReport.unavailable_or_withheld.per_item_retry_count,
    per_item_token_count: rawReport.unavailable_or_withheld.per_item_token_count,
    retention_until: rawReport.unavailable_or_withheld.retention_until
  },
  redactions: [
    "internal result reference/path",
    "internal node hostname and client identifier",
    "exact private platform build identifier",
    "private pipeline-artifact hash",
    "node, GPU, provider, power, batching, and per-record timing telemetry",
    "run identifier and exact timestamps",
    "run-date source snapshots containing superseded public contact and positioning copy"
  ],
  caveats: [
    "This is a three-document, seven-chunk public sample, not a scale or distributed-performance benchmark.",
    "The input branch was clean UTF-8 text. Raw PDF extraction and PDF page counting were not exercised.",
    "No OCR, layout parsing, structured extraction, vector database, hosted RAG, or search service was included.",
    "The public output is a customer-relevant field projection of actual returned pipeline items; embeddings were not synthesized or altered."
  ]
};

const readme = `# Solvyr Fast Corpus public sample bundle

Acceptance decision: **safe for public website use**.

This public-lite bundle comes from a real bounded run through the deployed
Solvyr test pipeline on 2026-08-21. It contains actual returned embedding
vectors for three Solvyr-owned documents that were public on the run date. The
embeddings were not generated or edited by hand.

## What ran

- Input: 3 public UTF-8 text documents, 7 prepared chunks.
- Chunking: fixed character windows, maximum 6000 characters, 500-character overlap.
- Model label returned by the pipeline: \`qwen3-embedding:latest\`.
- Vector length derived from every returned embedding: 4096.
- Result: 7/7 item outputs returned \`status=ok\`; 0 item failures; 0 retries.
- Scheduler lifecycle: 1 task succeeded; 0 permanently failed.
- Submission-to-completion wall clock: 20.520935 seconds.

## What is public

- \`sample_input_manifest.csv\`: public source identity, run-date hashes,
  character counts, and chunk counts.
- \`sample_output.jsonl\`: one public JSON object per actual pipeline item,
  limited to task ID, record ID, status, full embedding, error, and model.
- \`sample_run_report.json\`: observed facts, derived metrics, reconciliation,
  redactions, unavailable fields, and caveats.
- \`sample_failures.jsonl\`: empty because the sample produced no failed items.
- \`SHA256SUMS\`: checksums for the five content files above.

Every record ID preserves its public source identifier and submitted character
range. The manifest records the exact run-date source hashes. Exact source
snapshots are retained in the internal evidence archive rather than
republished, because the website copy and contact route have since changed.

## Public projection and redactions

The public JSONL preserves the customer-relevant returned fields and every
embedding value. It omits internal paths and identifiers, private artifact
hashes, exact build/run identifiers, timestamps, and node/GPU/provider/power/
batching/per-record timing telemetry. The full verified evidence remains in the
internal run archive.

The model digest was not returned and is explicitly unavailable. Plain text
has no PDF page count, so page count is not applicable.

## Negative path

One separate invalid JSONL upload containing an ID but no text was rejected
with HTTP 400 before work creation. No internal error detail is published.

## Claim boundary

This demonstrates clean public text preparation, chunk identity preservation,
bounded async scheduling, embedding generation, result retrieval, input
validation, and run evidence for a tiny workload. It is not evidence for
OCR-heavy scans, raw-PDF ingestion, structured invoice extraction, hosted
RAG/search, vector-database indexing, broad scale, distributed performance,
customer-data handling, cost, security, or an enterprise SLA.
`;

function collectObjectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectObjectKeys(item, keys);
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.push(key);
    collectObjectKeys(child, keys);
  }
  return keys;
}

const forbiddenPublicKeys = /^(?:node_|ollama_)|raw_pipeline_artifact|platform_build|run_id/i;
const leakedKeys = collectObjectKeys({ publicRows, publicReport }).filter((key) => forbiddenPublicKeys.test(key));
if (leakedKeys.length) throw new Error(`Private telemetry fields entered public sample: ${leakedKeys.join(", ")}`);

const publicTextForScan = `${readme}\n${JSON.stringify(publicRows)}\n${JSON.stringify(publicReport)}`;
if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicTextForScan)) {
  throw new Error("An email address entered the public sample");
}

await rm(output, { recursive: true, force: true });
await rm(archive, { force: true });
await mkdir(output, { recursive: true });

await copyFile(path.join(source, "sample_input_manifest.csv"), path.join(output, "sample_input_manifest.csv"));
await copyFile(path.join(source, "sample_failures.jsonl"), path.join(output, "sample_failures.jsonl"));
await writeFile(path.join(output, "README.md"), readme);
await writeFile(
  path.join(output, "sample_output.jsonl"),
  `${publicRows.map((row) => JSON.stringify(row)).join("\n")}\n`
);
await writeFile(path.join(output, "sample_run_report.json"), `${JSON.stringify(publicReport, null, 2)}\n`);

const contentFiles = [
  "README.md",
  "sample_input_manifest.csv",
  "sample_output.jsonl",
  "sample_run_report.json",
  "sample_failures.jsonl"
];
const publicChecksums = [];
for (const file of contentFiles) {
  publicChecksums.push(`${sha256(await readFile(path.join(output, file)))}  ${file}`);
}
await writeFile(path.join(output, "SHA256SUMS"), `${publicChecksums.join("\n")}\n`);

execFileSync("zip", [
  "-q",
  "-j",
  archive,
  ...contentFiles.map((file) => path.join(output, file)),
  path.join(output, "SHA256SUMS")
]);

console.log(`Built sanitized public sample in ${path.relative(root, output)}/`);
console.log(`Built ${path.relative(root, archive)}`);
