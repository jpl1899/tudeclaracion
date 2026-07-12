# Comments for TD-18

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-18)

---

### Juan Leites - 7/7/2026, 20:04:45

## Acceptance Criteria

```gherkin
Feature: Clear validation error messaging

  Scenario: A single validation error is shown clearly
    Given a file with exactly one validation error
    When the Validator detects the error
    Then the system shows a message that identifies the specific field/row
    And the message explains how to resolve it

  Scenario: Multiple validation errors in the same file (OPEN QUESTION — not yet confirmed)
    Given a file with more than one validation error
    When the Validator processes the file
    Then the exact behavior is undefined as of this writing
    And it is pending confirmation of whether all errors are shown together or one at a time (see PRD/business-flow.md, PRD/user-journeys.md Journey 2)

  Scenario: Error message identifies the specific field/row
    Given a validation error on a specific line/field of the uploaded file
    When the system reports the error
    Then the message names that exact line/field
    And it is not a generic "validation failed" message
```

---

### Juan Leites - 7/7/2026, 20:04:46

## Scope

- Error message clarity and actionability for validation failures — the message must identify the specific field/row and state how to fix it (confirmed FR-12 requirement, not diferible).

---

### Juan Leites - 7/7/2026, 20:04:47

## Out Of Scope

- Auto-fixing detected errors — confirmed out of MVP per `PRD/user-journeys.md`: "no hay remediación automática en el MVP (confirmado, fuera de scope)".
- Contacting support from within the error UI.

---


_Synced from Jira by sync-jira-issues_
