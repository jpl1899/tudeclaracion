# Comments for TD-11

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-11)

---

### Juan Leites - 7/7/2026, 20:00:21

## Acceptance Criteria

```gherkin
Scenario: Happy path upload
  Given Rosana has selected the active company
  When she selects a valid Memory export TXT file
  And she confirms the upload
  Then the file is accepted for processing

Scenario: Wrong file type rejected
  Given Rosana has selected the active company
  When she selects a file that is not a TXT export
  Then she sees an error message telling her the file type is not supported
  And no file is uploaded

Scenario: Upload without a selected company rejected
  Given Rosana has not selected an active company
  When she tries to upload a file
  Then she sees an error message telling her to select a company first
  And no file is uploaded
```

---

### Juan Leites - 7/7/2026, 20:00:22

## Scope

- File selection and upload for the active company
- Basic file-type check on the selected file before accepting the upload

---

### Juan Leites - 7/7/2026, 20:00:23

## Out Of Scope

- Parsing and interpreting the uploaded file's contents (separate story)
- Structural validation of the file's contents (separate epic)
- Batch upload of multiple files at once

---


_Synced from Jira by sync-jira-issues_
