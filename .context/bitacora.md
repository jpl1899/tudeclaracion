# Bitácora — tuDeclaracion.com

> Registro diario de lo hecho en el proyecto, para tener un panorama claro. Hand-maintained, append-only: se agrega una entrada por día trabajado (la más reciente arriba). Las entradas previas al 2026-11-03 se reconstruyeron desde el historial de git (desde 2026-10-01; lo anterior está en `git log`).
>
> Pendientes de producto y negocio más amplios → `open-questions.md`.

---

## Pendientes de confirmar con el contador

| # | Tema | Pregunta | Contexto |
|---|------|----------|----------|
| 1 | Validación del RUT | ¿Los contadores validan el dígito verificador del RUT? ¿Con qué herramienta o método? ¿Conocen casos de RUT válidos que una validación casera rechace? | La DGI declaró **reservado** el algoritmo oficial (Resolución DGI N.º 836/2024, expediente MEF 2024-5-1-0002222). Existe un algoritmo deducido por terceros (pesos 4,3,2,9,8,7,6,5,4,3,2, módulo 11; un resultado de 10 lo invalida), que coincide con el RUT de ejemplo de la DGI (`219000090011`), pero no es oficial. **Ya respondida** (2026-07-17 y 2026-10-26): en esta versión no habrá validador de RUT, solo el formato de 12 dígitos; lo piensan para versiones siguientes. No volver a preguntar. |
| 2 | Web services de la DGI | ¿Le sirve al contador que el sistema autocomplete la razón social y el domicilio desde el RUT, muestre el nombre de las contrapartes de los asientos y avise si una empresa tiene el Certificado Único vencido? | La DGI ofrece 3 servicios SOAP: Datos de entidad, Nombre de la entidad y Certificado Único (CVA). Requieren un certificado de persona jurídica de PKI Uruguay (Abitab o Correo) y firmar cada pedido con WS-Security. Además, la autorización depende de cada servicio, así que probablemente haya que gestionar una habilitación con la DGI. Es viable recién cuando el proyecto tenga persona jurídica. Fuente: https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/servicios-automatizados |

---

## 2026-11-09

- **El contador volvió al proyecto.** Se pueden retomar los pendientes de confirmar con él.
- Lista de preguntas para el contador (pendientes, RUT, 2183 y 1050): `Tax-rules/preguntas-contador-2026-11-09.md`.
- El contador respondió las 16 preguntas: `Tax-rules/contador-respuestas-2026-11-09.md`. Repreguntas respondidas: el 2183 va con `codigo;total` sin detalle por RUT (como el 1376); los códigos del 1376 son solo el mapeo del usuario; todo Tipo alfabético se ignora. El contador prepara un TXT con los casos que faltan del 1376; después siguen el 2183 y el 1050.
- Hallazgo: el 1376 cuenta los asientos de tipo `DIF` y debería omitirlos (regla del contador: un Tipo con letras se omite).
- La API de la DGI no resuelve todos los temas del RUT: confirma que exista y trae el nombre, pero no sirve para los asientos que no traen RUT.

## 2026-11-03

- **CAPTCHA (Cloudflare Turnstile) funcionando de punta a punta en staging (Render).**
  - La site key está cargada en `.env` y en Render. Verificado que la incluye el build de staging.
  - El widget de Cloudflare permite `localhost`, `tudeclaracion-staging-pus8.onrender.com` y `backoffice-1-za5e.onrender.com`. Se quitó `tudeclaracion.com` porque todavía no hay dominio de producción definido.
  - CAPTCHA activado en Supabase con el secret de Turnstile. Verificado: un login directo sin token de captcha queda rechazado.
  - El usuario probó el login en staging y entró sin problemas.
- **Investigación de los web services de la DGI**: ver el pendiente #2.
- **Validación del dígito verificador del RUT**: investigada y puesta on hold; ver el pendiente #1.
- **Pendientes técnicos menores:**
  - `render.yaml` no declara `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Hoy existe solo en el dashboard de Render.
  - Cuando exista el dominio de producción, hay que agregarlo a los hostnames del widget de Turnstile.
  - Los tests o scripts que hagan login por API van a necesitar las keys de prueba de Turnstile.
  - El MCP de Tavily no toma `TAVILY_API_KEY` porque la variable no está en el entorno de Windows. Se arregla con `setx` y reiniciando VS Code.

## 2026-10-28

- Los asientos excluidos que no tienen RUT ahora muestran "sin RUT".

## 2026-10-26

- La landing tiene una sección de planes de suscripción de ejemplo, y el plan elegido se lleva al registro.
- Vista por período: muestra juntos el 2181 y el 1376 de cada período, con su estado.
- Los asientos con un Libro que no coincide se excluyen, en lugar de rechazar todo el TXT.
- Del 1376 se omiten los totales en cero y los asientos de cierre.
- Documentación: catálogos oficiales de líneas del 2183 y del 1050 (con su formato de importación), descripciones de los códigos del 2181, y registro de las respuestas del contador.

## 2026-10-21

- La descarga del 1376 ya no se bloquea por cuentas sin mapear.
- Se aplicaron las respuestas del contador al contenido de Ayuda.

## 2026-10-18

- Nueva pantalla de inicio después del login, menú de usuario, cierre de sesión y página de cuenta.
- La Ayuda se reorganizó por temas, y cada mensaje enlaza a su explicación.
- CAPTCHA (Turnstile) agregado a login, registro y recuperación de contraseña.
- Seguridad: cookies de sesión `Secure` en producción y mensajes de error amigables en español (en lugar de errores crudos).

## 2026-10-17

- Seguridad: límite de tamaño en las operaciones de escritura masiva.
- Aviso de códigos de IVA del 1376 sin mapear en los asientos de formato rápido.

## 2026-10-15

- Las líneas del 1376 se mapean por código de IVA y cuenta, en lugar de por columna de importe.
- Decisión registrada: el motor del 1376 usa los dos criterios del 2181 (ADR-0010).

## 2026-10-14

- Se puede borrar un período de declaración entero desde el panel.
- Aviso cuando un TXT del 1376 no tiene fila de encabezado.

## 2026-10-07

- Las columnas del TXT del 1376 se leen por el título del encabezado (ADR-0009).

## 2026-10-05

- El RUT se exige solo en los asientos que resuelve el 2181 (ADR-0008).
- Después de crear una empresa, se enlaza al mapeo del 1376.

## 2026-10-02

- Endurecimiento de seguridad a partir del threat model: headers de seguridad, redirección post-login protegida, dependencias actualizadas (Next 15.5.27 y otras), escritura de la caché del BCU solo desde el servidor, y migración base de cuenta y empresa.

## 2026-10-01

- Threat model de caja blanca.
- Códigos de línea del 1376 y formato de salida confirmados con el contador.
