# Comments for TD-20

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-20)

---

### Juan Leites - 7/7/2026, 20:18:55

## Acceptance Criteria

```gherkin
Feature: Download the generated PADI-compatible file

  Scenario: Successful download after processing completes
    Given the declaration for the active company/period has finished processing without errors
    And the PADI TXT file has been generated
    When Rosana clicks "Descargar archivo PADI"
    Then the browser downloads the generated TXT file
    And the file content matches the 7-field PADI structure confirmed in SRS/10-exporter.md
      (RUT declarante; número de declaración; período; RUT tercero; añomes; código PADI; importe)

  Scenario: Download unavailable before processing completes
    Given the declaration for the active company/period is still processing, or processing failed validation
    When Rosana views the declaration screen
    Then the "Descargar archivo PADI" action is disabled or not shown
    And no PADI file is generated or offered for download

  Scenario: Filename follows a DGI-compliant naming convention
    Given the PADI file has been generated for a given company, period and declaration type
    When Rosana downloads the file
    Then the filename identifies the declaration type (2181), the RUT of the declarant, and the period (AAAAMM)
    And the file extension is .txt
```

---

### Juan Leites - 7/7/2026, 20:18:56

## Scope

- Generating the PADI-format TXT file from the fully-processed declaration data, following the 7-field structure confirmed in `SRS/10-exporter.md`.
- Triggering and serving the file download once processing completes without errors.

---

### Juan Leites - 7/7/2026, 20:18:58

## Out Of Scope

- Automatic submission of the PADI file to DGI. `mvp-scope.md` confirms the MVP is download-only (US 6.1: "quiero descargar el archivo TXT generado... para importarlo directamente en el sistema de DGI" — the import into PADI/DGI is a manual step the accountant performs outside this system; no DGI API integration is listed anywhere in `mvp-scope.md`'s in-scope epics).
- Re-generating a file for a past declaration period from history — that belongs to EPIC-TD-07 (Historial y Gestión de Declaraciones).

---


_Synced from Jira by sync-jira-issues_
