# Comments for TD-6

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-6)

---

### Juan Leites - 7/7/2026, 19:50:04

## Acceptance Criteria

```gherkin
Scenario: Happy path login
  Given Rosana has a verified account
  When she enters her correct email and password
  And she submits the login form
  Then she is signed in
  And she is redirected to the company selection screen

Scenario: Wrong password
  Given Rosana enters her correct email but an incorrect password
  When she submits the login form
  Then she sees an error message telling her the credentials are invalid
  And she remains on the login screen

Scenario: Redirect when already authenticated
  Given Rosana already has an active session
  When she navigates to the login screen
  Then she is redirected straight to the company selection screen without re-entering her credentials
```

---

### Juan Leites - 7/7/2026, 19:50:05

## Scope

- Email + password login
- Session persistence across page reloads
- Redirect to company selection on successful login

---

### Juan Leites - 7/7/2026, 19:50:06

## Out Of Scope

- Password recovery (separate story)
- OAuth / social login

---


_Synced from Jira by sync-jira-issues_
