# Contextual help (Ayuda) — design

- **Date**: 2026-10-18
- **Status**: Approved in conversation, pending spec review
- **Design fidelity (Rule 14)**: no mockup. Spec-only rework of the existing Ayuda screen (`DashboardShell` + `Card`), recorded in `.context/design/master-design-plan.md` §5 (amends D11 scope).

## Problem

Ayuda covers one case (the 1376 header line); 2181, 2183 and 1050 say "Contenido en preparación". The app shows ~30 distinct messages (parser field errors, import rejections, excluded entries, 1376 mapping rules and warnings, special situations) with no explanation of cause or fix. The importer's "Consultá el módulo Ayuda" points to the page, not to the relevant answer. A user manual is planned (scope undefined), so help content must be reusable outside the app.

## Decisions

1. **Organised by topic**, not by form.
2. **Content lives in Markdown files** under `content/ayuda/`, separate from screen code, so a future manual can reuse the same sections without rewriting.
3. **Every in-app message links to its exact explanation** through a heading anchor.
4. Help explains **how the app behaves**, not tax criteria. Any text that touches fiscal judgement carries `<!-- revisar contador -->` (invisible on screen).

## Content files

| File | Covers |
|---|---|
| `01-primeros-pasos.md` | End-to-end flow: create company → chart of accounts → 1376 mapping → import TXT → review → download PADI. Active company and how to switch. |
| `02-archivo-txt.md` | One entry per column (format, valid values, example): Día, Debe, Haber, Concepto, RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro, Tipo. 2181 reads by position (plus declared special columns); 1376 reads by header title (canonical header line, RUC = RUT). |
| `03-errores-al-importar.md` | Each importer message → cause → fix: unknown / repeated / missing header title, field count mismatch, each invalid field, Libro inconsistent with the account (2… sale, 1… purchase), "N campos inválidos a la vez" (columns out of order), period already processed, more than 20,000 lines, BCU rate unavailable, generic save failure. |
| `04-asientos-excluidos.md` | The five exclusion reasons shown on the 2181 detail (sin mapeo, tipo fuera de alcance, importe cero, libro inconsistente, RUT inválido) and what to fix in the TXT or the chart of accounts. |
| `05-mapeo-1376.md` | Mapping rules (account or IVA code, side, one line code each, IVA code 1–9), unmapped account / IVA code warnings, "Todavía no hay datos" and "No pudimos calcular el 1376". |
| `06-situaciones-especiales.md` | USD entries and the BCU rate (previous business day; cotización 0), negative results warning, replacing or deleting a period, the 20,000-line limit. |

Every message text quoted in these files must match the code verbatim (copied from `parse-asientos.ts`, `importar-asiento-dialog.tsx`, `dashboard-client.tsx`, `declaracion-detalle-client.tsx`, `mapeo-1376.ts`, `revision-1376-client.tsx`).

**Anchors**: headings declare a stable id with a trailing `{#id}` (e.g. `### RUT {#campo-rut}`); the id is stripped from the visible text. Ids never depend on heading wording, so copy edits do not break links.

## Screen `/dashboard/ayuda`

- One long page: section index on the left from `md` (stacked above on mobile), all sections below, readable top to bottom and searchable with `Ctrl+F`. Keeps the "← Volver a Inicio" link and `DashboardShell`.
- Server Component reads `content/ayuda/*.md` (sorted by file name) with `fs` at request time; deploy uses `next start` without `output: 'standalone'`, so the folder is present at runtime. Render with `react-markdown` + `remark-gfm` (tables). Element mapping uses the app's existing typography; headings get their `{#id}`; tables scroll horizontally on narrow screens.
- No raw HTML rendering (`rehype-raw` not used): `<!-- -->` comments are dropped, anything else stays as text.
- Legacy link `/dashboard/ayuda?formulario=1376` redirects to `/dashboard/ayuda#encabezado-1376`; any other `formulario` value redirects to `/dashboard/ayuda`.

## Links from the app

A single module `src/modules/ayuda/anclas.ts` owns every anchor id and the field → anchor map, so links and content stay in sync (a unit test asserts every anchor exists in the Markdown).

| Where | Link target |
|---|---|
| Importer: each invalid field ("Campo RUT: …") | `#campo-<field>` per field |
| Importer: "N campos inválidos a la vez" | `#columnas-desordenadas` |
| Importer: period already processed | `#reemplazar-periodo` |
| Importer: BCU rate unavailable | `#dolares-y-cotizacion` |
| Importer + detail: negative results banner | `#resultados-negativos` |
| Importer: missing 1376 header warning | `#encabezado-1376` |
| 2181 detail: excluded entries | `#asientos-excluidos` |
| 1376 review: warnings and errors | `#mapeo-1376` |

Links render as "Ver ayuda" next to the message, opening `/dashboard/ayuda#…` in the same tab.

## Out of scope

2183 / 1050 content (forms not built), in-app search, screenshots, the manual itself, help outside the dashboard (login, signup).

## Testing

- Unit: `{#id}` heading parser (with id, without id, extra spaces).
- Unit: every anchor in `anclas.ts` appears exactly once across `content/ayuda/*.md`; every parser field has an anchor.
- Types, lint, full suite, `next build`.
- Browser: each section renders; tables readable on mobile; each "Ver ayuda" lands on its heading; `?formulario=1376` redirects to the 1376 header section.

## Risks

- Help text drifting from code messages: mitigated by quoting messages verbatim and the anchor test; any change to a user-facing message should update its help entry in the same PR.
- New dependencies: `react-markdown`, `remark-gfm`.
