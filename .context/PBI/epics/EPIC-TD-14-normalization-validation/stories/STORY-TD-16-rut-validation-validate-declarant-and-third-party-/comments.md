# Comments for TD-16

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-16)

---

### Juan Leites - 7/7/2026, 20:04:38

## Acceptance Criteria

```gherkin
Feature: RUT format validation

  Scenario: Valid 12-digit RUT passes validation
    Given a RUT with exactly 12 numeric digits
    When the Validator checks the RUT
    Then it is accepted as valid

  Scenario: Wrong-length RUT is rejected with a clear error
    Given a RUT that does not have exactly 12 digits
    When the Validator checks the RUT
    Then it is rejected
    And the error message identifies which RUT failed and states the expected 12-digit length

  Scenario: Non-numeric RUT is rejected
    Given a RUT containing non-numeric characters
    When the Validator checks the RUT
    Then it is rejected
    And the error message identifies the RUT as invalid due to non-numeric content
```

---

### Juan Leites - 7/7/2026, 20:04:39

## Scope

- RUT length/format validation (exactly 12 numeric digits) for the declarant RUT.
- Same length/format validation for each third-party (counterparty) RUT appearing in the file.

---

### Juan Leites - 7/7/2026, 20:04:40

## Out Of Scope

- Verifier-digit (dígito verificador) checksum validation — the algorithm is explicitly unconfirmed per `Tax-rules/common/rut.md` ("especulativo / conocimiento general, no verificado"). Deferred until confirmed against an official DGI source, not silently dropped.
- Special-case treatment of non-resident RUTs — mentioned as pendiente in `rut.md`, not confirmed as applicable to the 2181.

---


_Synced from Jira by sync-jira-issues_
