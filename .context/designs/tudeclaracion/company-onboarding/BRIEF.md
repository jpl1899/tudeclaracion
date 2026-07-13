# Design brief — tuDeclaracion / company-onboarding
Tool session: CONTINUE project "tuDeclaracion" (Open Design) — mode FOLLOW-UP

## Mission
Design 1 screen for tuDeclaracion. We describe WHAT the screen must accomplish;
HOW it looks is your call — layout, composition, hierarchy, component choices, and
micro-interactions are fully delegated to you. Your only hard boundary is the design
contract below: never invent colors, fonts, or spacing values outside it.
When done, export and return the files as described in "Export & return".

## Frozen design contract (non-negotiable)
- Same design system as the previous screens in this project (login, dashboard, company-select, signup, forgot-password, reset-password); keep full visual consistency with them. The established tokens still govern.

## Screens requested

### 1. company-onboarding — Agregar nueva empresa
- Route: /empresas/nueva (or a modal/step over `/empresas` — your call, follow the existing "Agregar nueva empresa" entry point in company-select)
- Purpose: replaces the current placeholder `alert()` behind the "Agregar nueva empresa" card on `/empresas`. Lets an accountant add a new client company AND, in the same flow, define that company's chart-of-accounts-to-fiscal-concept mapping (this second part is a scope addition confirmed 2026-07-12 — see below).
- User stories: TD-8 — Company Onboarding: Add a new client company (AC1: happy path, AC2: duplicate RUT rejection, AC3: required-field validation). TD-7 — Chart of Accounts: Load the initial account-to-fiscal-concept mapping (folded into this same flow, self-service).

#### Part A — Company identity (TD-8)
- Fields: RUT (required), Nombre de la empresa (required).
- The user must be able to: enter both fields and confirm to create the company; see a specific error if the RUT is already registered under their account (no company created); see a validation message identifying which field is missing if either is left empty.
- States: default (empty form) / duplicate-RUT error (specific message, no company created) / required-field error (identifies which field) / success (company created, appears immediately back on `/empresas`).

#### Part B — Chart of accounts (TD-7, same flow)
- This is a **fixed catalog of 5 rows**, not a free-form table — the accountant only fills in ONE value per row (the account number), everything else is pre-defined by the system:

| # | Tipo (fixed, shown as label) | Tasa (fixed, shown as label) | Campo que completa el contador |
|---|---|---|---|
| 1 | IVA Compras | 10% (mínima) | Número de cuenta contable |
| 2 | IVA Compras | 22% (básica) | Número de cuenta contable |
| 3 | IVA Ventas | 10% (mínima) | Número de cuenta contable |
| 4 | IVA Ventas | 22% (básica) | Número de cuenta contable |
| 5 | Compra Exenta | 0% | Número de cuenta contable |

- Present this as 5 rows in a simple list/table, each showing its fixed tipo+tasa as a label (not editable) plus ONE input field for the account number. Think "fill in the blanks next to 5 fixed labels", not a dynamic add/remove table.
- A short explanatory line above this section should tell the accountant this maps their own chart of accounts to the DGI-standard tax lines used by the 2181 form.
- All 5 fields can reasonably be required, but your call on whether to allow submitting with some blank (open question — pick the safer default: require all 5, since the engine needs all of them to resolve the tax lines correctly).

## Hard constraints
- Name the screen file/frame exactly `company-onboarding` — the repo maps files by slug.
- No new tokens. A value not in the frozen contract is a defect, not a creative choice.
- Do not invent additional chart-of-accounts rows or make the 5-row structure dynamic/addable — it's a fixed catalog, confirmed with the product owner.
- Reuse existing form patterns (labeled inputs, 52px touch targets, inline error panels) already established across login/signup/forgot-password.

## Export & return
**Open Design** (local app — `http://localhost:7456` once the Docker stack is up): open the same
project you used for login/dashboard/company-select/signup/forgot-password/reset-password, paste
this brief into the Discover question form / brief field. Iterate until satisfied. The app writes
artifacts to `./.od/artifacts/<timestamp>-<slug>/` (HTML/PDF/PNG). Copy the final artifacts you
consider canonical into `.context/designs/tudeclaracion/company-onboarding/` in this repo.

When the files are in place, come back to the agent session and confirm — the screen-mapping
phase resumes automatically (session checkpoint is waiting).
