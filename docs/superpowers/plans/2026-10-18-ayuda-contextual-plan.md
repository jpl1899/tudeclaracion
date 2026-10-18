# Contextual help — implementation plan

Spec: `docs/superpowers/specs/2026-10-18-ayuda-contextual-design.md`. Branch `feat/ayuda-contextual` off `staging`, one PR.

1. **Anchor module + heading parser (TDD)** — `src/modules/ayuda/anclas.ts` (anchor ids, field → anchor map), `src/modules/ayuda/titulo-con-ancla.ts` (`{#id}` parser). Tests first. verify: unit tests green.
2. **Content** — read the message sources (`parse-asientos.ts`, `importar-asiento-dialog.tsx`, `dashboard-client.tsx`, `declaracion-detalle-client.tsx`, `mapeo-1376.ts`, `revision-1376-client.tsx`, `normalize-asiento.ts`, `calcular-totales-1376.ts`, cotización modules) and write `content/ayuda/01…06-*.md`, quoting messages verbatim; mark fiscal-judgement text `<!-- revisar contador -->`. verify: anchor coverage test green.
3. **Rendering** — `bun add react-markdown remark-gfm`; content loader (`fs`, sorted) + `AyudaMarkdown` component mapping elements to app typography; rewrite `/dashboard/ayuda` (index + sections, legacy `?formulario` redirects). verify: types + lint.
4. **Links** — "Ver ayuda" next to each message in importer, 2181 detail and 1376 review, using `anclas.ts`. verify: types + lint.
5. **Design plan + gate** — §5 note; `bun run test`, `types:check`, `lint:check`, `next build`. verify: all clean.
6. **Browser check** by the user (CAPTCHA blocks automated login) — then commit, push, PR after OK.
