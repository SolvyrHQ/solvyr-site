# Solvyr Site

Static website for Solvyr.

Before changing website copy, read:

- [Website Messaging Guide](docs/website_messaging_guide.md)
- [Website Update Checklist](docs/website_update_checklist.md)

The short rule: lead with the customer workload and accepted output. The
infrastructure story supports the offer; it should not be the first thing the
site asks visitors to understand.

Before committing structural page changes, run:

```sh
node scripts/audit-indexability.mjs
node scripts/audit-nav-footer.mjs
```
