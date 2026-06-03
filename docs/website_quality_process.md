# Solvyr Website Quality Process

Purpose: make website changes repeatable, reviewable, and hard to break by
accident.

## Guardrails

- Audits are read-only unless explicitly documented otherwise.
- Public route deletion, protected file deletion, public route rename, and
  sitemap URL removal require explicit human approval.
- Do not use override environment variables silently. Use them only after the
  human reviewer has confirmed the specific route or file removal.
- Do not combine intentional removals with broad copy/layout changes in one
  commit. Keep the approval trail obvious.
- Do not add networked checks to the default local suite. Live checks are run
  separately because they depend on deployment state and external access.

Protected public files include HTML routes, `robots.txt`, `sitemap.xml`,
`llms.txt`, `ai/*`, `capabilities.yaml`, `pricing.yaml`, `CNAME`, favicons, and
brand assets.

Approved override flags, after explicit confirmation only:

- `SOLVYR_APPROVE_PUBLIC_REMOVAL=1`
- `SOLVYR_APPROVE_SITEMAP_REMOVAL=1`

## Standard Local Suite

Run before committing meaningful website changes:

```sh
node scripts/audit-website.mjs
```

This runs:

- `scripts/audit-release-safety.mjs`
- `scripts/audit-indexability.mjs`
- `scripts/audit-nav-footer.mjs`
- `scripts/audit-accessibility-static.mjs`

Also run:

```sh
git diff --check
```

And parse changed structured files, for example:

```sh
node -e "JSON.parse(require('fs').readFileSync('ai/fast-corpus.json','utf8'))"
```

## Trigger Matrix

| Change type | Required checks |
| --- | --- |
| Any public route, nav, footer, metadata, robots, sitemap, or language-route change | `node scripts/audit-website.mjs` |
| Header/footer change | `node scripts/audit-nav-footer.mjs` |
| Public route or sitemap deletion/removal | Human approval, then release-safety override if truly intended |
| Copy-only body edit | `git diff --check`, final read; run full suite if first-screen promise changes |
| Positioning, pricing, proof, CTA, buyer, exclusions | Update messaging guide/checklist and agent-readable files if relevant |
| Layout, responsive behavior, forms, interactions | Local suite plus browser check on desktop/mobile-relevant viewport |
| After deploy of route/metadata/indexing-sensitive changes | `node scripts/audit-live-deploy.mjs` |
| Adding schema.org structured data | Add/run a structured-data audit and manually verify rich-result eligibility |
| Large asset or layout-heavy change | Browser check; consider performance budget/PageSpeed check |

## Live Deploy Check

Run after deploy when public routes, metadata, canonicals, hreflang,
`robots.txt`, or `sitemap.xml` changed:

```sh
node scripts/audit-live-deploy.mjs
```

This performs read-only GET requests to `https://solvyr.com`, refuses
off-origin URLs, checks status codes, verifies `robots.txt` and `sitemap.xml`,
and verifies live HTML canonicals/noindex state for sitemap HTML routes.

## Human-In-The-Loop Points

Ask before coding or before overriding when:

- A page, route, nav item, footer link, proof link, language switch, security
  content, sitemap URL, agent-readable file, or brand asset would be removed,
  hidden, renamed, or de-prioritized.
- A live or networked check would submit, mutate, notify, or write to an
  external system.
- A change affects legal/privacy/security claims, pricing, exclusions, or proof
  claims.
- A guardrail fails and the proposed fix is not obvious or would reduce visible
  content.

## Current Gaps To Add Only When Needed

- Structured-data audit: add when schema.org JSON-LD is introduced.
- Performance budget: add when visual assets, JS, or layout weight grows.
- Search Console review: manual or connector-based, because real index status
  cannot be proven from the local repo.
