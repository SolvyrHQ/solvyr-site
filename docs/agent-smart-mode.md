# Solvyr Pilot-Fit Agent Smart Mode

The public `agent.html` page is safe without a backend. It first tries
`POST /api/agent`; if that endpoint is unavailable, it falls back to the
local rule-based qualifier in `agent.js`.

## Local Development

Run the smart-mode dev server:

```sh
OPENAI_API_KEY=... node scripts/dev-agent-server.mjs
```

Optional:

```sh
OPENAI_MODEL=gpt-5.4-mini
PORT=8765
```

Then open:

```text
http://127.0.0.1:8765/agent.html
```

If `OPENAI_API_KEY` is missing, the endpoint returns the safe local fallback.

## Production Shape

- Keep API keys server-side only.
- Deploy `api/agent.js` on a serverless Node host.
- Do not deploy smart mode on pure static hosting without an API layer.
- Keep request logging minimal. Do not retain raw chat transcripts by default.
- Keep `store: false` in OpenAI API calls unless retention is deliberately reviewed.

## Contract

The backend returns structured JSON:

- `reply`: short assistant paragraphs
- `verdict`: `likely`, `needs_scoping`, `not_fit`, or `unknown`
- `shouldClose`: whether the frontend should disable further chat
- `handoff`: `continue`, `email_or_intake`, `new_check`, or `none`
- `summary`: concise fit summary
- `missing`: useful missing detail
- `fields`: structured input/use-case/flag metadata

Out-of-scope and custom-scoped paths should close the chat and guide the user
to `Prepare email` or `Open intake`.
