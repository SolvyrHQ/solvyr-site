# Website Update Checklist

Use this checklist before shipping future Solvyr website changes.

## Positioning

- [ ] `docs/website_messaging_guide.md` was read before editing.
- [ ] `docs/website_manager_agent.md` was followed for judgement/approval thresholds.
- [ ] First screen leads with document/text backlog to AI-ready output, or for public-data pages, a public/test metadata export to a reviewable quality report.
- [ ] The page names the concrete output: JSONL, chunks, embeddings, stable IDs, run report, or issue list/suggested fixes/caveats for public-data quality runs.
- [ ] The public seven-record sample is framed as plain-text embedding-output evidence, not as raw-PDF, OCR, retrieval-quality, scale, distributed-performance, customer-data, cost, or SLA proof.
- [ ] The public sample download exposes complete vectors and customer-relevant IDs/status/error/model fields, but no stale source snapshots, private artifact hashes, internal identifiers, or node/GPU/provider/per-record telemetry.
- [ ] Header tagline stays short: `Fast Corpus for European AI teams` / `Fast Corpus voor Europese AI-teams`.
- [ ] Cost is framed as a predictable scoped run or cost-per-result, not as a footnote.
- [ ] Infrastructure appears as support, not the headline.
- [ ] The About-page expansion story moves from a proven bounded workload to reusable execution capabilities without implying a broad platform is already available.
- [ ] Any commercial-validation statement preserves its anonymous, conditional, non-binding boundary and does not imply revenue, deployment, procurement, or a formal partnership.
- [ ] Research direction is framed as active work, not as formal verification, certification, or support for arbitrary sensitive workloads.
- [ ] Execution-pool language is supply-neutral and based on explicit node eligibility; household machines do not define the company.
- [ ] The broader vision appears only after the immediate Fast Corpus offer and proof, and Fast Corpus remains clear as the current wedge.
- [ ] Europe is described as the first proving ground, not the geographic ceiling.
- [ ] Environmental, utilization, resilience, and energy-aware scheduling language is labeled as intended and measurement-dependent.
- [ ] The site does not claim current electricity, water, emissions, data-centre construction, certified-sovereignty, or data-centre-GPU efficiency outcomes.
- [ ] EUR 0.95 is described as a starting processing rate for standard clean batches; pilot/service scope is separate and no unapproved minimum is implied.
- [ ] Solvyr is classified as a managed corpus service, not a GPU marketplace or generic orchestration layer.
- [ ] The build-versus-buy comparison is clear: customers receive completed corpus output without provisioning workers, operating queues, or assembling the pipeline.
- [ ] AI-team entry cues emphasize output, price, and proof; archive/public-sector cues add execution control to the same bounded workload.
- [ ] EU sovereignty / European execution is visible when public-sector, archive, or connector outreach is in scope.
- [ ] Sovereignty language stays attached to a real workload, output, and pilot decision.
- [ ] Security frames European context as explicit pilot boundaries, not as a blanket compliance or confidentiality claim.
- [ ] API/CLI language, if present, supports integration or handoff rather than becoming the public CTA.
- [ ] CTAs describe the work or decision, not generic platform access.
- [ ] `hello@solvyr.com` remains visibly available as the direct human contact while the workload-specific CTA stays primary.
- [ ] Mailto links, prepared pilot emails, conversion matching, metadata, footer copy, and agent-readable files use the same current contact address; no retired public address remains.
- [ ] The homepage hero has no secondary CTA that merely jumps to proof already immediately visible below it.
- [ ] Every `use-cases/*.html` page has first-screen hero buttons: workload-specific scope CTA plus a human-facing proof, sample, or supporting context link.
- [ ] Exclusions are still honest: OCR-heavy, sensitive data, custom extraction, mature SLA.
- [ ] Product-page header navigation stays stable, including the `Use cases` / `Toepassingen` dropdown; do not invent contextual top-right nav per page.
- [ ] Existing primary nav routes, especially `Fit` and `Security`, remain reachable unless explicitly approved.
- [ ] The active homepage view avoids repeating the same price, category, vision, sovereignty, or buyer-entry point when a dedicated tab or route already carries it.
- [ ] Supported claims are stated positively; necessary caveats appear once in the relevant proof, fit, price, security, or legal context rather than as repeated defensive disclaimers.
- [ ] The homepage has no hidden execution-model content; deeper execution context stays on the About execution section.
- [ ] Use-case dropdown links stay parallel in English and Dutch.
- [ ] Footer links stay stable by language; do not randomly drop `About`/`Over`, `Connectors`, legal/privacy, `hello@solvyr.com`, or agent-readable links.
- [ ] If agent-readable footer links are visually grouped, their literal links and machine-discovery signals remain intact.

## Consistency

- [ ] Logo artwork uses the exact working B Hybrid source asset rather than a CSS or hand-drawn approximation.
- [ ] Favicon and browser-tab assets use the approved compact mark; no old or generic icon remains in page heads or the production artifact.
- [ ] Brand colours follow the canonical working tokens and their semantic roles.
- [ ] Inter remains self-hosted and `assets/fonts/Inter-OFL.txt` ships with the font unless an approved typography/licensing change replaces it.
- [ ] Legal pages distinguish Solvyr OÜ's copyright notice from EUTM 019355983: the EUTM is the `Solvyr` word mark, not registration of the B Hybrid symbol or combined logo.
- [ ] Production team content remains portrait-free until Jan approves new high-resolution public-use assets; any founder profile links use the verified URLs and open in a new tab with `rel="noopener noreferrer"`.
- [ ] Generated node maps and conceptual diagrams are labeled as illustrations and are not used as evidence.
- [ ] `index.html` and `nl.html` carry the same strategic message.
- [ ] Language-specific CTAs stay in the same language or clearly label a language switch.
- [ ] Dutch pages link to Dutch counterparts when those counterparts exist.
- [ ] Pages with translated counterparts keep the EN/NL language switch visible.
- [ ] Use-case pages still point to a bounded backlog/corpus problem.
- [ ] Public-data use-case pages still point to recurring batch checks over public/test metadata exports, not generic metadata validation infrastructure.
- [ ] `about.html` and `connectors.html` reinforce workload-first positioning.
- [ ] If public routes, metadata, canonicals, hreflang, `robots.txt`, or `sitemap.xml` changed, run the indexability audit.
- [ ] Answer-engine access still separates search/retrieval bots from training bots.
- [ ] Cloudflare content signals remain `search=yes, ai-input=yes, ai-train=no`.
- [ ] `Google-Extended` remains limited to the curated agent-readable paths unless broader access had explicit approval.
- [ ] Agent-readable files directly classify Solvyr as managed document-to-corpus processing, not a GPU provider, marketplace, orchestration layer, or generic data platform.
- [ ] Agent-readable files match the human copy:
  - [ ] `llms.txt`
  - [ ] `ai/fast-corpus.md`
  - [ ] `ai/fast-corpus.json`
  - [ ] `capabilities.yaml`
  - [ ] `pricing.yaml` if pricing/scope changed
- [ ] The messaging guide/checklist were updated if the positioning, proof, CTA, buyer, pricing, or exclusion rules changed.

## Verification

- [ ] JSON files parse.
- [ ] `git diff --check` passes.
- [ ] Homepage renders without horizontal overflow on a narrow viewport.
- [ ] On a narrow viewport, the active primary-nav tab scrolls into view and the open use-case menu does not leave clipped sibling tabs visible.
- [ ] Main CTA target opens.
- [ ] Tab navigation still works.
- [ ] `Use cases` / `Toepassingen` opens and its links work in the browser on desktop and narrow viewports; a static href check alone is not treated as interaction proof.
- [ ] Prepared pilot emails target `hello@solvyr.com`, without sending a test message.
- [ ] `node scripts/audit-website.mjs` passes for meaningful website changes.
- [ ] Sitemap and internal links contain only final canonical URLs—not `http`, `www`, or `/index.html` redirect aliases—and localized pages include reciprocal `en`, `nl`, and `x-default` hreflang links.
- [ ] Pilot-intake source/intent attribution uses URL fragments rather than crawlable query parameters.
- [ ] `node scripts/audit-live-deploy.mjs` passes after deploy when route/metadata/indexing-sensitive files changed.
- [ ] Intentional public route/file/sitemap removals had explicit human approval before override flags were used.
- [ ] Structured data, performance/PageSpeed, or Search Console checks were run if this change made them relevant.
- [ ] `node scripts/audit-nav-footer.mjs` passes.
- [ ] No stray local server is left running after verification.

## Final Read

Read the first viewport as if you are a busy buyer.

It should say, in effect:

> Send a bounded backlog. Get accepted AI-ready corpus output and run evidence.

It should also feel useful, executable, and cost-effective enough to scope.
For archive/public-sector outreach, it should also make European execution
control visible without turning into an abstract infrastructure pitch.

If the page instead sounds like distributed infrastructure, developer tooling,
or a defensive cloud comparison, rewrite it.
