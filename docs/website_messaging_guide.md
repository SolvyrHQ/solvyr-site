# Solvyr Website Messaging Guide

Purpose: keep future website edits aligned with Solvyr's current positioning.

This is the website equivalent of a lightweight brandbook. Use it before
changing homepage copy, metadata, use-case pages, agent-readable files, or CTAs.

Treat this as a living file. If the website positioning changes, update this
guide in the same pass so the next edit does not regress to older language.

## Core Positioning

Solvyr turns bounded document and text backlogs into accepted AI-ready outputs.

Current public front door:

- Solvyr Fast Corpus
- Clean PDF or text backlogs to AI-ready JSONL
- Outputs: extracted text, chunks, embeddings, stable IDs, run report
- Controlled async pilot, not open self-serve

The customer buys completed corpus output and run evidence, not GPU-hours.

## First-Screen Rule

The first viewport must answer the felt customer problem:

- What backlog can Solvyr process?
- What output does the customer get?
- What is the first action?

Do not lead with distributed GPUs, scheduler architecture, sovereignty, or
infrastructure abstraction. Those belong lower on the page as supporting proof.

## Preferred Language

Use:

- document backlogs
- clean PDF and text batches
- AI-ready JSONL
- accepted corpus output
- run evidence
- inspectable run report
- bounded pilot
- recurring corpus refresh
- controlled distributed execution

Avoid:

- generic GPU rental
- GPU marketplace
- raw capacity
- universal datacenter replacement
- broad platform migration
- AI infrastructure abstraction layer
- household GPU network as the product
- sovereignty without a concrete workload

## Narrative Order

Use this order whenever possible:

1. Customer problem: a document or text backlog needs to become usable.
2. Concrete output: JSONL, chunks, embeddings, stable IDs, run report.
3. Pilot shape: representative sample, capped run, decision.
4. Proof: measured run evidence, caveats, fit boundaries.
5. Infrastructure: controlled async execution underneath.

## CTA Rules

CTAs should name the work, not the internal product alone.

Good:

- Scope a backlog run
- Scope a PDF backlog run
- See the proof run
- Open pilot intake

Weaker:

- Learn more
- Start deploying
- Get compute
- Try the platform

## Header Navigation Rule

Keep product-page header navigation stable. Detail pages may have different
body links, but the top-right nav should not become contextual per page.

Current product nav:

- English: `Fast Corpus`, `Output`, `Proof`, `Pilot`
- Dutch: `Fast Corpus`, `Output`, `Proefrun`, `Pilot`

`Pilot` should route to the intake page, not a page-specific local section.

## Evidence Boundaries

When mentioning proof, stay specific:

- clean digital PDF/text path
- extraction, chunking, embedding generation
- measured wall-clock, GPU-hours, pages, chunks, failures, retries

Do not imply:

- OCR-heavy support by default
- complex layout parsing
- structured field extraction
- mature enterprise SLA
- confidential-compute guarantees
- broad self-serve availability

## Agent-Readable Consistency

When homepage positioning changes, update these files in the same pass:

- `llms.txt`
- `ai/fast-corpus.md`
- `ai/fast-corpus.json`
- `capabilities.yaml`
- `pricing.yaml` if price/scope changes

AI assistants should summarize the same offer humans see.

## Maintenance Rule

Every meaningful website update should ask whether this guide and the checklist
are still true. Update them when:

- the first-screen promise changes
- a new product or offer becomes public
- target buyers or connectors change
- proof claims, benchmark numbers, or exclusions change
- CTA language changes materially
- pricing or included scope changes
- the infrastructure story moves up or down in prominence

Do not treat this document as archived strategy. It is part of the website
system.

## Durable Lessons

Keep these lessons alive in future edits:

- Sell the problem the customer feels, not the infrastructure Solvyr built.
- Sell completed outcomes and cost-per-result, not distributed GPUs.
- A concrete corpus beats general AI interest.
- Distributed execution is credible only when attached to a workload that fits.
- Sovereignty and European execution are supporting context, not the lead offer.
- Recurring refresh is the stronger business layer after a first backlog run.
- Honest exclusions increase trust.

## Quick Review Questions

Before publishing a website change, ask:

- Does the first screen make the customer problem obvious?
- Can a buyer describe the output in one sentence?
- Are we selling work completed rather than infrastructure?
- Are proof claims bounded to what has actually been measured?
- Are the human pages and agent-readable files consistent?
- Would a connector know exactly who to introduce?
