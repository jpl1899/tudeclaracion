# User Journeys — tuDeclaracion.com

## Journey 1 — Happy Path: generar la DJ 2181 de un cliente

**Persona:** Rosana Ferreira (Contador, principal)
**Scenario:** Rosana ya tiene su cuenta creada, con la empresa "Cliente A" dada de alta y su plan de cuentas cargado. Es fin de mes y necesita presentar la DJ 2181 de ese cliente.

**Steps:**

1. **Login**
   - User Action: Rosana inicia sesión con su email y contraseña.
   - System Response: la deja en su panel, con la lista de empresas que gestiona.
   - Pain Point: si olvidó la contraseña, necesita un flujo de recuperación (US 1.4, a validar).

2. **Selección de empresa**
   - User Action: selecciona "Cliente A" de la lista.
   - System Response: el sistema queda "en contexto" de esa empresa (su RUT, su plan de cuentas).
   - Pain Point: si gestiona muchos clientes, elegir el correcto rápido importa — riesgo de generar la declaración para la empresa equivocada.

3. **Carga del archivo**
   - User Action: exporta el TXT desde Memory y lo sube a tuDeclaracion.com.
   - System Response: confirma la carga y arranca el procesamiento (Parser → Normalizer → Validator → Tax Rules Engine → Form Builder, transparente para el usuario).
   - Pain Point: si el archivo no es el formato esperado, necesita un mensaje claro (no solo "error").

4. **Procesamiento sin errores**
   - User Action: espera (procesamiento automático).
   - System Response: valida todo correctamente y genera el archivo de salida compatible con PADI.
   - Pain Point: si el procesamiento tarda, la sensación de "rapidez" (pilar del producto) se pierde — el tiempo total debe mantenerse bajo 5 minutos.

5. **Descarga**
   - User Action: descarga el archivo generado.
   - System Response: entrega el TXT listo para importar en PADI.

**Expected Outcome:** Rosana tiene el archivo compatible con PADI para el Cliente A, en menos de 5 minutos desde que subió el TXT, sin haber tenido que aplicar ninguna regla tributaria manualmente.

---

## Journey 2 — Edge Case: error de validación

**Persona:** Rosana Ferreira
**Scenario:** Rosana sube el TXT de "Cliente B", pero un RUT de un proveedor en el archivo tiene un formato inválido.

**Steps:**

1. **Carga del archivo** — igual que Journey 1.
2. **Procesamiento con error**
   - User Action: espera el procesamiento.
   - System Response: el Validator detecta el RUT inválido. El sistema **no genera el archivo de salida** y muestra un mensaje de error que identifica la línea/RUT problemático **junto con una guía clara de cómo corregirlo** (confirmado como requisito de MVP — no un error genérico).
   - Pain Point: si el mensaje no dice específicamente qué línea/dato falló, Rosana no puede corregir el archivo en Memory y volver a intentar — rompe la promesa de "rapidez y facilidad".
3. **Corrección y reintento**
   - User Action: corrige el dato en su sistema de origen (Memory) y vuelve a exportar/subir el archivo.
   - System Response: reprocesa desde cero.
   - Pain Point: no hay remediación automática en el MVP (confirmado, fuera de scope) — el contador debe corregir el archivo por su cuenta, aunque con la guía que el sistema le da.

**Expected Outcome:** Rosana entiende exactamente qué falló y cómo resolverlo, sin necesitar soporte humano.

**Alternative Paths / Edge Cases:**
- ¿Qué pasa si hay **más de un error** en el mismo archivo? Pendiente de confirmar: ¿se muestran todos juntos o de a uno? (abierto en `PRD/business-flow.md`).
- ¿El archivo se rechaza completo o se permite generar la declaración excluyendo solo la línea inválida? Pendiente — mismo abierto que en `SRS/07-validator.md`.

---

## Journey 3 — Edge Case: empresa sin plan de cuentas configurado

**Persona:** Rosana Ferreira
**Scenario:** Rosana acaba de dar de alta una empresa nueva ("Cliente C") y todavía no tiene su plan de cuentas cargado en el sistema (recordar: no hay UI de autoconfiguración en el MVP).

**Steps:**

1. **Selección de empresa nueva**
   - User Action: selecciona "Cliente C" para subir su primer archivo.
   - System Response: **pendiente de definir** — ¿el sistema le avisa antes de subir el archivo que falta el plan de cuentas, o falla recién en el paso de Normalización?
   - Pain Point: si el sistema no avisa temprano, Rosana pierde tiempo subiendo un archivo que no se va a poder procesar — contradice el pilar de "rapidez".
2. **Configuración asistida** (mecanismo exacto sin definir)
   - User Action: pendiente — ¿contacta soporte? ¿completa un formulario simplificado? ¿el equipo lo carga manualmente a pedido?
   - System Response: pendiente.

**Expected Outcome (deseado, no confirmado):** Rosana sabe de entrada que necesita configurar el plan de cuentas antes de procesar el primer archivo de una empresa nueva, y tiene un camino claro (aunque no autoservicio) para lograrlo.

**Pendiente de confirmar con el usuario:** este journey completo depende de decisiones aún no tomadas sobre el mecanismo de carga inicial del plan de cuentas (ver `mvp-scope.md` EPIC-TD-02 y `SRS/06-normalizer.md`). No fabricar el mecanismo — dejarlo abierto hasta que el usuario lo defina.
