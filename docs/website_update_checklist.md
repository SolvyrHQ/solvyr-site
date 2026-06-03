# Website Update Checklist

Use this checklist before shipping future Solvyr website changes.

## Positioning

- [ ] `docs/website_messaging_guide.md` was read before editing.
- [ ] First screen leads with document/text backlog to AI-ready output.
- [ ] The page names the concrete output: JSONL, chunks, embeddings, stable IDs, run report.
- [ ] Infrastructure appears as support, not the headline.
- [ ] CTAs describe the work or decision, not generic platform access.
- [ ] Exclusions are still honest: OCR-heavy, sensitive data, custom extraction, mature SLA.
- [ ] Product-page header navigation stays stable; do not invent contextual top-right nav per page.
- [ ] Existing primary nav routes, especially `Fit` and `Security`, remain reachable unless explicitly approved.
- [ ] Footer links stay stable by language; do not randomly drop `About`/`Over`, `Connectors`, legal/privacy, or agent-readable links.

## Consistency

- [ ] `index.html` and `nl.html` carry the same strategic message.
- [ ] Language-specific CTAs stay in the same language or clearly label a language switch.
- [ ] Pages with translated counterparts keep the EN/NL language switch visible.
- [ ] Use-case pages still point to a bounded backlog/corpus problem.
- [ ] `about.html` and `connectors.html` reinforce workload-first positioning.
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
- [ ] `node scripts/audit-nav-footer.mjs` passes.
- [ ] No stray local server is left running after verification.

## Final Read

Read the first viewport as if you are a busy buyer.

It should say, in effect:

> Send a bounded backlog. Get accepted AI-ready corpus output and run evidence.

If the page instead sounds like distributed infrastructure, rewrite it.
