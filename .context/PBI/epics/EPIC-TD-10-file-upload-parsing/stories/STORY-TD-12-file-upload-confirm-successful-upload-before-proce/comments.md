# Comments for TD-12

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-12)

---

### Juan Leites - 7/7/2026, 20:01:47

## Acceptance Criteria

```gherkin
Scenario: Successful upload confirmation shown
  Given Rosana has uploaded a valid file
  When the upload completes successfully
  Then she sees a confirmation that the upload succeeded
  And the confirmation shows the uploaded filename and the upload timestamp

Scenario: Upload failure shown distinctly
  Given Rosana attempts to upload a file
  When the upload does not complete successfully
  Then she sees a failure state that is visually and textually distinct from the success confirmation
  And she is not led to believe processing has started

Scenario: Confirmation includes filename and timestamp
  Given a file has just uploaded successfully
  When Rosana views the confirmation
  Then it displays the exact filename she uploaded
  And it displays the date and time the upload completed
```

---

### Juan Leites - 7/7/2026, 20:01:48

## Scope

- Post-upload confirmation feedback for both the success and failure states
- Filename and timestamp displayed as part of the success confirmation

---

### Juan Leites - 7/7/2026, 20:01:49

## Out Of Scope

- Processing status or progress indication for the parsing pipeline itself
- Retrying a failed upload automatically

---


_Synced from Jira by sync-jira-issues_
