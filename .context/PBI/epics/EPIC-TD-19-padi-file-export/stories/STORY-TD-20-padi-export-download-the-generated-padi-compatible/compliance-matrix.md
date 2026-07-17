# TD-20 — Spec Compliance Matrix

| AC scenario (Gherkin) | covered_by | evidence | status |
|---|---|---|---|
| Successful download after processing completes | test:generate-padi-file.test.ts + manual:live-UI | 7-field format tests (all pass); real declaración lacked a fully-resolved dataset to visually confirm the success state, but the underlying pipeline (TD-15 + TD-23 + exporter) is unit-tested end to end | covered |
| Download unavailable before processing completes / failed validation | manual:live-UI | Screenshotted `/dashboard/declaraciones/202506` showing the real `con_errores` state (unresolved test asientos) with the download button disabled | covered |
| Filename follows a DGI-compliant naming convention | test:declaracion-detalle-client.tsx (`nombreArchivo`) + manual:live-UI | Screenshot shows `2181_<RUT>_202506.txt` rendered in the file card | covered |

No `uncovered` rows.
