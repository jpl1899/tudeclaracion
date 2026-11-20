# tuDeclaracion

**Tax filings for Uruguayan accountants, without the manual work.**

tuDeclaracion turns the monthly TXT export from the accounting software (Memory) into a PADI-ready file for DGI sworn declarations (Form 2181, and Form 1376 in MVP 2). It validates RUTs, amounts, and structure along the way.

🔗 **Live (staging):** https://tudeclaracion-staging-pus8.onrender.com/
🧪 **QA automation repo:** [tudeclaracion-qa](https://github.com/jpl1899/tudeclaracion-qa)

> Staging runs on Render's free tier. The first request may take ~30–60 seconds while the instance wakes up.

<!-- TODO: add 2–3 screenshots (upload → validation errors → PADI export) -->

---

## The problem

Accountants in Uruguay build the DGI 2181 declaration by hand. They take the TXT export from Memory, apply tax rules from memory, and assemble a PADI-compatible file. The process is repetitive, error-prone, and scales badly with the number of clients.

## What it does

- **Upload and parse** the monthly Memory TXT, with no manual file editing.
- **Normalize** accounts into tax concepts through a configurable chart of accounts per company.
- **Validate** RUTs, amounts, and structure. Each error message explains how to fix the problem.
- **Run a tax rules engine** that determines the PADI line/code and the amount for each concept.
- **Export** the final PADI-compatible TXT, ready to import into DGI.
- **Multi-tenant:** one accountant account manages many client companies, with data isolated between them.
- **MVP 2:** Form 1376 (monthly VAT and tax advances), built by aggregating balances per account instead of per RUT.

## How it was built: an agentic, end-to-end workflow

I built this project with AI agents (Claude Code + MCP) driving each phase of the delivery lifecycle. I set the direction, reviewed every phase, and made the final call. The workflow started from an [agentic development boilerplate](https://github.com/upex-galaxy) that I adapted to this domain.

| Phase | Output in this repo |
| --- | --- |
| Business context | Business Model Canvas and market context (`.context/business/`) |
| Product definition | PRD: personas, user journeys, MVP scope, functional and non-functional requirements (`.context/PRD/`) |
| Technical spec | SRS and tax-rule specs (`.context/SRS/`, `.context/tax-rules/`) |
| Architecture | 10 Architecture Decision Records (`.context/ADR/`) |
| Backlog | Epics and stories synced with Jira (`.context/PBI/`) |
| Implementation | Next.js app plus 20+ versioned Supabase migrations |
| QA | Test plan here, and Playwright automation in a separate repo ([tudeclaracion-qa](https://github.com/jpl1899/tudeclaracion-qa)) |

Guardrails along the way: human review gates between phases, Husky and lint-staged pre-commit checks, and type, lint, and format checks (`bun run repo:check`). Anything unconfirmed in the specs is explicitly marked *"Propuesta a validar"* and never presented as fact.

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend / data:** Supabase (Postgres, Auth, RLS), Resend for auth emails, Google OAuth
- **Testing:** Vitest (unit), Playwright (E2E, in the QA repo)
- **Deploy:** Render (staging)
- **Tooling:** Bun, ESLint, Prettier, Husky

## Running locally

```bash
bun install
cp .env.example .env   # fill in your Supabase keys
bun run dev
```

## Repository map

| Path | What's there |
| --- | --- |
| `src/` | Application code |
| `supabase/migrations/` | Database schema history |
| `.context/` | Business, product, and technical context that the AI agents read |
| `.claude/skills/` | The agent workflows used for each phase |
| `docs/` | Methodology and setup docs |
| `docs/BOILERPLATE.md` | The original boilerplate README |

## License

MIT
