# Comments for TD-15

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-15)

---

### Juan Leites - 7/7/2026, 20:04:35

Blocked — depends on chart-of-accounts mechanism (TD-7) and normalizer mapping rules (`06-normalizer.md`), not yet defined.

---

### Juan Leites - 7/7/2026, 20:04:36

## Scope

- Accounting entries carry a resolved fiscal concept before reaching validation (capability-level only; no mapping mechanism implied).

---

### Juan Leites - 7/7/2026, 20:04:37

## Out Of Scope

- Manual override of an automatic mapping (future consideration, not sourced from any FR).

---

### Juan Leites - 16/7/2026, 16:37:37

## Acceptance Criteria

```gherkin
Scenario: Código IVA directo con cuenta configurada resuelve por Camino 1

  Given una empresa tiene en su plan de cuentas una fila con Código IVA "3" → código PADI "502"
    And un asiento parseado (TD-13) trae Código IVA "3" y Tipo vacío
   When el Normalizer resuelve el asiento
   Then la línea resuelve a código PADI "502", tomando el importe de la columna IVA
```

```gherkin
Scenario: Código IVA directo sin cuenta configurada no resuelve

  Given una empresa NO tiene ninguna fila con Código IVA "7" en su plan de cuentas
    And un asiento parseado trae Código IVA "7" y Tipo vacío
   When el Normalizer resuelve el asiento
   Then la línea queda sin mapeo — no genera código PADI, no bloquea el resto del archivo
```

```gherkin
Scenario: Asiento de compra con Código IVA en 0 resuelve por Camino 2 (cuenta del Debe)

  Given una empresa tiene en su plan de cuentas la cuenta contable "5215" → código PADI "504"
    And un asiento parseado trae Código IVA "0", Libro "C" y campo Debe "5215"
   When el Normalizer resuelve el asiento
   Then la línea resuelve a código PADI "504", tomando el importe de la columna Total
```

```gherkin
Scenario: Asiento de venta con Código IVA en 0 resuelve por Camino 2 (cuenta del Haber)

  Given una empresa tiene en su plan de cuentas la cuenta contable "4110" → código PADI "506"
    And un asiento parseado trae Código IVA "0", Libro "V" y campo Haber "4110"
   When el Normalizer resuelve el asiento
   Then la línea resuelve a código PADI "506", tomando el importe de la columna Total
```

```gherkin
Scenario: Camino 2 sin la cuenta configurada no resuelve

  Given una empresa NO tiene la cuenta contable "9999" en su plan de cuentas
    And un asiento parseado trae Código IVA "0", Libro "C" y campo Debe "9999"
   When el Normalizer resuelve el asiento
   Then la línea queda sin mapeo — no genera código PADI, no bloquea el resto del archivo
```

```gherkin
Scenario: Tipo "504" tiene prioridad y no consulta el plan de cuentas

  Given un asiento parseado trae Tipo "504", Código IVA "3" y Total "1500"
   When el Normalizer resuelve el asiento
   Then la línea resuelve directo a código PADI "504" con el importe de la columna Total, sin consultar el plan de cuentas de la empresa
```

```gherkin
Scenario: Tipo alfabético no soportado queda fuera de alcance

  Given un asiento parseado trae Tipo "CIE" (o "RES"/"DIF"/"APE")
   When el Normalizer resuelve el asiento
   Then la línea queda fuera de alcance — no genera código PADI, no bloquea el resto del archivo
```

```gherkin
Scenario: Libro "P" con Código IVA en 0 queda fuera de alcance

  Given un asiento parseado trae Código IVA "0", Tipo vacío y Libro "P"
   When el Normalizer resuelve el asiento
   Then la línea queda fuera de alcance — no se define a qué campo (Debe/Haber) consultar para Libro "P", no bloquea el resto del archivo
```

## Business Rules Specification

1. ***Prioridad de resolución*** (evaluada en este orden por asiento): (a) `Tipo = "504"` → código PADI "504" directo, importe = Total; (b) `Tipo` alfabético no soportado (`CIE`/`RES`/`DIF`/`APE`) → fuera de alcance, no se procesa; (c) `Código IVA > 0` (Camino 1) → busca `Código IVA` en el plan de cuentas de la empresa, importe = IVA; (d) `Código IVA = 0` y `Tipo` vacío (Camino 2) → busca la cuenta contable (Debe si Libro ∈ {C,E}, Haber si Libro ∈ {V,I}) en el plan de cuentas, importe = Total.
2. ***Libro = "P" en Camino 2***: no definido — la línea queda fuera de alcance (mismo tratamiento que "sin mapeo") hasta que se confirme qué representa y qué campo mirar.
3. ***Sin mapeo configurado*** (Camino 1 o 2 sin fila coincidente en el plan de cuentas de la empresa): la línea se ignora — no bloquea el archivo, no genera cola de revisión manual.
4. ***Alcance de TD-15****: resuelve ****por línea***, directo a código PADI (no hay "Nombre de Impuesto" intermedio — `plan_cuentas` ya lo persiste así desde TD-7). La consolidación de líneas por RUT+código PADI en la declaración final es responsabilidad de una historia posterior (no de TD-15).
5. ***RUT de 12 dígitos***: ya garantizado por el parser (TD-13) — no es una validación adicional de TD-15.

## Spec Implementation Plan (Dev)

***Scope***: pure resolver function, no schema changes, no UI, no RPC — `plan_cuentas` (TD-7) and `asiento`'s shape (TD-13) already cover the data this story needs. TD-15 is a leaf module later stories (PADI export) will import.

***New file***: `src/modules/normalizer/normalize-asiento.ts`

```ts
export interface PlanCuentaRow {
  cuentaContable: string
  codigoPadi: string
  codigoIva: number | null
}

export type NormalizedAsiento =
  | { resolved: true, codigoPadi: string, importe: number, rut: string }
  | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'libro-fuera-de-alcance' | 'sin-mapeo' }

export function resolveAsientoFiscal(
  asiento: AsientoLine,
  planCuentas: PlanCuentaRow[],
): NormalizedAsiento
```

***Algorithm*** (mirrors Business Rules §1, in order):

1. `tipo === '504'` → `{ resolved: true, codigoPadi: '504', importe: total, rut }`.
2. `tipo` is a non-null, non-`'504'` value (`CIE`/`RES`/`DIF`/`APE`) → `{ resolved: false, reason: 'tipo-fuera-de-alcance' }`.
3. `codigoIva > 0` → find `planCuentas` row where `codigoIva === asiento.codigoIva`; found → `{ resolved: true, codigoPadi: match.codigoPadi, importe: iva, rut }`; not found → `{ resolved: false, reason: 'sin-mapeo' }`.
4. `codigoIva === 0` (tipo empty): `libro` ∈ `{C, E}` → `cuenta = debe`; `libro` ∈ `{V, I}` → `cuenta = haber`; `libro === 'P'` → `{ resolved: false, reason: 'libro-fuera-de-alcance' }`. Otherwise find `planCuentas` row where `cuentaContable === cuenta`; found → `{ resolved: true, codigoPadi: match.codigoPadi, importe: total, rut }`; not found → `{ resolved: false, reason: 'sin-mapeo' }`.

***Fetching ***`planCuentas`: caller's responsibility (this function stays pure/testable, no Supabase import) — the future export story queries `plan*cuentas` for the `empresa*id` once and passes the array in, same shape `crear*empresa*con*plan*cuentas`'s RPC already writes.

***Tests***: one `.test.ts` per Business Rule scenario above (8 cases) + the `libro='P'`/Camino 2 edge covered explicitly, following TD-13's `parse-asientos.test.ts` style (Vitest, no mocks needed — pure function).

***Out of scope, explicit***: RUT+código grouping/consolidation into declaration lines (future story), any UI, any DB write/migration, and reconciling TD-22/23's scope (flagged separately, not blocking this story).

---


_Synced from Jira by sync-jira-issues_
