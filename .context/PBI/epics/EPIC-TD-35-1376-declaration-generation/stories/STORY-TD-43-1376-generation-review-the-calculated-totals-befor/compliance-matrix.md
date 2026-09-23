# TD-43 — Spec Compliance Matrix

PR #38. Generated at Stage 3 (2026-09-23). One row per Gherkin scenario in the story AC (5 scenarios).

| AC scenario (Gherkin) | covered_by | evidence | status |
| --- | --- | --- | --- |
| Scenario: Clean result | manual:evidence/manual-evidence.md#clean-result | `evidence/td43-sin-advertencia-fenix-202509.png` — no warning, download enabled. Per-code amounts: `src/modules/generacion-1376/calcular-totales-1376.test.ts` (TD-41); no live row rendered because no empresa has a `mapeo_1376` yet | manual |
| Scenario: Result with unmapped accounts | manual:evidence/manual-evidence.md#unmapped-accounts | `evidence/td43-advertencia-reconocida-recoba-202603.png`; download `disabled` true → false after acknowledging. Detection logic: `src/modules/validaciones-1376/detectar-cuentas-sin-mapear.test.ts` (6 cases) | manual |
| Scenario: No data yet | manual:evidence/manual-evidence.md#no-data | Rendered text for Recoba 209912 captured in `manual-evidence.md` | manual |
| Scenario: Calculation error | exempt:the error state only renders when a Supabase read/insert fails; it cannot be induced against the shared dev database without a destructive change (revoking grants or dropping a table), and the server-side fetch cannot be intercepted from the browser | `src/app/dashboard/declaraciones-1376/[periodo]/page.tsx` — every Supabase error path returns `fallo(...)` → `{ tipo: 'error' }`; `revision-1376-client.tsx` renders `revision_1376_error` with no totals and no download button. The calculation itself (`calcularTotalesLinea1376`, `detectarCuentasSinMapear`) is pure arithmetic and cannot throw | exempt |
| Scenario: Aggregation is stated | manual:evidence/manual-evidence.md#aggregation-stated | `revision_1376_agregacion` present on every result render; visible in both screenshots | manual |

**Gate:** 5/5 rows have evidence, 0 `uncovered`.
