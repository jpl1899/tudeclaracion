# Business Model — tuDeclaracion.com

> Fuente: `Project Foundation tuDeclaracion.com — Versión 0.1`. Los hechos marcados como tales provienen directamente del brief. Todo lo demás está explícitamente señalado como **Propuesta a validar** — no son decisiones tomadas, sino hipótesis razonables para que el usuario las confirme, ajuste o descarte.

## Problem Statement

Actualmente la confección de declaraciones juradas de DGI requiere una cantidad importante de trabajo manual por parte de los contadores. Este proceso consume tiempo operativo que podría destinarse a actividades profesionales de mayor valor, y ese costo de tiempo se traduce en mayores costos asociados a cada cliente atendido.

El flujo actual (según el brief) exige tomar información exportada desde el software contable Memory en formato TXT y transformarla manualmente para poder generar el archivo compatible con PADI que DGI exige para la Declaración Jurada 2181. No existe automatización de por medio: el contador procesa, aplica las reglas tributarias y arma el archivo final "a mano" o con herramientas no pensadas específicamente para este propósito.

El resultado es un cuello de botella operativo repetitivo, propenso a errores manuales y que escala mal: cuantos más clientes atiende un contador, más tiempo absoluto insume la tarea, sin que ese tiempo agregue valor profesional diferencial (no es la parte del trabajo donde el contador aporta criterio experto, sino ejecución mecánica).

## MVP Hypothesis

1. **Hipótesis de tiempo**: si tuDeclaracion.com permite pasar de un TXT exportado de Memory a un archivo listo para importar en PADI en menos de 5 minutos, los contadores adoptarán la herramienta para la DJ 2181 en lugar de su proceso manual actual.
2. **Hipótesis de usabilidad**: si la interfaz prioriza simplicidad y un número mínimo de acciones (pensada para usuarios con conocimientos informáticos básicos), la adopción no estará limitada por fricción de uso, incluso en un público de 22 a 65 años con niveles de alfabetización digital heterogéneos.
3. **Hipótesis comercial**: si se ofrece bajo un modelo de suscripción, los contadores (como profesionales que recurrentemente deben presentar DJ 2181 para múltiples clientes) percibirán valor suficiente en el ahorro de tiempo recurrente como para sostener un pago periódico, en lugar de preferir un pago único por uso.

## Business Model Canvas

### 1. Customer Segments — ¿Para quién creamos valor?

- **Cliente principal**: Contadores (aproximadamente 22 a 65 años) que confeccionan declaraciones juradas de DGI para sus clientes.
- **Cliente secundario**: Personas que necesiten generar declaraciones juradas conforme a los requisitos de DGI, sin pasar necesariamente por un contador.

*(Ambos segmentos y el rango etario del cliente principal son datos explícitos del brief.)*

### 2. Value Propositions — ¿Qué problema resolvemos?

- Automatización de la generación de la Declaración Jurada 2181 a partir de un archivo TXT exportado desde Memory, aplicando las reglas tributarias correspondientes y produciendo un archivo compatible con PADI.
- Objetivo de rendimiento explícito: menos de 5 minutos desde el TXT de entrada hasta el archivo listo para importar en PADI.
- Tres pilares de diferenciación declarados en la visión del producto: **facilidad de uso, rapidez y confiabilidad**.
- Interfaz utilizable por usuarios con conocimientos informáticos básicos, minimizando la cantidad de acciones necesarias.

*(Todo lo anterior son hechos tomados directamente del brief.)*

### 3. Channels — ¿Cómo llegamos a los clientes?

El brief no especifica canales de adquisición o distribución.

**Propuesta a validar:**
- Canal directo vía sitio web propio (tuDeclaracion.com) con registro y prueba del producto.
- Referidos entre contadores (el público principal es un gremio profesional relativamente conectado entre sí — colegas, estudios contables, gremiales/colegios profesionales).
- Contenido educativo/demostrativo (ej. video corto mostrando el flujo Memory → PADI en menos de 5 minutos) como gancho de marketing, dado que la propuesta de valor es medible y demostrable.

### 4. Customer Relationships — ¿Qué relación establecemos?

El brief no especifica el modelo de relación con el cliente.

**Propuesta a validar:**
- Autoservicio (self-service): dado el énfasis en simplicidad y mínima cantidad de acciones, el producto debería poder usarse sin intervención humana en el flujo normal.
- Soporte reactivo liviano (ej. canal de contacto o ayuda) para resolver dudas puntuales, sin necesidad de un modelo de atención dedicada por cliente en el MVP.
- A validar si se requiere onboarding asistido para los primeros contadores (dado que es un público que puede no ser nativo digital).

### 5. Revenue Streams — ¿Cómo generamos ingresos?

- **Modelo de suscripción**, declarado explícitamente en el brief como modelo comercial preliminar. El brief aclara que durante la evolución del producto podrán evaluarse otros modelos de comercialización.

**Propuesta a validar (el brief no define montos, periodicidad ni niveles):**
- Estructura de precios, frecuencia de facturación (mensual/anual) y si existirán distintos niveles de suscripción (ej. por volumen de declaraciones o por cantidad de clientes gestionados) quedan pendientes de definición — no se incluyen cifras porque el brief no las provee.

### 6. Key Resources — ¿Qué recursos necesitamos?

El brief no detalla recursos clave.

**Propuesta a validar:**
- Conocimiento experto y actualizado de las reglas tributarias de DGI aplicables a la DJ 2181 (y, a futuro, a otras declaraciones).
- Especificación exacta del formato de archivo compatible con PADI (dependencia crítica: sin esta especificación no hay generación de archivo válido).
- Capacidad de desarrollo de software propia para mantener y evolucionar la plataforma.
- Infraestructura de hosting y procesamiento para operar el servicio (sin especificar proveedor — decisión de arquitectura, fuera del alcance de este documento).

### 7. Key Activities — ¿Qué actividades clave hacemos?

El brief no detalla actividades clave, pero varias se desprenden directamente del flujo y los principios declarados.

- Procesamiento del archivo TXT exportado desde Memory, aplicación de reglas tributarias y generación del archivo compatible con PADI *(hecho, es el núcleo funcional descrito en el brief)*.

**Propuesta a validar:**
- Monitoreo y actualización continua de las reglas tributarias de DGI (las reglas impositivas cambian y el producto depende de que se mantengan correctas).
- Diseño y mantenimiento de una experiencia de usuario simple, dado que el principio rector del producto es la facilidad de uso por sobre la complejidad funcional.
- Desarrollo incremental de soporte para nuevas declaraciones juradas más allá de la 2181, según lo indica la evolución de producto declarada en el brief. **Confirmado a nivel arquitectura** (no de scope funcional del MVP): el sistema se diseña como plataforma modular reutilizable desde el inicio, con la 2181 como primera implementación — ver `ADR-0001-modular-reusable-tax-platform.md`. El MVP funcional/de release sigue siendo únicamente la 2181.

### 8. Key Partners — ¿Quiénes son nuestros partners?

El brief no menciona partners ni alianzas.

**Propuesta a validar:**
- Ninguna alianza formal identificada en el brief. El producto depende funcionalmente de dos actores externos, aunque no se los menciona como "partners" en sentido comercial: el software Memory (origen del archivo TXT) y PADI (destino del archivo generado, sistema oficial de DGI). Esta dependencia técnica debería registrarse como riesgo/restricción de producto más que como partnership, salvo que el usuario confirme una relación formal con alguno de estos actores.
- Gremiales o colegios de contadores en Uruguay podrían ser un canal de distribución/validación temprana, a confirmar con el usuario.

### 9. Cost Structure — ¿Cuáles son los costos principales?

El brief no detalla estructura de costos (consistente con la instrucción de no fijar decisiones de arquitectura/proveedores en este documento).

**Propuesta a validar:**
- Costo de desarrollo y mantenimiento de software (equipo de desarrollo).
- Costo de infraestructura (hosting/procesamiento), sin especificar proveedor.
- Costo de mantenimiento normativo: seguimiento de cambios en reglas tributarias de DGI y en el formato PADI.
- Costo de soporte al cliente.

---

*Documento generado en la fase de Constitución (`/project-foundation` Phase 1). No incluye decisiones de arquitectura técnica (motor de base de datos, proveedor de hosting, autenticación, frameworks) — esas pertenecen al SRS.*
