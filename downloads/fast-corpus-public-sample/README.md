# Solvyr Fast Corpus public sample bundle

Acceptance decision: **safe for public website use**.

This public-lite bundle comes from a real bounded run through the deployed
Solvyr test pipeline on 2026-08-21. It contains actual returned embedding
vectors for three Solvyr-owned documents that were public on the run date. The
embeddings were not generated or edited by hand.

## What ran

- Input: 3 public UTF-8 text documents, 7 prepared chunks.
- Chunking: fixed character windows, maximum 6000 characters, 500-character overlap.
- Model label returned by the pipeline: `qwen3-embedding:latest`.
- Vector length derived from every returned embedding: 4096.
- Result: 7/7 item outputs returned `status=ok`; 0 item failures; 0 retries.
- Scheduler lifecycle: 1 task succeeded; 0 permanently failed.
- Submission-to-completion wall clock: 20.520935 seconds.

## What is public

- `sample_input_manifest.csv`: public source identity, run-date hashes,
  character counts, and chunk counts.
- `sample_output.jsonl`: one public JSON object per actual pipeline item,
  limited to task ID, record ID, status, full embedding, error, and model.
- `sample_run_report.json`: observed facts, derived metrics, reconciliation,
  redactions, unavailable fields, and caveats.
- `sample_failures.jsonl`: empty because the sample produced no failed items.
- `SHA256SUMS`: checksums for the five content files above.

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
