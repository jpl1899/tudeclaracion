# Comments for TD-8

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-8)

---

### Juan Leites - 7/7/2026, 19:50:20

## Acceptance Criteria

```gherkin
Scenario: Happy path add company
  Given Rosana is on the company selection screen
  When she chooses to add a new company
  And she enters a valid RUT and company name
  And she confirms
  Then the new company is created under her account
  And it appears immediately in her company list

Scenario: Duplicate RUT rejection
  Given Rosana enters a RUT that is already registered under her account
  When she confirms the new company form
  Then she sees an error message telling her the RUT is already registered
  And no duplicate company is created

Scenario: Required-field validation
  Given Rosana leaves the RUT or company name empty
  When she tries to confirm the new company form
  Then she sees a validation message identifying the missing field
  And the company is not created
```

---

### Juan Leites - 7/7/2026, 19:50:21

## Scope

- Add a company by RUT and name
- Associate the new company with the authenticated accountant's account
- New company appears immediately in the company list

---

### Juan Leites - 7/7/2026, 19:50:22

## Out Of Scope

- Editing or deleting an existing company
- Bulk import of companies

---

### Juan Leites - 12/7/2026, 17:11:37

## Scope note (2026-07-12): now includes chart-of-accounts entry

TD-7 (chart-of-accounts-to-fiscal-concept mapping) was unblocked by reversing its self-service-out-of-scope decision -- see TD-7's comment for the full reversal note. Practical consequence for TD-8: the 'Agregar nueva empresa' flow (currently a placeholder alert() in src/app/empresas/empresas-client.tsx) now needs to include a step/section where the accountant defines that new company's chart-of-accounts-to-fiscal-concept mapping, not just company identity fields (nombre, RUT, etc.).

Not yet mocked -- master-design-plan.md still lists TD-8's onboarding flow as unmocked (SS4.4). Will need a just-in-time design brief covering both concerns (company fields + chart-of-accounts rows) when TD-8 is picked up.

---


_Synced from Jira by sync-jira-issues_
