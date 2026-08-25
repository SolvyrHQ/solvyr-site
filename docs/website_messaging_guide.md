# Solvyr Website Messaging Guide

Purpose: keep future website edits aligned with Solvyr's current positioning.

This is the website equivalent of a lightweight brandbook. Use it before
changing homepage copy, metadata, use-case pages, agent-readable files, or CTAs.

Treat this as a living file. If the website positioning changes, update this
guide in the same pass so the next edit does not regress to older language.

## Working Visual Identity Reference

The canonical working visual source is the sibling knowledge-repository folder
`../solvyr-knowledge/pitch/concepts/solvyr_merge_arrow_v0_1/`. Read its
`README.md`, `brand-book.md`, `sources-and-claims.md`, and `deck-handoff.md`
before changing logos, brand colours, founder photography, or founder profile
links.

- Use the exact five-lane **B Hybrid** logo from `logo/variations/svg/` as the
  working primary. Never recreate or approximate it in CSS.
- Use the full-colour asset on light surfaces and the reversed asset on navy or
  dark surfaces. Reserve the compact three-lane mark for genuinely small sizes,
  including favicons and browser-tab icons. A logo update includes those head
  assets; do not leave an unrelated legacy icon behind.
- Use Ink `#08101F`, Night `#050816`, navy `#0B1224`, blue `#1473FF`, violet
  `#5B3DFF`, proof green `#12805C`, assumption amber `#B87500`, gap red
  `#C43A3A`, light surface `#F7F9FC`, and divider `#E8ECF2` according to the
  semantic rules in the brand book.
- Founder photos must come from the LinkedIn-derived images embedded in the
  working Slides deck. Do not substitute generated or unrelated portraits.
- Verified profiles are Jan Wouter van Dalen at
  `https://nl.linkedin.com/in/janwoutervandalen` and Maksym Wezdecki at
  `https://pl.linkedin.com/in/maksym-wezdecki-a3b82b6b`.

The identity remains a working concept. Jan approved these assets for the local
non-binding V2 concept on 2026-08-20, not for automatic production or external
rollout. Preserve that approval boundary.

The current production website is deliberately portrait-free. The deck-derived
images are not large enough for a high-quality public presentation. Keep team
content typographic until Jan approves new high-resolution portraits and their
public-use basis. If founder profile links appear, open them in a new tab with
`rel="noopener noreferrer"`.

For any new AI-generated or AI-assisted visual, keep a short provenance record
and check whether third-party fonts, portraits, reference images, or other
source material were incorporated. AI generation and Solvyr's EUIPO trademark
registration do not replace those asset-specific checks.

Typography currently uses the self-hosted Inter variable font in
`assets/fonts/InterVariable.woff2`; its SIL Open Font License is retained at
`assets/fonts/Inter-OFL.txt`. Keep the licence alongside the distributed font,
avoid an unnecessary third-party font request, and do not replace the file
without checking the replacement's source and licence.

## Copyright And Trade Mark Notice

Jan approved a restrained public notice on 2026-08-22 without waiting for the
Reze paperwork. Keep the legal distinction precise:

- claim copyright only for original website text and files owned by Solvyr OÜ;
- leave third-party and separately licensed material under its own rights and
  licences;
- state that `Solvyr` is a registered European Union word mark owned by Solvyr
  OÜ, EUTM 019355983;
- do not describe that word-mark registration as registration of the B Hybrid
  symbol or combined logo;
- keep the full notice on the legal pages rather than adding `®` to every brand
  mention.

## Corporate Homepage And Route Hierarchy

The corporate homepage leads with the partner/integrator strategy:

> Ship reliable AI document workflows without maintaining the AI layer.

The partner keeps the customer, application, workflow, business rules, and
downstream action. Solvyr owns the bounded AI execution, retry, validation,
exception classification, typed result delivery, and run evidence needed for a
checked result.

Primary public audience: European ERP and document-workflow integrators with a
repeated, delay-tolerant document step across several customers.

Public route hierarchy:

- `/` and `/nl.html`: corporate partner/builder story;
- `/fast-corpus.html` and `/fast-corpus-nl.html`: preserved bounded
  backlog-to-corpus offer, including its page-based starting rate;
- `/use-cases/document-intake.html` and its Dutch counterpart: first
  ERP-adjacent route;
- `/proof.html` and its Dutch counterpart: corporate technical and
  accepted-result evidence;
- `/security.html` and its Dutch counterpart: concrete execution, storage,
  access, retention, and deletion boundaries;
- `/about.html` and its Dutch counterpart: execution-layer and flexible-compute
  vision.

Do not put the public Fast Corpus page-based price on the corporate homepage.
Predictable price per accepted result remains a shadow-metered commercial
hypothesis. Customer-local execution remains a later deployment direction, not
current broad availability.

Company-level narrative order:

1. Customer result.
2. Builder advantage and ownership boundary.
3. Trust and outcome economics.
4. Flexible compute underneath.

## Fast Corpus Route Positioning

Solvyr Fast Corpus turns bounded document and text backlogs into accepted
AI-ready corpus outputs.

Current Fast Corpus route:

- Solvyr Fast Corpus
- Route header tagline: `Fast Corpus for European AI teams`
- Clean PDF or text backlogs to AI-ready JSONL
- Outputs: extracted text, chunks, embeddings, stable IDs, run report
- Controlled async pilot, not open self-serve
- Adjacent public use case: recurring public-data quality runs over public or
  test metadata exports, with issue lists, suggested fixes, caveats, and run
  reports

The customer buys completed corpus output and run evidence, not GPU-hours.
For public-data quality runs, the customer buys recurring, reviewable batch
work around an export or refresh cycle, not generic metadata tooling.

## Company, Validation, And Expansion Story

The About page may make the company-building story legible without turning
the customer-facing homepage into an investor deck:

- Solvyr is founder-led and operated through Solvyr OÜ.
- Fast Corpus is the first bounded workload used to prove the underlying
  execution system.
- Repeated corpus and document workflows are the first expansion path.
- The reusable capabilities are accepted workload contracts, scheduling,
  node eligibility, retries, visible state, result validation, and lifecycle
  reporting.
- An anonymized commercial-validation signal may be described only with its
  conditions and non-binding character intact.

Do not name a commercial or research party without explicit permission. Do not
turn an LOI, validation letter, research conversation, or prospective work
package into a customer, revenue, deployment, procurement, or formal-partner
claim.

The current public commercial-validation boundary is:

- one bounded ERP-adjacent document and data workflow
- external commercial validation
- recorded intent to negotiate a paid pilot if technical validation succeeds
  and scope, pricing, security, and operating terms are mutually acceptable
- not a production deployment, purchase order, unconditional payment
  obligation, or recurring revenue

The expansion story must remain demand-led. Do not imply that additional
workload routes, a broad platform, or multiple execution pools are already
commercially available.

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

The published starting unit covers standard clean processing. Explain that a
complete engagement is scoped around the workload, validation requirements,
output package, execution boundaries, and operational responsibility.
Recurring refresh is repeatable managed work, not raw compute resale.

## Category And Build-Versus-Buy Rule

Solvyr is a managed corpus service, not a GPU marketplace or generic compute
orchestration layer. Controlled distributed execution is the system underneath
the offer, not the product the customer has to operate.

Frame the practical comparison as:

- build and operate a document-to-corpus pipeline on compute/orchestration
- buy a completed corpus run with inspectable output and run evidence

Use:

- managed corpus service
- completed corpus run
- Solvyr operates the pipeline
- controlled distributed execution underneath
- no worker provisioning, queue operation, or pipeline assembly for the buyer
- output and run evidence priced around the completed document workload

Avoid:

- competing on raw GPU price, capacity, or scheduler breadth
- presenting infrastructure providers as irrelevant; they remain substitutes
  for teams considering the build path
- `corpus vendor` when it makes the offer sound like passive file delivery
- implying that execution infrastructure alone is the customer value

The useful gap is finished corpus work with visible execution evidence: more
operationally explicit than generic document outsourcing, without asking the
buyer to adopt or operate an infrastructure platform.

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

European execution becomes meaningful when location, operator access, node
eligibility, storage, retention, deletion, and run evidence are attached to a
specific workload. Do not use Europe as a geographical substitute for these
controls.

## Research Direction Boundary

The public research direction may describe:

- workload-specific trust and execution requirements
- scheduler authority and node eligibility
- authorized access, task leases, result acceptance, and bounded retries
- failure, retention, deletion, and lifecycle evidence
- privacy-conscious observability when infrastructure is operated by another
  party

Frame these as active research and product-development questions toward a
commercially usable execution system. Do not claim formal verification,
certification, arbitrary sensitive-workload support, or institutional
commitment.

Use `eligible execution environments` or `controlled execution pools` rather
than defining the company through household machines. Solvyr-controlled,
partner-controlled, and customer-controlled workers are possible pool classes,
but partner/customer workers remain later and explicitly approved—not current
broad availability.

In the corporate header, keep the adopted descriptor short:

- English: `Dependable execution for asynchronous AI work`
- Dutch: `Betrouwbare uitvoering voor asynchroon AI-werk`

The dedicated Fast Corpus route may retain:

- English: `Fast Corpus for European AI teams`
- Dutch: `Fast Corpus voor Europese AI-teams`

Do not expand the tagline into a long sovereignty or public-sector sentence.

## Security And European Context

European execution context can appear under Security as a governance boundary,
not as a blanket security guarantee.

Good:

- execution and storage location for the pilot
- retention, deletion, and operator access defined before data is shared
- location and oversight belong in the pilot boundary

Avoid:

- `Europe = secure`
- mature compliance, government-cloud, or confidential-compute claims
- implying distribution itself creates confidentiality

## First-Screen Rule

The corporate homepage first viewport must answer:

- Who keeps the customer and workflow?
- What AI execution, validation, and exception work does Solvyr own?
- What partner route should the visitor discuss?

The Fast Corpus route first viewport must answer:

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
- public or test metadata exports
- AI-ready JSONL
- accepted corpus output
- run evidence
- issue lists, suggested fixes, caveats, and quality reports
- inspectable run report
- bounded pilot
- recurring corpus refresh
- public-data quality runs
- catalog refresh or metadata exchange
- controlled distributed execution
- predictable price per processed page
- cost-effective backlog processing
- European execution context
- archives, libraries, municipalities, and public-sector teams
- execution and storage location for the pilot

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
- metadata validation infrastructure as the headline

## Claim Tone And Boundaries

Lead with what Solvyr can support and what the evidence shows. The site should
sound precise and confident, not like a legal rebuttal to claims nobody made.

- State the useful positive claim first: accepted output, measured run, scoped
  pilot, or explicit execution boundary.
- Include a limitation when omitting it could materially mislead a buyer, but
  state it once beside the relevant proof, price, security, or fit content.
- Do not repeat `we do not claim`, `this is not`, or long lists of excluded
  interpretations across ordinary marketing sections.
- Keep fuller exclusions on the dedicated Fit, Security, Proof, Legal, or
  sample pages where a reviewer expects them.
- Label generated node maps, flow diagrams, and conceptual geometry as
  illustrations. Never present them as run evidence, topology evidence, or a
  picture of deployed infrastructure.

## Fast Corpus Narrative Order

Use this order on the Fast Corpus route whenever possible:

1. Customer problem: a document or text backlog needs to become usable.
2. Concrete output: JSONL, chunks, embeddings, stable IDs, run report.
3. Pilot shape: representative sample, capped run, decision.
4. Proof: measured run evidence, caveats, fit boundaries.
5. European/public-sector context when relevant: archives, oversight,
   sovereignty, and European execution control.
6. Infrastructure: controlled async execution underneath.

For public-data quality pages, keep the same order but substitute the concrete
workflow: public/test metadata export, recurring checks, issue list/suggested
fixes/caveats, reviewer decision, and then European execution context.

## Content Density And Page Roles

The homepage is a decision path, not the complete repository of Solvyr's
strategy. Keep the first active view compact enough that a buyer can understand
the workload, output, evidence, boundary, and next action without reading the
same point several times.

- Give each section one job and each headline one claim.
- Prefer one strong proof block over several repeated evidence summaries.
- State the processing-rate boundary once near the price; do not repeat the
  same caveat in every section.
- Keep the build-versus-buy distinction explicit once, then let Security,
  use-case pages, and the About execution section carry the depth.
- Remove duplicated vision, category, buyer-entry, and sovereignty paragraphs
  from the active homepage view when the same material remains available in a
  dedicated route or tab.
- Preserve honest fit boundaries, security content, proof links, language
  routes, and direct contact even when shortening the active page.
- Use progressive disclosure for optional intake detail and machine-readable
  resources; do not make technical utilities compete with the customer CTA.

The desired result is less repetition, not less substance. Detailed pages
should remain available for buyers who need to validate fit, evidence,
security, or company direction.

Do not maintain a hidden execution-model tab on the homepage. The concise
buyer consequence belongs on the homepage: Solvyr operates the pipeline and
the customer receives accepted output plus run evidence. Execution mechanics
belong in `about.html#execution` / `about-nl.html#execution`. The connector
guide should help someone recognize and introduce a workload, not repeat the
system architecture.

## Buyer Entry Paths

Keep one bounded Fast Corpus offer, but make the entry cue match the buyer:

- AI teams: backlog, output, price per page, proof, and avoided pipeline work
- archives and public-sector teams: the same workload and proof, plus execution
  location, oversight, data handling, and European control
- connectors: recognize the workload and route it to the owner; they do not
  need to sell distributed infrastructure

Do not blend sovereignty into the first-screen promise for every buyer. Do not
imply that public-sector teams care only about control or that AI teams never
care about it. Price, proof, and accepted output remain the common foundation.

## CTA Rules

CTAs should name the work, not the internal product alone.

Good:

- Scope a backlog run
- Scope a PDF backlog run
- Scope a public-data run
- See the proof run
- Open pilot intake

Weaker:

- Learn more
- Start deploying
- Get compute
- Try the platform

Every public use-case page under `use-cases/` should include a first-screen
`heroActions` block with:

- a primary button that scopes the specific run or workload
- a secondary human-facing proof, sample, or supporting context link

Use-case pages should not rely only on footer links or lower-page CTAs. Keep
the primary button label workload-specific, for example `Scope a PDF backlog
run`, `Scope a re-indexing run`, or `Scope a public-data run`.
Agent-readable files remain linked from the footer and machine-readable routes;
they do not need a prominent hero CTA.

On the corporate homepage, keep `Discuss a partner route` as the primary hero
CTA. Add a secondary hero CTA only
when it offers a distinct decision path. Do not link from the hero to a proof
block that is already the next visible content; put the proof link or download
inside the proof block itself. This does not remove the use-case-page rule
above, where a secondary supporting link helps a visitor before they have seen
the rest of that page.

A direct human email may appear as a visible secondary contact route. Keep the
workload-specific scope CTA primary, show the literal address rather than
hiding it behind a generic label, and keep English and Dutch contact paths
aligned. Current lead contact: `hello@solvyr.com`.

## Header Navigation Rule

Keep product-page header navigation stable. Detail pages may have different
body links, but the top-right nav should not become contextual per page.

Current product nav separates product discovery from the two next actions:

- English: `Product`, `Use cases`, `Proof`, `Security`, `Example run`, `Scope a run`
- Dutch: `Product`, `Toepassingen`, `Proefrun`, `Security`, `Voorbeeldrun`, `Run afbakenen`
- `Product` contains `Fast Corpus`, `Fit`, and `Output`, linking to the dedicated
  Fast Corpus route without giving every section equal top-level weight.
- `Example run` / `Voorbeeldrun` opens the real four-record public .gitignore sample in
  an inspectable completed-run surface. It is a public example, not a customer
  account, login, self-service dashboard, or claim of broad product access.
- `Scope a run` / `Run afbakenen` remains the primary acquisition action and
  routes to the controlled pilot intake.

`Product` and `Use cases` / `Toepassingen` are dropdowns. Keep their entries stable:

- English: `PDF to RAG corpus`, `Document re-indexing`, `Public-data quality runs`
- Dutch: `PDF naar RAG-corpus`, `Documenten herindexeren`,
  `Publieke datakwaliteit`
- Add `Document intake` / `Documentintake` as an ERP-adjacent use case only
  when it stays bounded to reviewable import-ready output and does not claim
  direct ERP write-back, certified accounting automation, or named vendor
  integration.

`Scope a run` / `Run afbakenen` should route to the intake page, not a
page-specific local section.
Do not remove an existing primary nav route without explicit approval.
If a page has a translated counterpart, keep the language switch visible on
both versions.

Do not add `Dashboard`, `Client access`, `Sign in`, or another return-path label
until it points to a real access-controlled customer surface. Until then, the
public example run is the honest product-presence signal.

Static presence is not enough for the dropdown: verify that it opens, its links
can be activated, and it remains legible without horizontal clipping on both a
desktop and narrow viewport. Check the English and Dutch versions in the
browser after interaction or responsive-navigation changes.

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
- `hello@solvyr.com`
- `Pilot intake`

Current Dutch footer:

- `Over`
- `Connectors`
- `Privacy`
- `Juridisch`
- `llms.txt`
- `AI brief`
- `Pricing YAML`
- `hello@solvyr.com`
- `Pilot intake`

Do not remove an existing footer route without explicit approval.
Agent-readable links may be grouped under a quiet `Machine-readable` /
`Machineleesbaar` disclosure. This is the current preferred presentation,
provided the literal links remain in the DOM, direct URLs stay unchanged, and
machine discovery in the document head, robots policy, sitemap, and agent
packet is preserved.
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

## Answer-Engine Discovery Rule

Generative-engine discovery should expose the same bounded offer and evidence
that the human website presents, without reopening the full site to broad
training crawlers.

Keep these distinctions explicit in `robots.txt`:

- normal search indexing is allowed
- `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`,
  `PerplexityBot`, and `Perplexity-User` are allowed for documented search or
  user-retrieval purposes
- broad training crawlers such as `GPTBot` and `ClaudeBot` stay blocked
- Cloudflare content signals state `search=yes, ai-input=yes, ai-train=no`
- `Google-Extended` is allowed only on the curated agent packet because Google
  combines Gemini grounding and training under one control token

The curated Google-Extended paths are:

- `/llms.txt`
- `/ai/`
- `/capabilities.yaml`
- `/pricing.yaml`

Do not expand that Google-Extended allowlist to the full website without
explicit approval. Google documents the token as controlling both Gemini
grounding and possible future-model training, so allowing a path grants both
uses for that path.

Agent-readable content should give direct, consistent answers to:

- what Solvyr is and how it should be classified
- what Fast Corpus accepts and delivers
- who it fits and does not fit
- current access and pricing shape
- published proof and its caveats
- the correct next action

## Evidence Boundaries

When mentioning proof, stay specific:

- clean digital PDF/text path
- extraction, chunking, embedding generation
- measured wall-clock, GPU-hours, pages, chunks, failures, retries

The public proof layer has two complementary artifacts:

- the 100-PDF run shows measured behavior for the clean digital PDF/text path;
- the four-record public .gitignore sample exposes a usable
  text-and-embedding corpus, pinned CC0 source snapshots, the projected
  returned items, source manifest, run report, failure file, and checksums.

Do not merge those into one end-to-end claim. The public sample did not run raw
PDF extraction. It demonstrates exact public text preparation, stable chunk
identity, bounded async scheduling, embedding generation, result retrieval,
input validation, and a usable joined corpus artifact for a tiny workload.
Present it as technical output evidence beside the larger run, not as a scale,
retrieval-quality, cost, security, or SLA benchmark.

Keep the public download as a public-lite projection of the verified internal
evidence. Publish the usable text-plus-vector corpus, projected returned items,
complete embedding values, stable task/record IDs, status, error, model label,
pinned GitHub .gitignore source snapshots, the CC0 license, manifest,
reconciled report, failure file, and checksums. Keep private artifact hashes,
internal paths/identifiers, exact build/run identifiers, and
node/GPU/provider/power/batching/per-record timing
telemetry in the internal evidence archive. Do not alter text or vector values
when applying this publication boundary.

Do not imply:

- OCR-heavy support by default
- complex layout parsing
- structured field extraction
- mature enterprise SLA
- confidential-compute guarantees
- broad self-serve availability
- European execution as a blanket security guarantee

## Agent-Readable Consistency

When homepage positioning changes, update these files in the same pass. They
must explain the corporate partner route while preserving Fast Corpus as a
separate offer:

- `llms.txt`
- `ai/fast-corpus.md`
- `ai/fast-corpus.json`
- `capabilities.yaml`
- `pricing.yaml` if price/scope changes

AI assistants should summarize the same offer humans see.

## Public Vision Layer

After the immediate partner result, proof, trust, and economics, the site may
state the broader vision:
activate millions of underused computers for AI execution and expand compute
capacity beyond today's data centres. Keep Fast Corpus explicit as the first
bounded workload and current commercial wedge, not the whole long-term model.
Europe is the first proving ground for location, ownership, policy, and
evidence—not the geographic ceiling.

Separate ambition from proof. Better hardware utilization, resilience,
energy-aware scheduling, and reduced pressure on central infrastructure are
intended outcomes requiring measurement. Do not claim current reductions in
electricity, water, emissions, or data-centre construction; certified
sovereignty; or higher efficiency than data-centre GPUs. Distributed execution
is not automatically more efficient.

The public EUR 0.95 per 1000 pages figure is a starting processing rate for
standard clean batches. Pilot and service scope are separate. Do not invent or
publish a minimum engagement until it is approved.

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
- Make the build-versus-buy comparison explicit: the buyer does not have to
  provision workers, operate queues, or assemble the corpus pipeline.
- Classify Solvyr as a managed corpus service, not a GPU marketplace or generic
  orchestration layer.
- Price the work in terms of completed output, not abstract compute or tooling.
- A concrete corpus beats general AI interest.
- Distributed execution is credible only when attached to a workload that fits.
- Let AI teams enter through price and proof; let archives and public teams add
  execution-control requirements to the same bounded run.
- Sovereignty and European execution should be visible for NL/EU public-sector
  outreach, but anchored in a concrete corpus run.
- Recurring refresh is the stronger business layer after a first backlog run.
- Public-data quality runs are strongest when positioned as recurring,
  explainable batch processing over public/test metadata, not as standalone
  schema validation or generic metadata infrastructure.
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
- Under Security, is European context framed as explicit pilot boundaries rather
  than a broad compliance or confidentiality claim?
- For public-data outreach, does the page name the export/refresh workflow,
  reviewer, issue output, and downstream decision?
