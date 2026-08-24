# Solvyr Fast Corpus — WHAT GIT LEAVES OUT

Start with `START-HERE.html` for the readable result.

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

- `deliverable/corpus.jsonl`: the usable text-plus-embedding corpus.
- `deliverable/corpus-preview.csv`: a compact spreadsheet-friendly preview.
- `deliverable/schema.json`: the record contract.
- `input/sources/`: the exact, unmodified source snapshots with their notices.
- `input/source-manifest.csv`: source URLs, titles, hashes, rights basis, and counts.
- `evidence/returned-items.jsonl`: customer-field projection of actual returned pipeline items.
- `evidence/run-report.json`: observed facts, reconciliation, derivation, and claim boundary.
- `evidence/failures.jsonl`: empty because all four items completed.
- `evidence/SHA256SUMS`: integrity hashes for the package files.

## Raw evidence versus customer deliverable

The returned item projection preserves the real vector values and outcome
fields. The customer corpus then joins each returned vector to the exact
submitted chunk using `record_id`. The join is documented in the run report;
it is not presented as an unmodified API response.

## Verify

From the package root:

    shasum -a 256 -c evidence/SHA256SUMS

See `SOURCE-NOTICE.md` and `SOURCE-LICENSE-CC0-1.0.txt` for provenance
and the public-use basis.
