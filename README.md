# Solvyr Site

Static website for Solvyr.

Before changing website copy, read:

- [Website Messaging Guide](docs/website_messaging_guide.md)
- [Website Update Checklist](docs/website_update_checklist.md)
- [Website Quality Process](docs/website_quality_process.md)
- [Website Manager Agent](docs/website_manager_agent.md)

The short rule: lead with the customer workload and accepted output. The
infrastructure story supports the offer; it should not be the first thing the
site asks visitors to understand.

Before committing structural page changes, run:

```sh
node scripts/audit-website.mjs
```

Build the explicit production artifact with:

```sh
node scripts/build-production.mjs
```

Preview or publish only `.site-dist/`. The build deliberately excludes the
local `/v2/` concept, review files, and founder portraits.

## Repository and evidence checks

Before reasoning from an old checkout, run `git status -sb` and fetch the remote.
Compare local and remote history, including patch-equivalent squash merges,
before reconciling divergence. Preserve unpublished changes; never force-push
merely to synchronize this workspace. Generated `.site-dist/` is not source.

For company decisions and proof state, start at
[the knowledge proof path](../solvyr-knowledge/meta/current_proof_path.md) and
[decision index](../solvyr-knowledge/decisions/decision_index.md). Website guides
own public wording and exact public-use approval; a private investor naming
permission does not authorize a public customer reference. Escalate an actual
claim conflict instead of silently copying internal notes onto the website.

The static audit and production build check repository integrity. Browser checks
prove affected interactions; the live audit checks deployment basics. None
alone proves external search indexing, every factual claim, or product readiness.
The CI live audit can finish with a warning after failure: inspect that step and
perform the documented trusted-network check before accepting a release.

See [the cross-project quality report](../solvyr-knowledge/meta/repository_quality.md)
for the audit method, observed results and remaining boundaries.
