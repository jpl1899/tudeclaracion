# Accountant answers — review session (2026-10-26)

Answers given by the accountant (relayed by the user) to the open questions listed on 2026-10-26. Quotes in Spanish are verbatim.

| # | Question | Answer | Impact |
|---|---|---|---|
| 1 | The 1376 file uses codes 101–601, but the decompiled PADI form uses other line numbers (L8, L11…) | "Solo tener en cuenta los códigos que van del 101 a 601." | No change. The seeded `codigo_linea_1376` catalog stays the only source. Closes the 2026-09-29 open question in `1376/open-questions.md`. |
| 2 | Libro inconsistent with the resolved account: reject the file or exclude the asiento (TD-51) | Asked for a clearer explanation of the idea | Pending — re-ask with a worked example. |
| 3 | 1376 line code whose total is exactly 0 | "Se omite si el valor es 0." | Exporter omits codes whose **rounded** amount is 0 (`generate-padi-file-1376.ts`). |
| 4 | Real TXT files already filed in PADI with their result (2181 and 1376) | Yes, will provide | Pending delivery — base for the test plan (`.context/plan-de-pruebas.md`). |
| 6 | "Rurales": asiento period vs. declaration period | "Un caso de rural es por ejemplo un año completo de 12 meses o bien un período de 4 meses." | Recorded. Open follow-up: does a rural company upload one TXT covering several months, and which period does the declaration carry? Not implemented. |
| 7 | Meaning of Tipo `CIE`, `RES`, `APE` | CIE = cierre, RES = resultados, APE = apertura. "No tenerlos presentes para el cálculo del motor." | The 2181 already excluded them. The 1376 engine now drops them before totals and unmapped warnings (`asientosDelMotor1376`). `DIF` still counts in the 1376 — to confirm. |
| 8 | RUT check digit validation | "En esta versión no existirá un validador de RUT; en siguientes versiones pensamos implementarlo." | Keep the 12-digit format check only. |
| 9 | Does the app compute the 1376 balance due (lines 322/970–972)? | "Solo entrega los totales por código como hoy." | No change. Closes the deferred question. |
| 10 | Where do the year-to-date sales/purchases and the IPAT/ICOSA advance type come from? | "Salen del propio TXT." | Recorded. With answer 9 (totals only) nothing to build now; revisit if those lines ever enter the mapping. |
| 11 | Scope: no-movement DJ, agro, IVA en suspenso | IVA en suspenso has a 2181 code but is not implemented in this version. Agro is included like industry, commerce and construction. | No special agro handling. IVA en suspenso out of scope for this version. |

## Next declarations

The user confirmed the remaining two declarations are **2183** and **1050** and shared DGI search links. Research notes: `2183/README.md`, `1050/README.md`.
