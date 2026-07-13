# Comments for TD-7

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-7)

---

### Juan Leites - 7/7/2026, 19:48:18

## Acceptance Criteria

Blocked — no real acceptance criteria until the loading mechanism is decided (see `06-normalizer.md`). Placeholder only, mechanism intentionally not specified:

```gherkin
Feature: Chart-of-accounts mapping available to the Normalizer

  Scenario: A fiscal-concept mapping exists for the active company
    Given the active company has a chart-of-accounts-to-fiscal-concept mapping loaded (loading mechanism TBD)
    When the Normalizer looks up a given account
    Then it retrieves the fiscal concept mapped to that account
```

---

### Juan Leites - 7/7/2026, 19:48:19

## Scope

- Chart-of-accounts-to-fiscal-concept mapping data exists per company (capability-level; no implementation mechanism implied).
- The Normalizer module can retrieve the mapped fiscal concept for a given account.

---

### Juan Leites - 7/7/2026, 19:48:21

## Out Of Scope

- Self-service chart-of-accounts autoconfiguration UI (confirmed out of MVP scope per `mvp-scope.md`).
- Editing or deleting an existing mapping.
- Automatic import from a bank or external accounting-system integration — not explicitly documented in `non-functional-requirements.md` or `mvp-scope.md`; inferred exclusion, since no FR or ADR describes any external banking/accounting integration in the MVP pipeline (the only confirmed ingestion path is a manually-exported Memory TXT, per FR-06).

---

### Juan Leites - 12/7/2026, 17:11:28

## Scope decision reversed (2026-07-12)

The self-service chart-of-accounts UI was originally called out as explicitly out of MVP scope (mvp-scope.md, one of the 3 headline product decisions). User reversed this: the chart-of-accounts-to-fiscal-concept mapping IS self-service in the MVP after all, completed by the accountant as part of the company-onboarding flow (US 1.3 / TD-8's 'Agregar nueva empresa' — currently a placeholder alert() in src/app/empresas/empresas-client.tsx).

Practical placement in the flow: once, right when a new company is created (TD-8), before that company's first file upload. Not a recurring step.

Updated: .context/PRD/mvp-scope.md (removed from Out of Scope, US 2.2 updated), .context/SRS/06-normalizer.md (Confirmado section).

This unblocks TD-7 -- no longer needs a separate product decision on the loading mechanism, since it is now: a form, inside TD-8's company-creation flow.

---


_Synced from Jira by sync-jira-issues_
