# Solvyr Website Quality Process

Purpose: make website changes repeatable, reviewable, and hard to break by
accident.

## Guardrails

- Audits are read-only unless explicitly documented otherwise.
- Public route deletion, protected file deletion, public route rename, and
  sitemap URL removal require explicit human approval.
- Approval should be relevant, not performative. Ask when human judgement
  materially reduces risk; otherwise make low-risk reversible fixes and explain
  the judgement.
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

## Risk Tiers

| Tier | Examples | Agent behavior |
| --- | --- | --- |
| Low | typo fixes, broken local links, restoring missing nav/footer items, read-only audits, natural-language polish without claim changes | Act, verify, summarize |
| Medium | route additions, metadata changes, language counterparts, layout changes, new public page copy within existing positioning | Act with guardrails and audits; ask only if tradeoffs are ambiguous |
| High | deleting/renaming public routes, changing price/proof/security/legal/privacy claims, adding/removing exclusions, external submissions or mutations | Ask first; keep change scoped; require relevant checks |
| Blocked | guardrail failure whose fix would remove content, narrow the offer, or contradict prior user direction | Stop and ask for human judgement |

## Standard Local Suite

Run before committing meaningful website changes:

```sh
node scripts/audit-website.mjs
```

This runs:

- `scripts/audit-release-safety.mjs`
- `scripts/audit-indexability.mjs`
- `scripts/audit-structured-data.mjs`
- `scripts/audit-nav-footer.mjs`
- `scripts/audit-production-preferences.mjs`
- `scripts/audit-local-links.mjs`
- `scripts/audit-accessibility-static.mjs`

Also run:

```sh
git diff --check
```

Before any production handoff, build and preview the explicit public artifact:

```sh
node scripts/build-production.mjs
```

Only `.site-dist/` is a production artifact. It excludes the local `/v2/`
concept, review material, founder portraits, governance documents, and build
tooling. Do not publish the repository root.

And parse changed structured files, for example:

```sh
node -e "JSON.parse(require('fs').readFileSync('ai/fast-corpus.json','utf8'))"
```

When refreshing the seven-record public sample, build the public-lite artifact
from the verified knowledge-repository evidence before the production build:

```sh
node scripts/build-public-sample.mjs
```

The generator verifies the canonical source-bundle checksums, preserves every
embedding value and customer-relevant output field, removes stale source
snapshots and internal telemetry, rejects email addresses/private telemetry
fields, writes new public checksums, and rebuilds the ZIP. Do not hand-edit the
generated public sample files.

## Trigger Matrix

| Change type | Required checks |
| --- | --- |
| Any public route, nav, footer, metadata, robots, sitemap, or language-route change | `node scripts/audit-website.mjs` |
| Answer-engine crawler or content-signal change | Full local suite; verify search/retrieval access stays separate from training access |
| Header/footer change | `node scripts/audit-nav-footer.mjs` |
| Public route or sitemap deletion/removal | Human approval, then release-safety override if truly intended |
| Copy-only body edit | `git diff --check`, final read; run full suite if first-screen promise changes |
| Positioning, pricing, proof, CTA, buyer, exclusions | Update messaging guide/checklist and agent-readable files if relevant |
| Public seven-record sample or download changes | `node scripts/build-public-sample.mjs`, full local suite, checksum/ZIP verification, and sensitive-data scan |
| Layout, responsive behavior, forms, interactions | Local suite plus browser check on desktop/mobile-relevant viewport |
| Contact-address change | Scan source and `.site-dist/` for the retired address; verify visible mailto links, prepared pilot email, and conversion matching in both languages without sending mail |
| Dropdown or external-profile-link change | Static audit plus browser interaction check; verify external profiles use a new tab and `noopener noreferrer` |
| Horizontally scrollable mobile navigation | Verify direct hash routes reveal the active tab and the expanded menu has a clean, unambiguous layout |
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
off-origin URLs, checks status codes and a hard-404 probe, verifies `robots.txt`
and `sitemap.xml`, checks live titles, descriptions, canonicals, robots headers,
Dataset JSON-LD, and rejects Cloudflare-generated crawlable email-protection
links. The production workflow runs this audit after every GitHub Pages deploy.

The local indexability audit also rejects canonical redirect aliases in the
sitemap or internal links (`http://solvyr.com`, `https://www.solvyr.com`, and
`/index.html`), duplicate sitemap URLs, and incomplete reciprocal hreflang
clusters including `x-default`. Search Console may still report redirect URLs
that Google learned historically; those are expected exclusions when the
redirect target is the canonical homepage.

Pilot-intake attribution uses URL fragments, not query parameters. Fragments
preserve the source and intent used in the prepared email without creating
multiple crawlable intake URLs that can compete with the declared canonical.
The intake page remains backward-compatible with previously shared query URLs.

Privacy-friendly conversion measurement uses Cloudflare Web Analytics page
views for four same-origin, `noindex` measurement routes: pilot intake opened,
direct email chosen, pilot email prepared, and request summary copied. The
measurement is disabled on localhost. Never add form values, names, email
addresses, document details, visitor IDs, or query strings to these routes.

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

- Performance budget: add when visual assets, JS, or layout weight grows.
- Search Console review: manual or connector-based, because real index status
  cannot be proven from the local repo.
- Answer-engine result review: repeat focused Gemini, ChatGPT, Claude, and
  Perplexity checks after crawler-policy changes have propagated; robots changes
  do not prove when an external answer index has refreshed.
