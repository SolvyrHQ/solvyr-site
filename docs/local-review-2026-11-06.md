# Local website review — 6 November 2026

Status: reviewed local revision. Jan subsequently requested a direct
document-intake main-navigation link and authorized a live update in his
final sentence. Publication and live verification are pending below. The existing unrelated rotating-words preference in the
messaging guide was preserved. The knowledge repository was not edited.

## Review entry points

- Dutch homepage: http://127.0.0.1:8765/nl.html
- English homepage: http://127.0.0.1:8765/
- Dutch document intake: http://127.0.0.1:8765/use-cases/document-intake-nl.html
- English document intake: http://127.0.0.1:8765/use-cases/document-intake.html
- Dutch short intake: http://127.0.0.1:8765/pilot-intake-nl.html
- English short intake: http://127.0.0.1:8765/pilot-intake.html

The preview serves only `.site-dist/`. If it needs restarting, run from this
repository:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory .site-dist
```

## Narrative and offer

Start with the document task. Bring examples and the intended output, test
quality and processing costs, then agree the next step. Classification,
extraction, validation, matching and enrichment using agreed sources are work
Solvyr undertakes to scope and build. A missing implementation is not a reason
to exclude the conversation. Representative examples establish the actual
quality and implementation needed.

Lower total cost remains the aim to test at comparable useful quality,
including human review, correction and operating effort. Managed processing is
the starting point; own hardware is optional and deployment/location
requirements are worked out for the task. No new measured saving, general
location guarantee or broad production-readiness claim was introduced.

## Explicit reductions and omissions

- **Homepage:** replaced the seven-section structure with five sections.
  Removed the capacity-source diagram, current/next/overflow GPU cards,
  separate repeated partner-ownership section and internal paid-use/network
  milestones. The multi-worker numbers now stay on the proof routes. All
  existing proof, security, About, execution and Fast Corpus destinations
  remain visibly linked. Main copy is 39% shorter in English and 41% in Dutch.
- **Fast Corpus:** kept all five Overview/Fit/Output/Security/Pilot hash views.
  Consolidated repeated pilot flow, audience/use-case lists, report
  explanation and security appendix into shorter sections. Replaced blanket
  extraction/OCR exclusions with work to discuss and price separately.
  Location, access, storage, retention, deletion, logging, temporary-file and
  redaction topics remain. Main copy across the five panels is 59% shorter in
  English and 57% in Dutch.
- **Document intake:** replaced the negative fit list and implementation-heavy
  explanation with classification, extraction, matching/enrichment, useful
  output and a quality/cost test. Approval and downstream action stay with the
  customer or workflow partner.
- **Other use cases:** shortened repeated operating-model, infrastructure and
  qualification explanations. Preserved the PDF-to-RAG, re-indexing and
  public-data routes, output descriptions and proof/price links. Public-data
  copy is approximately 56% shorter in English.
- **Connectors:** removed the weak-introduction checklist and long technical
  qualification pitch. Kept a concrete reason to introduce a team and a short
  example introduction. English copy is 31% shorter.
- **About:** reduced repeated ownership and system/commercial-stage
  explanations. Kept both team members and exact verified profile links,
  managed execution and a concise execution-network ambition. English copy is
  24% shorter.
- **Proof:** removed duplicated combined-proof and internal next-commercial-
  milestone cards. Kept the original measured chart, values, acceptance-test
  facts and all artifact links. English copy is 31% shorter.
- **Security:** simplified the opening and customer action. Preserved the
  trust-zone visual, concrete current controls, data-handling requirements and
  distinction between current processing and later deployment work.
- **Intake form:** only name, organisation, email and intended task are shown
  first. All prior technical fields remain available as optional details;
  input type is no longer mandatory. Matching/enrichment choices were added.
  Request bodies omit blank fields and normalize accidental paragraph wraps.
- **Shared navigation:** changed the header contact label from “Scope a run” /
  “Run afbakenen” to “Discuss a test” / “Bespreek een test”; the existing exact
  destinations and attribution fragments are retained. Footer contact labels
  were simplified similarly. Product, Fit, Output, use cases, evidence,
  security, sample and language switches remain.
- **Legal and privacy:** simplified headings and broadened the old Fast-
  Corpus-only service description to document-processing enquiries. Existing
  rights, data processing, liability, pricing and trademark terms remain.
- **Metadata and discovery:** aligned titles, search/social descriptions,
  social-card text and all five agent-readable files. Updated the local
  messaging guide, checklist, manager instructions and corresponding audits.

Word counts compare body text in `<main>`, excluding header/footer and scripts;
Fast Corpus counts all five panels. These are copy-reduction measurements,
not processing performance or customer results.

## Preservation checks

- All 30 prior content routes remain, plus unchanged measurement routes.
- Every unique prior `a[href]` destination remains on its original page,
  including exact attribution fragments, contact links and downloads.
- Every prior HTML ID/fragment target remains on its original page.
- Canonical URL, hreflang, sitemap, robots, public source downloads, font,
  licence, logo and founder profile destinations remain.
- The Fast Corpus starting rate remains EUR 0.95 per 1000 pages for standard
  clean digital PDF/text processing, excluding VAT. Pilot/service scope and
  additional intake/enrichment work are priced separately.
- Original measured PDF, multi-worker and public output values were retained.
  The illustrative order/enrichment card is labelled an example task and
  intended result.

## Verification

- `node scripts/audit-website.mjs`: PASS, including all seven component audits
  and 848 internal link checks.
- `git diff --check`: PASS.
- `.site-dist/` build: PASS, 79 files. Knowledge/governance files, tooling,
  local V2 concept and founder portraits are excluded.
- JSON, JSON-LD and both YAML files parsed. Revised search/social metadata was
  read back against intended values. All public inline JavaScript parsed.
- All 30 content routes opened in Chrome at desktop size and 390px mobile;
  no measured horizontal page overflow. Homepage additionally checked at
  320px, 768px, 1024px and 1280px.
- English and Dutch use-case menus opened and navigated to document intake.
  Primary document-test CTA opened the localized short intake.
- All five Fast Corpus hash views worked in both languages; Product -> Output
  and the EN/NL language switch preserved the selected Output view.
- English and Dutch minimal forms copied the expected normalized summary
  without requiring optional details. Matching/enrichment could be selected.
- Isolated submission checks verified the `mailto:hello@solvyr.com` target,
  encoded subject/body, normalized values, skipped blank fields, optional
  enrichment, source/intent fragment and legacy-query attribution, and
  equality with the copied summary. No email client was opened and no message
  was sent; sent-mail rendering was not tested.
- Desktop and mobile screenshots reviewed for the homepage, document route
  and intake; Dutch social-card render inspected.

The bundled Node runtime was used because the system `node` executable has an
incompatible CPU architecture. No system runtime or dependency was changed.

## Local review follow-up — document intake first

Jan selected document intake as the principal offering. It is now the first
item under both Product and Use cases / Toepassingen on all 30 content routes.
Fast Corpus, Fit, Output and all existing application links remain. The
navigation audit and guide enforce the same English/Dutch order. This change
is local only.

Follow-up verification: full audit suite PASS with 878 internal links; build
PASS. Both dropdown orders were read back in Dutch and English, the document
intake links opened the correct localized routes, and 390px mobile checks
showed no page overflow. The local Dutch preview was refreshed with Product
open for review. No route or existing link was removed, and nothing was
published.

## Final navigation and release authority

Jan requested Document intake / Documentintake as a directly visible main
product link and removed the need for two menu entries. The final navigation
contains one direct document-intake link first, then the existing Product and
Use cases dropdowns. Both former document-intake menu entries are removed;
all route destinations remain reachable. Main navigation wraps on narrower
widths so every control remains available.

The latest user message contained an earlier local-only phrase followed by
“Update de live website dan maar”. The final explicit instruction is treated
as release authority for this reviewed website revision and navigation change.
The existing GitHub Pages workflow builds and publishes only `.site-dist/`;
DNS, Cloudflare security settings and product application infrastructure are
outside this change. Baseline/rollback source is
`d6aa44c1a3b089fb0a75608834f1d92c8d44520b`. A rollback would restore the
previous website commit through a new reviewed Git commit and the same Pages
workflow, preserving source history.
