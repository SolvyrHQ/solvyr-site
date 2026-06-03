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

## Cost Messaging Rule

Cost is a buying trigger, not a footnote. Lead with a predictable, scoped run:
pages processed, output delivered, and evidence the AI team can inspect.

Use:

- cost-effective backlog processing
- predictable price per processed page
- clear starting unit
- priced around completed output
- useful corpus output without a new internal pipeline project
- scoped run before recurring work

Avoid:

- claiming Solvyr is always cheaper than cloud
- telling buyers to process the backlog themselves
- making the copy sound apologetic about the current trial phase
- reducing the offer to a commodity API, CLI, GPU-hour, or parser

Let buyers compare Solvyr with their own cloud or internal pipeline. The site
should trigger: this is useful, executable, and cost-effective enough to scope.

## European Sovereignty Rule

European execution and sovereignty should be visible for archives, libraries,
municipalities, public-sector teams, research networks, and EU/NL connectors.
Keep it attached to a real workload.

Use:

- European execution context
- European execution control
- oversight during pilot design
- archives, libraries, municipalities, public-sector teams
- sovereignty questions attached to real document runs
- practical route to pilots

Avoid:

- abstract sovereignty as the headline promise
- implying mature government-cloud or compliance guarantees
- implying that distribution alone creates confidentiality or sovereignty
- replacing the corpus offer with a broad EU infrastructure pitch

The right sequence is: document backlog, inspectable output, predictable run,
then European control/sovereignty context.

## First-Screen Rule

The first viewport must answer the felt customer problem:

- What backlog can Solvyr process?
- What output does the customer get?
- What is the first action?

Do not lead with distributed GPUs, scheduler architecture, sovereignty, or
infrastructure abstraction. Those belong lower on the page as supporting proof.

Do not lead with API or CLI access either. API/CLI language belongs in
integration, handoff, agent-readable, or delivery-context copy. The public
headline and CTA should sell a run or corpus result, not developer tooling.

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
- predictable price per processed page
- cost-effective backlog processing
- European execution context
- archives, libraries, municipalities, and public-sector teams

Avoid:

- generic GPU rental
- GPU marketplace
- raw capacity
- universal datacenter replacement
- broad platform migration
- AI infrastructure abstraction layer
- household GPU network as the product
- sovereignty without a concrete workload
- API/CLI-first positioning
- abstract EU infrastructure pitch

## Narrative Order

Use this order whenever possible:

1. Customer problem: a document or text backlog needs to become usable.
2. Concrete output: JSONL, chunks, embeddings, stable IDs, run report.
3. Pilot shape: representative sample, capped run, decision.
4. Proof: measured run evidence, caveats, fit boundaries.
5. European/public-sector context when relevant: archives, oversight,
   sovereignty, and European execution control.
6. Infrastructure: controlled async execution underneath.

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

- English: `Fast Corpus`, `Fit`, `Output`, `Proof`, `Security`, `Pilot`
- Dutch: `Fast Corpus`, `Fit`, `Output`, `Proefrun`, `Security`, `Pilot`

`Pilot` should route to the intake page, not a page-specific local section.
Do not remove an existing primary nav route without explicit approval.
If a page has a translated counterpart, keep the language switch visible on
both versions.

## Language Rule

Keep English and Dutch routes parallel when both versions exist. If a Dutch
page links to a route that has a Dutch counterpart, use the Dutch route.

Some product/navigation terms intentionally stay the same in Dutch because they
are short product labels or common AI-team language:

- `Fast Corpus`
- `Fit`
- `Output`
- `Security`
- `Pilot`
- `Connectors`
- `AI brief`
- `Pricing YAML`

Translate surrounding explanatory copy into natural Dutch. Avoid half-English
phrases such as `apart gescoord`, `Solvyr's`, `re-indexing artifact`, or
`emailcontact` unless they are deliberate product terms.

## Footer Rule

Keep footer links stable by language. Detail pages may use page-specific UTM or
source parameters on the pilot link, but the footer should not randomly gain or
lose core site links.

Current English footer:

- `About`
- `Connectors`
- `Privacy`
- `Legal`
- `llms.txt`
- `AI brief`
- `Pricing YAML`
- `Pilot intake`

Current Dutch footer:

- `Over`
- `Connectors`
- `Privacy`
- `Juridisch`
- `llms.txt`
- `AI brief`
- `Pricing YAML`
- `Pilot intake`

Do not remove an existing footer route without explicit approval.
Run `node scripts/audit-nav-footer.mjs` after header or footer changes; it
checks labels and core footer routes for English and Dutch pages.

## Indexability Rule

Google discovery should stay boring and explicit:

- `robots.txt` must allow normal search crawling and point to
  `https://solvyr.com/sitemap.xml`.
- Every public HTML page should have a title, meta description, canonical URL,
  Open Graph title/description, and matching `html lang`.
- Public HTML pages should be listed in `sitemap.xml` under HTTPS canonical
  URLs.
- English/Dutch counterpart pages should carry reciprocal `hreflang` links.
- Do not add `noindex`, remove canonical links, or leave stale sitemap entries
  without explicit approval.

Run `node scripts/audit-indexability.mjs` when adding, removing, renaming,
translating, or moving a public page, or when changing metadata, canonical URLs,
hreflang, `robots.txt`, `sitemap.xml`, header links, or footer links. Body-copy
only edits usually do not need it unless they change the page's search promise
or first-screen intent.

For meaningful website changes, prefer the full local suite:
`node scripts/audit-website.mjs`. After deploy of route/metadata/indexing
changes, run `node scripts/audit-live-deploy.mjs`.

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
- Price the work in terms of completed output, not abstract compute or tooling.
- A concrete corpus beats general AI interest.
- Distributed execution is credible only when attached to a workload that fits.
- Sovereignty and European execution should be visible for NL/EU public-sector
  outreach, but anchored in a concrete corpus run.
- Recurring refresh is the stronger business layer after a first backlog run.
- Honest exclusions increase trust when they are specific and not
  self-undermining.

## Quick Review Questions

Before publishing a website change, ask:

- Does the first screen make the customer problem obvious?
- Can a buyer describe the output in one sentence?
- Are we selling work completed rather than infrastructure?
- Are proof claims bounded to what has actually been measured?
- Are the human pages and agent-readable files consistent?
- Would a connector know exactly who to introduce?
- For archives/public-sector outreach, is the European sovereignty angle visible
  without becoming an abstract infrastructure pitch?
