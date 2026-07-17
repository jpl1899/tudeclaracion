# TD-12 — Spec Compliance Matrix

| AC scenario (Gherkin) | covered_by | evidence | status |
|---|---|---|---|
| Successful upload confirmation shown | manual:live-UI | Screenshotted the "Carga exitosa" confirmation after a real upload against the running dev server | covered |
| Upload failure shown distinctly | manual:live-UI | Screenshotted the error banner (form stays open/editable) for a malformed file — visually and textually distinct from the success panel | covered |
| Confirmation includes filename and timestamp | manual:live-UI | Screenshot shows the exact uploaded filename + `toLocaleString('es-UY')` timestamp | covered |

No `uncovered` rows.
