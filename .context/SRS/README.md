# `.context/SRS/` — Software Requirements (Phase 2 — Software)

Outputs of `/project-foundation` Phase 2 — Architecture (Software side). Turns the PRD (`.context/PRD/`) into a technical contract that `/project-bootstrap` consumes to scaffold the codebase.

> **Structure override**: this project uses a custom 12-file granular structure (explicit user request, 2026-07-02) instead of the skill's default 4-file template. Each module of the DJ 2181 pipeline gets its own file. This supersedes the `functional-specs.md` / `non-functional-specs.md` / `architecture-specs.md` / `api-contracts.yaml` default below — kept here only as historical reference for what the skill normally generates.

## Actual files (custom structure, user-requested)

| File | Purpose |
| ---- | ------- |
| `01-system-overview.md` | System purpose, actors, MVP scope, end-to-end flow |
| `02-system-architecture.md` | Tech stack, architecture diagram (pending stack decision) |
| `03-modules.md` | Module index — maps to files 05-12 |
| `04-domain-model.md` | Core entities (RUT, Período, Línea PADI, Importe, Declaración) |
| `05-parser.md` | Memory input TXT → structured objects |
| `06-normalizer.md` | Cuenta contable → concepto fiscal (plan de cuentas per company) |
| `07-validator.md` | RUT/importe/línea validation rules |
| `08-tax-engine.md` | Concepto fiscal → línea/código PADI (the differentiator engine) |
| `09-forms.md` | Formulario 2181 line/code catalog |
| `10-exporter.md` | PADI-compatible output TXT format — **confirmed**, see file |
| `11-api.md` | API contract |
| `12-security.md` | Security/NFR requirements |
| `13-forms-1376.md` | **MVP 2 Track A** — DJ 1376 module: aggregation-by-account motor, mapping matrix, `CODIGO;MONTO` output. Structure seeded 2026-08-27; tax content `[PLACEHOLDER]`. See `ADR-0006`. |

Most files are still stubs (`Pendiente`) — populated incrementally as the user provides domain detail (tax rules, input TXT format, PADI code catalog).

> **2026-08-27 — MVP 2 Track A added `13-forms-1376.md`.** The `13-` file extends the custom structure for the second DGI form (1376). It stays a per-module file, consistent with the override above; the 1376 reuses `05-parser.md` and diverges downstream.

## Default template (superseded, kept for reference)

| File                       | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `functional-specs.md`      | Formal functional requirements — one section per epic, traceable to PRD stories |
| `non-functional-specs.md`  | Performance, security, scalability, reliability, accessibility NFRs           |
| `architecture-specs.md`    | System architecture diagram, tech stack rationale, data model, deployment topology |
| `api-contracts.yaml`       | OpenAPI 3.0 endpoint definitions per domain                                   |

Skill references that drive generation:
- `.claude/skills/project-foundation/references/srs-functional.md`
- `.claude/skills/project-foundation/references/srs-non-functional.md`
- `.claude/skills/project-foundation/references/srs-architecture.md`
- `.claude/skills/project-foundation/references/srs-api-contracts.md`

## Notes

- **Do not hardcode SQL schemas** — let `/project-bootstrap` introspect the live DB via the Supabase MCP and generate types from there.
- Architecture diagrams use Mermaid for inline visualization.
- The API contract here is the input; `bun run api:sync` generates TypeScript types from it into `api/schemas/`.

## When to re-run

- Major architecture change (new tech stack, new deployment topology)
- New NFR added (e.g. multi-tenancy, compliance requirement)
- API contract version bump

Otherwise, refined per epic during `/project-bootstrap`.
