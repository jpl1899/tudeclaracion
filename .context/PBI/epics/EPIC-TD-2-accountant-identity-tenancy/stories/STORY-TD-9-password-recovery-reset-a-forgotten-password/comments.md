# Comments for TD-9

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-9)

---

### Juan Leites - 7/7/2026, 19:50:23

## Acceptance Criteria

```gherkin
Scenario: Request reset email
  Given Rosana has forgotten her password
  When she requests a password reset using her account email
  Then she receives an email with a password reset link

Scenario: Reset with valid token
  Given Rosana opens a valid, unexpired password reset link
  When she enters a new password that meets the strength requirements
  And she confirms the change
  Then her password is updated
  And she can sign in with the new password

Scenario: Expired or invalid token rejection
  Given Rosana opens a password reset link that has expired or was already used
  When she tries to set a new password
  Then she sees an error message telling her the link is no longer valid
  And she is offered the option to request a new reset email
```

---

### Juan Leites - 7/7/2026, 19:50:24

## Scope

- Email-based password reset link via Supabase Auth's password-recovery flow

---

### Juan Leites - 7/7/2026, 19:50:25

## Out Of Scope

- SMS-based recovery
- Security questions

---


_Synced from Jira by sync-jira-issues_
