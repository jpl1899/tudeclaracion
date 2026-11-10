# Authentication | Sign in with a Google account

**Jira Key:** [TD-32](https://lk-tudeclaracion.atlassian.net/browse/TD-32)
**Epic:** [TD-2](https://lk-tudeclaracion.atlassian.net/browse/TD-2) (Accountant Identity & Tenancy)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to sign in with my Google account so that I can access tuDeclaración without creating and remembering another password.

## Context

Today the only way in is email + password. Offering Google as an additional sign-in option lowers the barrier to entry and removes one more credential to manage — consistent with the "rápido y simple" expectation of the primary persona. Google is added alongside the existing sign-in and sign-up screens; email + password stays available and unchanged.

## Scope

- A "Continue with Google" action on both the sign-in and the sign-up screens.
- First sign-in with a Google identity whose email matches no existing account creates a new account.
- First sign-in with a Google identity whose email matches an existing email/password account links the two, so the user reaches the same workspace and the same client companies.
- After Google sign-in the user lands on the same post-login screen as an email/password sign-in.
- A clear, guided message when Google sign-in cannot be completed (user cancels, Google denies access, network failure).

## Out of scope

- Other social providers (Apple, Microsoft, etc.).
- Removing or changing the existing email + password login.
- SSO / Google Workspace organization-managed enforcement.
- An account-unlinking screen.

## Acceptance criteria

```gherkin
Scenario: New user signs in with Google
  Given I am on the sign-in screen
  And no account exists for my Google email address
  When I choose "Continue with Google" and approve access
  Then a new account is created for me
  And I land on the post-login home screen

Scenario: Existing email/password user signs in with Google for the first time
  Given an account already exists with my email address
  When I choose "Continue with Google" and approve access
  Then my Google identity is linked to that existing account
  And I reach my existing workspace with all my client companies

Scenario: Returning Google user signs in
  Given I have signed in with Google before
  When I choose "Continue with Google" and approve access
  Then I am signed in and land on the post-login home screen

Scenario: User cancels the Google prompt
  Given I am on the sign-in screen
  When I choose "Continue with Google"
  And I dismiss the Google consent screen
  Then I stay on the sign-in screen
  And I see a message explaining that sign-in was not completed
```

## Notes

- Acceptance criteria and scope live in this description because the dedicated Jira custom fields are not configured in this workspace.
- Authentication runs on Supabase Auth; this story enables and configures its Google provider. Implementation detail — belongs in the implementation plan, not the acceptance criteria.
- Prerequisite: a Google Cloud OAuth client (credentials + authorized redirect URIs for local / staging / production).

---

## Fields

> Each rich-text field is a separate file in this folder.

- [Acceptance Criteria](./acceptance-criteria.md)
- [Business Rules](./business-rules.md)
- [Scope](./scope.md)
- [Out Of Scope](./out-of-scope.md)
- [Workflow](./workflow.md)
- [Mockup](./mockup.md)
- [Implementation Plan (Dev)](./implementation-plan.md)
- [Acceptance Test Plan (QA)](./acceptance-test-plan.md)
- [Acceptance Test Results (QA)](./acceptance-test-results.md)

---

## Metadata

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** auth, oauth

---

_Synced from Jira by sync-jira-issues_
