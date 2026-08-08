# Comments for TD-31

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-31)

---

### Juan Leites - 7/8/2026, 16:22:11

## Acceptance Criteria

```gherkin
Scenario: Standard file uploads without any extra configuration
  Given Rosana has a monthly TXT file with the standard column layout
  When she selects the file to upload
  Then the upload proceeds immediately, with no configuration screen shown
```

```gherkin
Scenario: Non-standard file requires declaring its extra columns before uploading
  Given Rosana selects a monthly TXT file whose column count does not match the standard layout
  When the system detects the mismatch
  Then Rosana sees a configuration screen listing every additional column type the system recognizes
  And the upload action stays disabled until she selects which additional columns her file includes
```

```gherkin
Scenario: A correctly configured non-standard file is interpreted correctly
  Given Rosana has declared which additional columns her file includes
  When she completes the upload
  Then every line of the file is interpreted using the columns she declared
  And the resulting declaration data is correct, regardless of which lines actually contain a value for each additional column
```

```gherkin
Scenario: A file line doesn't match the declared column configuration
  Given Rosana has declared a specific set of additional columns for her file
  When a line in the file has a different number of columns than what she declared
  Then the upload is rejected in full
  And Rosana sees a clear message identifying the mismatched line
```

---

### Juan Leites - 7/8/2026, 16:22:12

## Scope

- Archivos con la cantidad estándar de columnas siguen subiendo y procesándose exactamente igual que hoy, sin ningún paso adicional.
- Cuando la cantidad de columnas de un archivo no coincide con el formato estándar, se muestra una pantalla de configuración con todos los tipos de columna adicional que el sistema reconoce.
- La acción de subir el archivo queda deshabilitada hasta que Rosana complete esa configuración.
- El sistema interpreta correctamente cada línea del archivo según las columnas que Rosana declaró, tratando una columna reconocida pero no marcada como directamente ausente.
- Una línea cuya cantidad de columnas no coincide con lo configurado se reporta con un mensaje claro, sin generar resultados parciales.

---

### Juan Leites - 7/8/2026, 16:22:13

## Out Of Scope

- Detección automática de qué columnas adicionales trae un archivo, sin que Rosana las declare.
- Declarar una configuración distinta para líneas o secciones distintas dentro del mismo archivo — la configuración aplica al archivo completo.
- Ampliar el tope de dígitos de Debe/Haber, agregar un tope de importe a Total/IVA, ofrecer una tabla de monedas configurable, o ampliar los valores aceptados del campo Tipo — decidido explícitamente fuera de alcance (ADR-0005).

---

### Juan Leites - 7/8/2026, 16:22:14

## Business Rules Specification

- El orden relativo en que pueden aparecer las columnas adicionales reconocidas respecto de las columnas obligatorias es fijo — Rosana solo elige cuáles están presentes en su archivo, nunca en qué posición van.
- La configuración declarada aplica al archivo completo, nunca a líneas individuales dentro del mismo archivo.
- Una columna adicional declarada como presente pero sin dato aplicable en una línea puntual se trata como valor vacío en esa línea, no como columna ausente.

---


_Synced from Jira by sync-jira-issues_
