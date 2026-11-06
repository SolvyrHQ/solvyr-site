# Website discoverability runbook

Current operating procedure, 2026-11-06. Jan requested this optimization and
live publication in the current website task. For later work, notification
and indexing submissions require relevant authorization; local audits do not.

This follows the knowledge repository's
`operations/website_discoverability_playbook.md`, while using the current
website messaging guide as authority for product, proof and crawler policy.
The older playbook predates the document-intake entry, the downloadable CC0
sample bundle and the present search/retrieval permission policy.

## Before publication

1. Preserve all public routes, canonical URLs, reciprocal EN/NL/x-default
   hreflang, navigation destinations, proof links and language switches.
2. Keep page titles and descriptions specific to the visible task and output.
   Keep Solvyr's site identity separate from Document Intake and Fast Corpus.
3. Homepages describe Organization/WebSite identity. Both product routes, in
   both languages, describe a WebPage and Service with their own canonical
   URL. Document intake has no inherited Fast Corpus price or benchmark.
4. Keep the five agent files consistent: `llms.txt`, `ai/fast-corpus.md`,
   `ai/fast-corpus.json`, `capabilities.yaml`, and `pricing.yaml`. Document
   intake comes first, with direct English and Dutch product/test links;
   corpus price and proof retain their own scope.
5. Maintain all 36 sitemap URLs. Set `lastmod` only for significant changes
   whose dates can be verified. The Nov 6 content update covers 35 resources;
   the unchanged portable sample HTML retains Aug 24. Do not restamp dates
   just because the deployment ran.
6. Run `node scripts/audit-website.mjs`, then
   `node scripts/build-production.mjs`. Preview `.site-dist/` and test both
   languages: desktop/mobile dropdown, first overview link and its actual
   Fast Corpus overview view. Keep Document intake directly visible.
   The overview's browser title must equal its static title after JavaScript
   runs, including after switching away and back; avoid stale duplicate title
   strings in the tab controller.

## Crawler policy

Normal search and documented AI search/user retrieval remain allowed.
Broad training bots remain blocked. Content signals stay
`search=yes, ai-input=yes, ai-train=no`. Google-Extended remains limited to
the curated agent packet; its dual grounding/training permission is not
expanded by this procedure.

A request with a bot user-agent checks response behavior from that client;
it does not authenticate a verified bot's source IP. A successful Google
Search Console live URL test is stronger evidence of Google's actual access.
Do not weaken Cloudflare protection to silence a failed CI fetch.

## After publication

1. Confirm the Pages deployment, then run
   `node scripts/audit-live-deploy.mjs` from a trusted client. Check status,
   canonical URLs, hreflang, robots, sitemap, JSON-LD and a real hard 404.
   Compare live menu labels and product data with the deployed source.
2. In the verified Search Console `sc-domain:solvyr.com` property, read the
   report date, sitemap result and concrete example URLs. Redirect aliases,
   deliberately excluded measurement routes, and a duplicated standard CC0
   license are not evidence that a product page is broken.
3. Inspect the homepages and primary document-intake routes. Use a live test
   to check fetch/indexing eligibility after substantial changes. Request
   indexing for the important changed pages once; record Google's response.
   A pending or successful request is not proof of indexing or ranking.
4. Check the exact notification set without sending:
   `node scripts/submit-indexnow.mjs --dry-run`. The default is the two
   homepages, two document-intake pages, two corpus pages and five agent files.
   Explicit URL arguments must exactly match the canonical sitemap. Select
   only meaningfully changed resources; do not submit on every label tweak.
5. With publication/notification authorization, run
   `node scripts/submit-indexnow.mjs` or supply the reviewed explicit URLs.
   The script verifies the public live key first and reports the HTTP receipt.
   HTTP 200 means submitted; 202 means received with key validation pending.
   Neither guarantees indexing, and IndexNow does not submit to Google.
6. Record the release, checks, request results and remaining uncertainty in
   the PR or a dated local review. Keep the browser proof of the live menu.

## Primary references

- [Google technical requirements](https://developers.google.com/search/docs/essentials/technical)
- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Google site names and WebSite data](https://developers.google.com/search/docs/appearance/site-names)
- [Google sitemap dates and submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Schema.org Service](https://schema.org/Service)
- [IndexNow protocol and response codes](https://www.indexnow.org/documentation)

Google AI features use normal search eligibility; there is no special
AI-only schema requirement. Agent files provide additional consistent public
context and do not replace indexable HTML, internal links or actual crawling.
