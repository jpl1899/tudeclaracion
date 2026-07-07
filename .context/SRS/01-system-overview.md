# 01 — System Overview

> Estado: **esqueleto**. `.context/PRD/` todavía no está escrito (Phase 2 del flujo `/project-foundation` sigue pendiente) — este documento se completará con el detalle de personas, KPIs y alcance MVP formal una vez exista el PRD. Lo que sigue es lo confirmado hasta ahora vía Constitution (`business-model.md`), `ADR-0001` y la conversación de dominio.

## Propósito del sistema

tuDeclaracion.com automatiza la generación de declaraciones juradas de DGI (Uruguay) a partir de la información exportada del software contable **Memory**, produciendo un archivo de salida compatible con **PADI**. El sistema se diseña como **plataforma modular reutilizable** para múltiples declaraciones juradas — la DJ 2181 es la primera implementación (ver `ADR-0001-modular-reusable-tax-platform.md`).

## Actores

- **Contador** (cliente principal, ~22-65 años) — confecciona DJ 2181 para sus clientes.
- **Usuario sin contador** (cliente secundario) — genera su propia DJ 2181.

## Alcance del MVP

**Funcional/de release**: únicamente **Formulario 2181**. No ampliar el scope funcional del MVP a otros formularios DGI sin confirmación explícita del usuario (ver `.context/business/business-model.md`).

**Arquitectura**: diseñada desde el día uno para soportar formularios futuros sin rediseño (ver `ADR-0001`) — esto no expande el scope funcional del MVP, solo evita deuda técnica al construirlo.

## Flujo end-to-end (confirmado — `ADR-0001`)

```
Memory (software contable)
  → TXT mensual de asientos [PENDIENTE: formato de entrada no confirmado aún]
  → Upload Manager: recepción del archivo
  → Parser (05-parser.md): interpreta el TXT → modelo interno. NO calcula impuestos ni aplica reglas tributarias.
  → Normalizer: mapeo plan de cuentas → concepto fiscal (06-normalizer.md)
  → Validator: RUTs, mínimos DGI, importes (07-validator.md)
  → Tax Rules Engine: concepto fiscal → línea/código PADI (08-tax-engine.md, reglas en .context/tax-rules/)
  → Form Builder (2181): arma la declaración por formulario (09-forms.md)
  → Exporter: TXT de salida compatible con PADI (10-exporter.md) [CONFIRMADO — ver ese archivo]
```

> Nota: este orden (Validator antes del Tax Rules Engine) refina la descripción informal original en `business-model.md`, que mencionaba validaciones después del motor de reglas. Este pipeline es la versión vigente.

## Pendiente

- PRD completo (personas, KPIs, mvp-scope, user-journeys).
- Formato exacto del TXT de entrada de Memory.
- Reglas tributarias completas del 2181 (tax engine, ver `.context/tax-rules/2181/`).
