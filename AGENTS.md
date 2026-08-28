# Solvyr Site Working Rules

Before changing website copy, metadata, CTAs, use-case pages, or
agent-readable files, read:

- `docs/website_messaging_guide.md`
- `docs/website_update_checklist.md`
- `docs/website_quality_process.md`
- `docs/website_manager_agent.md`

Use the guide as the website brandbook. Keep the corporate first-screen promise
focused on the supported result and partner ownership boundary:

> reliable AI work, running where customers choose

> partners keep the customer and workflow; Solvyr owns bounded AI execution,
> validation, exceptions, and typed result delivery

Introduce flexible compute only after the result flow. Keep capacity expansion
demand-led: Solvyr-controlled workers today, approved organizational capacity
next, and European-provider overflow when real workloads require it.

Keep dedicated Fast Corpus first screens focused on:

> bounded document/text backlog to AI-ready corpus output and run evidence

## Working visual identity authority

Before changing a Solvyr logo, colour system, founder portrait, or founder
profile link, read the working identity source in the sibling knowledge repo:

- `../solvyr-knowledge/pitch/concepts/solvyr_merge_arrow_v0_1/README.md`
- `../solvyr-knowledge/pitch/concepts/solvyr_merge_arrow_v0_1/brand-book.md`
- `../solvyr-knowledge/pitch/concepts/solvyr_merge_arrow_v0_1/sources-and-claims.md`

Use the exact five-lane **B Hybrid** files from
`logo/variations/svg/` as the working primary identity. Do not redraw or
approximate the mark in CSS. Use the full-colour version on light surfaces and
the reversed version on navy/dark surfaces. The compact three-lane mark is only
for sizes where the five-lane mark cannot reproduce clearly, including the
favicon/browser-tab use case. Never leave an old or generic icon in the page
head after a logo change.

Canonical working colours are Ink `#08101F`, Night `#050816`, surface navy
`#0B1224`, blue `#1473FF`, violet `#5B3DFF`, proof green `#12805C`, assumption
amber `#B87500`, gap red `#C43A3A`, light surface `#F7F9FC`, and divider
`#E8ECF2`. Founder photos are the LinkedIn-derived images embedded in the
working Slides deck referenced by `deck-handoff.md`; do not regenerate or
substitute them. Verified profile links are:

- Jan Wouter van Dalen: `https://nl.linkedin.com/in/janwoutervandalen`
- Maksym Wezdecki: `https://pl.linkedin.com/in/maksym-wezdecki-a3b82b6b`

These remain working concept assets, not blanket approval for production or
external rollout. Jan explicitly approved their use in the local non-binding
V2 concept on 2026-08-20; ask before expanding that use publicly.

Current production decision (2026-08-21): keep founder and team presentation
text-only. The available deck portraits do not have sufficient resolution for
the production website. Do not reintroduce them or substitute another image
until Jan approves a new, sufficiently large source and its public-use basis.
Founder LinkedIn links may remain, but must open in a new tab with
`rel="noopener noreferrer"`.

## Settled production preferences

- Use `hello@solvyr.com` as the sole public contact address. Keep mailto links,
  pilot-email preparation, conversion matching, footers, metadata, and
  agent-readable files aligned.
- Keep the homepage a short decision path. Preserve detailed routes, but do
  not repeat the same proof, price, category, sovereignty, or vision message
  across multiple homepage sections.
- Do not add a hero button to a proof block that is already immediately visible
  on the same page. A secondary CTA must offer a genuinely different next step.
- Make supported claims positively and directly. Put a necessary caveat once,
  beside the relevant proof, price, security, or fit statement; do not fill
  customer copy with unsolicited lists of things Solvyr never claimed.
- Let measured values define the scope of a proof. Do not append warnings
  against extrapolations, certifications, workloads, or product states that
  the page has not claimed; keep that detail in the claim register or
  agent-readable evidence packet unless it changes the buyer's decision.
- Keep agent-readable resources discoverable but visually quiet in the footer;
  they must not compete with the workload CTA.
- Treat node maps and other generated diagrams as illustrations, never as
  operational evidence.
- For AI-generated or AI-assisted brand assets, record provenance and confirm
  the public-use basis. An EUIPO trademark registration and AI generation do
  not by themselves clear third-party fonts, portraits, or incorporated source
  material.
- Keep Inter self-hosted from `assets/fonts/InterVariable.woff2` with
  `assets/fonts/Inter-OFL.txt`. Do not switch to a remote font service or remove
  the licence file without a deliberate typography and licensing decision.

Do not let future edits drift toward leading with distributed GPUs,
infrastructure abstraction, raw capacity, or sovereignty without a concrete
workload.

Do not remove, hide, rename, or de-prioritize existing primary routes,
navigation items, footer links, proof links, language switches, or security
content without explicit approval. If a route feels redundant, raise it first
instead of silently coding it out.

Do not ask for approval merely for the sake of asking. Use the judgement model
in `docs/website_manager_agent.md`: act on low-risk reversible fixes, ask for
human judgement when deletion, claim changes, external mutation, or material
business/security/indexing risk is involved.

When a website change alters positioning, offer shape, target buyer, proof
claims, CTAs, pricing scope, or exclusions, update the guide/checklist and the
agent-readable files in the same pass.

When a website change adds, removes, renames, translates, or moves a public
route, or changes metadata, canonical URLs, hreflang, robots.txt, sitemap.xml,
header links, or footer links, run:

- `node scripts/audit-website.mjs`

For visible layout, navigation, dropdown, form, mailto, or responsive changes,
also build `.site-dist/` and verify the affected English and Dutch paths in a
browser. A static link audit does not prove that a dropdown or prepared-email
interaction works.

Agent-readable files to keep aligned:

- `llms.txt`
- `ai/fast-corpus.md`
- `ai/fast-corpus.json`
- `capabilities.yaml`
- `pricing.yaml` when price or included scope changes
