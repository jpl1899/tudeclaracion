# Test Plan — tuDeclaracion

> Status snapshot: 2026-10-22. **Execution starts once the 4 declarations (2181, 1376, 2183, 1050) are finished.** Until then this file only records the current coverage, the gaps and the agreed priority.

## 1. Current coverage

| Type | What exists | Status |
|---|---|---|
| Unit (Vitest) | 18 files, 232 tests under `src/` — parser, normalizer, 2181 engine (consolidation, exclusions), 1376 totals + exporter, 1376 mapping, unmapped detection, BCU rates, password / redirect validation, Ayuda anchors | Solid, all green |
| Manual test cases | None written. The synced `acceptance-test-plan.md` / `acceptance-test-results.md` of the 33 local stories are empty stubs (the Jira custom fields are not configured). Gherkin scenarios exist in 9 stories. Manual evidence only for TD-43 | Missing |
| API / database | No tests. The app has no REST API of its own: it writes through Supabase RPCs (26 migrations) and relies on RLS for tenant isolation | Missing |
| E2E (Playwright) | `playwright` is a dependency, but there is no config and no spec. Only used for ad-hoc checks via `/playwright-cli` | Missing |

Stories with Gherkin scenarios (base for manual cases): TD-32, TD-38, TD-39, TD-43, TD-44, TD-45, TD-46, TD-47, TD-48.

## 2. Main risk

**RLS and RPC permissions are untested.** This is a multi-tenant app with tax data: if a policy breaks in a migration, one accountant could read or change another accountant's companies or asientos, and nothing would catch it.

## 3. Priority (when execution starts)

1. **Database security tests (RLS + RPCs)** — a user cannot read, insert, update or delete companies, plan de cuentas, 1376 mapping, asientos or declarations of another account. Cover every bulk-write RPC (including the payload size caps) and `borrar_periodo`.
2. **Playwright E2E of the main flow** — sign in → create / pick company → import TXT → review → download the 2181 PADI file and the 1376 file → check file content.
3. **Manual test cases** — derive them from the Gherkin scenarios of the 9 stories above, and write scenarios for the stories that still lack them.
4. **Regression for accountant-confirmed rules** — each rule in `.context/Tax-rules/` that blocks or excludes data gets at least one unit or E2E test (e.g. negatives never in the PADI file, unmapped movements not in the 1376, `;` separator in the 1376 file).

## 4. Open decisions

- **Where test cases live.** The Jira test-plan fields are not configured and there are no test issue types. Options: Jira comments (current fallback), a file in this repo, or a test-management plugin (e.g. Xray).
- **Test environment for E2E and RLS tests.** Local Supabase stack vs. staging with dedicated test users (credentials from `.env`, never hardcoded).
- **CI.** Whether E2E and database tests run on every PR or only before promoting to production.

## 5. Coverage by declaration

To fill in as each of the 4 declarations is finished: link each one to its unit tests, manual cases and E2E specs.

| Declaration | Unit | Manual | E2E |
|---|---|---|---|
| 2181 | Yes (parser, engine, exporter) | — | — |
| 1376 | Yes (totals, mapping, exporter, unmapped) | — | — |
| 2183 | — | — | — |
| 1050 | — | — | — |
