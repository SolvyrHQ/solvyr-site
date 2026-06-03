# Solvyr Site Working Rules

Before changing website copy, metadata, CTAs, use-case pages, or
agent-readable files, read:

- `docs/website_messaging_guide.md`
- `docs/website_update_checklist.md`
- `docs/website_quality_process.md`

Use the guide as the website brandbook. Keep the first-screen promise focused
on customer workload and accepted output:

> bounded document/text backlog to AI-ready corpus output and run evidence

Do not let future edits drift toward leading with distributed GPUs,
infrastructure abstraction, raw capacity, or sovereignty without a concrete
workload.

Do not remove, hide, rename, or de-prioritize existing primary routes,
navigation items, footer links, proof links, language switches, or security
content without explicit approval. If a route feels redundant, raise it first
instead of silently coding it out.

When a website change alters positioning, offer shape, target buyer, proof
claims, CTAs, pricing scope, or exclusions, update the guide/checklist and the
agent-readable files in the same pass.

When a website change adds, removes, renames, translates, or moves a public
route, or changes metadata, canonical URLs, hreflang, robots.txt, sitemap.xml,
header links, or footer links, run:

- `node scripts/audit-website.mjs`

Agent-readable files to keep aligned:

- `llms.txt`
- `ai/fast-corpus.md`
- `ai/fast-corpus.json`
- `capabilities.yaml`
- `pricing.yaml` when price or included scope changes
