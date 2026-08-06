# TD-30 — Spec Compliance Matrix (PR1, #25)

> Dev-authored, non-Jira. Not synced from Jira.

| AC scenario (Gherkin) | covered_by | evidence | status |
|---|---|---|---|
| Scenario 1: opening an existing company's profile from the list pre-fills name, RUT, IVA-code mapping, and exempt-purchases mapping with saved values (incl. 0-row empty state) | manual:live-ui | Playwright CLI against `/empresas/851d1e59-...` (5 IVA rows + 1 exempt row) and `/empresas/37a028aa-...` (0 rows, empty-state copy) | covered |
| Scenario 2: saving valid changes updates the company and shows a clear success confirmation | manual:live-ui | Playwright CLI — name change saved, "Cambios guardados correctamente." banner, confirmed via SQL read | covered |
| Scenario 3: saving with a missing/invalid RUT or an incomplete IVA/exempt row is rejected with a clear message of what to complete | manual:live-ui | Playwright CLI — RUT cleared to `"123"`, banner + inline format message shown, no RPC call attempted | covered |
| Scenario 4: saving a RUT that already belongs to another company in the same account is rejected with a clear message naming the conflict | manual:live-ui | Playwright CLI — RUT set to another company's RUT, correct duplicate-RUT banner shown (post-fix: no longer misfires on non-RUT `plan_cuentas` conflicts, see `review.md` finding #1) | covered |
| Not an AC scenario, but in explicit story scope: unknown/foreign company id | manual:live-ui | Playwright CLI — `/empresas/00000000-...` (well-formed, nonexistent) and `/empresas/not-a-uuid` (malformed, post-fix) both render Next.js 404 | covered |
| Not an AC scenario, but in explicit story scope: "Volver sin guardar" | manual:live-ui | Playwright CLI — navigates back to `/empresas` without attempting a save | covered |

No `uncovered` rows. PR1's remaining scope (Step 5, "Ver empresa" link on `/empresas`) is a separate PR (PR2) per the Phase 1b chain-strategy decision — not part of this compliance pass.
