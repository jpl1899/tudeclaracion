# Comments for TD-5

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-5)

---

### Juan Leites - 7/7/2026, 19:48:05

## Acceptance Criteria

```gherkin
Feature: Company selection before starting work

  Scenario: List companies belonging to the authenticated accountant
    Given Rosana is authenticated
    When she opens the company selection screen
    Then she sees only the companies linked to her account
    And each company shows its name, RUT, status, and last activity

  Scenario: Select a company and continue to the dashboard
    Given Rosana is on the company selection screen
    When she selects one of the listed companies
    Then that company becomes the active company for her session
    And she can continue to the main dashboard scoped to that company

  Scenario: Filter companies by name or RUT
    Given Rosana has more than one company listed
    When she types part of a company's name or RUT into the search field
    Then the list narrows to companies matching that text
```

---

### Juan Leites - 7/7/2026, 19:48:06

## Scope

- List companies belonging to the authenticated accountant account (Cuenta).
- Select one company as the active company for the session.
- Search/filter the list by company name or RUT.

---

### Juan Leites - 7/7/2026, 19:48:07

## Out Of Scope

- Adding a new company (tracked separately under EPIC 1 — Company Onboarding).
- Editing or deleting an existing company.

---


_Synced from Jira by sync-jira-issues_
