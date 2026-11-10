# Accountant answers — 2026-11-09

Answers to `preguntas-contador-2026-11-09.md` (relayed by the user). Quotes in Spanish are verbatim. Rows marked **Interpretation** must be confirmed before implementing.

| # | Question | Answer | Impact |
|---|---|---|---|
| 1 | Real TXT files filed in PADI (2181, 1376) | "Pendiente de contador archivo txt que alimente al motor para poder seguir con los ejemplos de la 1376." | Still pending delivery. Blocks the 1376 real-data examples of the test plan. |
| 2 | Rural companies: one TXT for several months? | "No te preocupes de ese punto ahora." | Deferred. Nothing to build. |
| 3 | Do `DIF` asientos count for the 1376? | "Solo toma en cuenta si aparece un número como por ejemplo 504 que es compras exentas para la 2181, si aparecen letras omití ese valor." | Rule: a numeric Tipo (`504`) counts; any alphabetic Tipo (`CIE`, `RES`, `DIF`, `APE`) is omitted. The 2181 already does this. **The 1376 does not**: `TIPOS_FUERA_DEL_MOTOR` in `calcular-totales-1376.ts` lacks `DIF`. Code change needed. |
| 4 | What decides the 1376 code by taxpayer type (IRAE 108/126/128, IPAT 328/320/323, surcharge 335/330/333)? | "El usuario tendrá un botón, un comando donde diga declaración 1050 y ahí se podrá distinguir en la configuración que tiene el mapeo correspondiente para que no se pise con la otra declaración jurada." | **Interpretation**: the engine applies no taxpayer-type rule; the code comes from the user's mapping. The 1050 gets its own entry point and its own mapping in the company setup, separate from the 1376 mapping. Confirm that this also answers the 1376 code-selection question. |
| 5 | Counterparts without RUT in the 2181 | "Solo se declaran RUTs uruguayos, sujetos pasivos de impuestos uruguayos únicamente, ni cédulas ni documentos extranjeros ni nada, solo RUTs." | Current behavior is correct: an asiento without a valid RUT is excluded ("sin RUT"). Closes the question. |
| 6 | DGI web services (RUT lookup, Certificado Único) | "Lo sabemos pero por el momento no lo vamos a implementar en el motor." | Out of scope for now. |
| 7 | Which 2183 lines do the clients use? | "Usan esa." | The official table in `2183/lineas.md` is the catalog. **Interpretation**: the whole visible table, not a subset. |
| 8 | How an asiento maps to a 2183 line | "Se decide con la misma lógica que la configuración que tiene la 2181 y la 1376 con el mapeo inicial que hace el cliente con el código de formato rápido de IVA, la cuenta contable y el código PADI." | Reuse the existing setup pattern: Código IVA + account + código PADI, per company. |
| 9 | 2183 periodicity | "Es mensual sí." | Monthly, like the 2181 and the 1376. Fits the period view. |
| 10 | Does Rubro 2 (amounts without breakdown) apply? | "Para la 2181 solo usan rubro 5 y por tanto al subir al PADI aparece automático rubro 2. Rubro 2 que vendría a ser totales se usa para la 1376 y para las 2 siguientes declaraciones." | 2181: Rubro 5 only (no change). **Interpretation, critical**: the 2183 and the 1050 are filed as **totals per line** (`linea;importe`, like the 1376), not as detail per RUT. This changes the 2183 design: the research note assumed the 2181 per-RUT layout. Confirm before designing the 2183. |
| 11 | Can the 2183 informed party have a CI or NIE? | "No puede, solo contribuyentes locales con RUT." | Only RUT. If answer 10 means totals only, there is no per-RUT data in the 2183 at all — confirm together with #10. |
| 12 | 1050 scope | "Lo queremos en primera instancia con los anticipos que es lo más correcto pero preferiblemente lograr completarlo." | Phase 1: advances block (901–906, 308, 343, 365). Phase 2 (preferred): the full form. |
| 13 | 1050 data source | "Evaluaremos la posibilidad de subir un consolidado de 12 meses en un solo archivo y que el sistema logre resolver la cuestión." | Not decided. Working hypothesis: one 12-month consolidated TXT. Open: does the advances block come from that TXT or from the 12 monthly 1376 already generated? |
| 14 | Fiscal year closing month per company | "Cada empresa tiene su cierre pero no depende para nada de las declaraciones juradas hacia PADI con el motor de tudj, no lo tengas en cuenta." | No closing-month setting. Ignore it. |
| 15 | Contable vs. fiscal values | "Los valores TODOS salen siempre del TXT que sube el cliente, si alguien va a tocar a mano va a ser el cliente con el archivo que le devuelve el motor que ya excede la capacidad de tudj." | Every value comes from the TXT, through the mapping. No manual input in the app; the client edits the output in PADI if needed. |
| 16 | Owned properties in the 1050 | "Sí por supuesto y es parte del mapeo correspondiente que va a tener en la configuración del usuario." | In scope. Properties block (`TIPO`, `DEPARTAMENTO`, `LOCALIDAD`, `PADRON`, `BLOCK`, `ENTSUB`, `UNIDAD`, `PORCENTAJE`) is set up per company in the 1050 configuration. |

## Follow-up questions

1. (#10, #11) Is the 2183 filed only as totals per line (`linea;importe`), with no per-RUT detail?
2. (#4) In the 1376, the code per taxpayer type (e.g. IRAE 108 vs 126 vs 128) is simply what the user maps, right?
3. (#13) For the 1050 advances: are they computed from the 12-month TXT, or by adding up the 12 monthly 1376 already generated?

### Follow-up answers (same day)

| # | Answer | Impact |
|---|---|---|
| #3 (Tipo) | "Con el tipo CIE RES DIF, valores que veas que son alfabéticos, eso no lo tengas en cuenta, nada más." | Confirmed as a general rule: **any alphabetic Tipo is ignored** by the engine, not only the four known ones. Today the parser rejects a Tipo outside `504/CIE/RES/DIF/APE`, and the 1376 still counts `DIF`. |
| 1 | "El diseño va a ser el mismo, sin apertura y con el código correspondiente ';' total. El 2183 va sin detalle por RUT." | Confirmed: the 2183 output is `codigo;total`, like the 1376. No per-RUT detail, so #11 has no effect. Supersedes the per-RUT layout in `2183/README.md`. |
| 2 | "En el 1376 los códigos que hacés referencia es simplemente mapeo del usuario exacto." | Confirmed: no taxpayer-type rule in the engine. The code is exactly what the user maps. Closes the open question in `1376/open-questions.md`. |
| 3 / #1 | "Sigue pendiente, lo tengo que preparar y ahí están abarcados los siguientes casos de la 1376 para completar dicha declaración y pasar a las otras 2." | The accountant is preparing a TXT that covers the remaining 1376 cases. Order: finish the 1376 with it, then the 2183 and the 1050. The 1050 advances source (#13) stays open until then. |
