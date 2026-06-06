# Website Update Checklist

Use this checklist before shipping future Solvyr website changes.

## Positioning

- [ ] `docs/website_messaging_guide.md` was read before editing.
- [ ] `docs/website_manager_agent.md` was followed for judgement/approval thresholds.
- [ ] First screen leads with document/text backlog to AI-ready output, or for public-data pages, a public/test metadata export to a reviewable quality report.
- [ ] The page names the concrete output: JSONL, chunks, embeddings, stable IDs, run report, or issue list/suggested fixes/caveats for public-data quality runs.
- [ ] Header tagline stays short: `Fast Corpus for European AI teams` / `Fast Corpus voor Europese AI-teams`.
- [ ] Cost is framed as a predictable scoped run or cost-per-result, not as a footnote.
- [ ] Infrastructure appears as support, not the headline.
- [ ] EU sovereignty / European execution is visible when public-sector, archive, or connector outreach is in scope.
- [ ] Sovereignty language stays attached to a real workload, output, and pilot decision.
- [ ] Security frames European context as explicit pilot boundaries, not as a blanket compliance or confidentiality claim.
- [ ] API/CLI language, if present, supports integration or handoff rather than becoming the public CTA.
- [ ] CTAs describe the work or decision, not generic platform access.
- [ ] Exclusions are still honest: OCR-heavy, sensitive data, custom extraction, mature SLA.
- [ ] Product-page header navigation stays stable, including the `Use cases` / `Toepassingen` dropdown; do not invent contextual top-right nav per page.
- [ ] Existing primary nav routes, especially `Fit` and `Security`, remain reachable unless explicitly approved.
- [ ] Use-case dropdown links stay parallel in English and Dutch.
- [ ] Footer links stay stable by language; do not randomly drop `About`/`Over`, `Connectors`, legal/privacy, or agent-readable links.

## Consistency

- [ ] `index.html` and `nl.html` carry the same strategic message.
- [ ] Language-specific CTAs stay in the same language or clearly label a language switch.
- [ ] Dutch pages link to Dutch counterparts when those counterparts exist.
- [ ] Pages with translated counterparts keep the EN/NL language switch visible.
- [ ] Use-case pages still point to a bounded backlog/corpus problem.
- [ ] Public-data use-case pages still point to recurring batch checks over public/test metadata exports, not generic metadata validation infrastructure.
- [ ] `about.html` and `connectors.html` reinforce workload-first positioning.
- [ ] If public routes, metadata, canonicals, hreflang, `robots.txt`, or `sitemap.xml` changed, run the indexability audit.
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
- [ ] Main CTA target opens.
- [ ] Tab navigation still works.
- [ ] `node scripts/audit-website.mjs` passes for meaningful website changes.
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
