'use client';

import type { CampoEspecial, CampoInvalido } from '@/modules/parser/parse-asientos';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CAMPOS_ESPECIALES, contarCamposPrimeraLineaDeDatos } from '@/modules/parser/parse-asientos';

const ACCEPTED_EXTENSION = '.txt';

/** Etiquetas legibles para el checklist de columnas especiales (ADR-0005, TD-31) -- las keys internas viven en el parser. */
const ETIQUETAS_CAMPOS_ESPECIALES: Record<CampoEspecial, string> = {
  costos: 'C.Costos',
  comprobante: 'Comprobante',
  numero: 'Número',
  emision: 'Emisión',
  vencimiento: 'Vencimiento',
  numeroDocumento: 'Número Documento',
  serieDocumento: 'Serie Documento',
  serie: 'Serie',
  numeroAsiento: 'Número Asiento',
};

/** Los 11 campos obligatorios del modelo clásico, en orden canónico (`SRS/05-parser.md` §"Confirmado 2026-08-17") -- Tipo queda afuera porque ya es opcional hoy. */
const CAMPOS_OBLIGATORIOS_LABELS = ['Día', 'Debe', 'Haber', 'Concepto', 'RUT', 'Moneda', 'Total', 'Código IVA', 'IVA', 'Cotización', 'Libro'];

/**
 * A partir de esta cantidad de campos inválidos simultáneos en la misma
 * línea, el listado campo-por-campo deja de ser una advertencia útil y pasa
 * a ser ruido -- confirmado con el contador (2026-08-18): un typo real
 * (1-2 campos) sigue mostrando el detalle para poder corregirlo, pero 3+
 * campos fallando a la vez es la firma de un corrimiento de columnas
 * (ej. un RUT de 12 dígitos colado después de Haber), no de varios datos
 * mal tipeados a la vez -- incumple lo que a partir de ahora llamamos las
 * "reglas básicas del TXT" (12 campos, cada uno con su forma esperada en su
 * posición). No se intenta detectar QUÉ campo se corrió -- es imposible
 * cubrir todas las formas en que un proveedor puede mandar un archivo mal
 * armado -- solo se generaliza la señal.
 */
const UMBRAL_CAMPOS_INVALIDOS_SIMULTANEOS = 3;

/** Módulo Ayuda todavía no existe (a crearse más adelante) -- por ahora es texto plano, sin link, en todo mensaje de formato no aceptado. */
const MENSAJE_AYUDA = 'Consultá el módulo Ayuda para la guía de cómo debe venir el archivo.';

/** `null` = éxito. `parse` = uno o más campos inválidos de la misma línea, identificados de una sola pasada (05-parser.md); `cotizacion-no-disponible` = el archivo trae líneas en dólares sin cotización propia y el BCU no tiene el día hábil anterior necesario en el caché (TD-27); `guardado` = falló la persistencia tras un parseo válido. */
export type ImportarAsientoError
  = | { kind: 'parse', line: number, errors: CampoInvalido[] }
    | { kind: 'cotizacion-no-disponible', message: string }
    | { kind: 'guardado', message: string };

export interface ImportarAsientoOpciones {
  reemplazar: boolean
  camposEspecialesHabilitados: Set<CampoEspecial>
}

interface ImportarAsientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaActiva: string
  onCheckPeriodo: (periodo: string) => Promise<boolean>
  onImportar: (file: File, periodo: string, opciones: ImportarAsientoOpciones) => Promise<ImportarAsientoError | null>
}

function isArchivoValido(file: File) {
  return file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION);
}

export function ImportarAsientoDialog({
  open,
  onOpenChange,
  empresaActiva,
  onCheckPeriodo,
  onImportar,
}: ImportarAsientoDialogProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoInvalido, setArchivoInvalido] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [error, setError] = useState<ImportarAsientoError | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [confirmarReemplazo, setConfirmarReemplazo] = useState(false);
  const [confirmacion, setConfirmacion] = useState<{ archivo: string, timestamp: Date } | null>(null);
  const [camposDetectados, setCamposDetectados] = useState<number | null>(null);
  const [camposEspecialesSeleccionados, setCamposEspecialesSeleccionados] = useState<Set<CampoEspecial>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const listoButtonRef = useRef<HTMLButtonElement>(null);
  const reemplazarButtonRef = useRef<HTMLButtonElement>(null);

  /** ADR-0005 (TD-31): 11/12 campos es el modelo clásico, sin configuración adicional. */
  const esNoEstandar = camposDetectados !== null && camposDetectados > 12;
  /** SRS/05-parser.md §"Confirmado 2026-08-17": al archivo le falta alguno de los 11 campos obligatorios -- nunca hay forma de completarlo desde la UI, el usuario debe conseguir una versión completa del archivo. */
  const esFaltante = camposDetectados !== null && camposDetectados < 11;
  const anchoDeclarado = 12 + camposEspecialesSeleccionados.size;
  const configEspecialCompleta = anchoDeclarado === camposDetectados;

  const puedeImportar = archivo !== null
    && periodo.length === 7
    && empresaActiva.length > 0
    && !importando
    && !esFaltante
    && (!esNoEstandar || configEspecialCompleta);

  function toggleCampoEspecial(campo: CampoEspecial, marcado: boolean) {
    setCamposEspecialesSeleccionados((prev) => {
      const next = new Set(prev);
      if (marcado) {
        next.add(campo);
      }
      else {
        next.delete(campo);
      }
      return next;
    });
  }

  // Radix solo maneja foco en apertura/cierre del diálogo, no en swaps de
  // contenido interno -- sin esto, el foco cae al <body> al pasar al estado
  // de confirmación, justo cuando más importa que el usuario lo note.
  useEffect(() => {
    if (confirmacion) {
      listoButtonRef.current?.focus();
    }
  }, [confirmacion]);

  useEffect(() => {
    if (confirmarReemplazo) {
      reemplazarButtonRef.current?.focus();
    }
  }, [confirmarReemplazo]);

  async function seleccionarArchivo(file: File | undefined) {
    if (!file) { return; }
    if (!isArchivoValido(file)) {
      setArchivo(null);
      setArchivoInvalido(true);
      setCamposDetectados(null);
      setCamposEspecialesSeleccionados(new Set());
      return;
    }
    setArchivo(file);
    setArchivoInvalido(false);
    setCamposEspecialesSeleccionados(new Set());
    const contenido = await file.text();
    setCamposDetectados(contarCamposPrimeraLineaDeDatos(contenido));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(false);
    void seleccionarArchivo(event.dataTransfer.files[0]);
  }

  function resetEstado() {
    setArchivo(null);
    setArchivoInvalido(false);
    setArrastrando(false);
    setImportando(false);
    setError(null);
    setPeriodo('');
    setConfirmarReemplazo(false);
    setConfirmacion(null);
    setCamposDetectados(null);
    setCamposEspecialesSeleccionados(new Set());
  }

  function handleClose(nextOpen: boolean) {
    // Ignora intentos de cerrar (Cancelar, Esc, click afuera) mientras la
    // importación está en vuelo -- si no, la promesa de onImportar puede
    // resolver después del cierre y setear una confirmación fantasma la
    // próxima vez que se abra el diálogo para otra carga.
    if (!nextOpen && importando) { return; }
    if (!nextOpen) {
      resetEstado();
    }
    onOpenChange(nextOpen);
  }

  async function ejecutarImportacion(reemplazar: boolean) {
    if (!archivo) { return; }
    setImportando(true);
    const nombreArchivo = archivo.name;
    const resultado = await onImportar(archivo, periodo.replace('-', ''), {
      reemplazar,
      camposEspecialesHabilitados: camposEspecialesSeleccionados,
    });
    setImportando(false);
    setConfirmarReemplazo(false);

    if (resultado) {
      setError(resultado);
      return;
    }
    setConfirmacion({ archivo: nombreArchivo, timestamp: new Date() });
  }

  async function handleImportarClick() {
    if (!archivo || periodo.length !== 7) { return; }
    setError(null);
    setImportando(true);
    const yaProcesado = await onCheckPeriodo(periodo.replace('-', ''));
    setImportando(false);

    if (yaProcesado) {
      setConfirmarReemplazo(true);
      return;
    }
    await ejecutarImportacion(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar asiento</DialogTitle>
          <DialogDescription>
            Subí el TXT mensual del proveedor contable para
            {' '}
            {empresaActiva}
            .
          </DialogDescription>
        </DialogHeader>

        {confirmacion
          ? (
              <div
                data-testid="importar_asiento_confirmacion"
                className="grid gap-1.5 rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text"
              >
                <p className="font-medium">Carga exitosa</p>
                <p>
                  Archivo
                  {' '}
                  <span className="font-medium">{confirmacion.archivo}</span>
                  {' '}
                  cargado el
                  {' '}
                  {confirmacion.timestamp.toLocaleString('es-UY')}
                  .
                </p>
              </div>
            )
          : confirmarReemplazo
            ? (
                <div
                  data-testid="importar_asiento_confirmar_reemplazo"
                  className="grid gap-1.5 rounded-md border border-warning/25 bg-warning-bg px-4 py-3 text-warning-text"
                >
                  <p className="font-medium">
                    Este asiento del
                    {' '}
                    {periodo.replace('-', '/')}
                    {' '}
                    ya fue procesado.
                  </p>
                  <p>¿Deseás reemplazarlo? Se van a borrar los datos cargados anteriormente para este período.</p>
                </div>
              )
            : (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="periodo">Período de la declaración</Label>
                    <Input
                      id="periodo"
                      type="month"
                      value={periodo}
                      onChange={event => setPeriodo(event.target.value)}
                    />
                  </div>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setArrastrando(true);
                    }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={handleDrop}
                    className={cn(
                      'grid place-items-center gap-3 rounded-md border-2 border-dashed p-8 text-center transition-colors',
                      arrastrando ? 'border-primary bg-accent' : 'border-border',
                    )}
                  >
                    <p className="text-muted-foreground">
                      Arrastrá y soltá el archivo acá, o
                    </p>
                    <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                      Buscar archivo
                    </Button>
                    <input
                      ref={inputRef}
                      type="file"
                      accept={ACCEPTED_EXTENSION}
                      className="hidden"
                      onChange={event => void seleccionarArchivo(event.target.files?.[0])}
                    />
                    {archivo && (
                      <p className="font-medium text-foreground">{archivo.name}</p>
                    )}
                    {archivoInvalido && (
                      <p className="text-sm text-destructive">
                        El archivo debe ser un TXT (
                        {ACCEPTED_EXTENSION}
                        ).
                      </p>
                    )}
                  </div>

                  {esFaltante && (() => {
                    const columnasFaltantes = 11 - (camposDetectados ?? 0);
                    return (
                      <div
                        data-testid="importar_asiento_faltante"
                        className="grid gap-1.5 rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text"
                      >
                        <p className="font-medium">
                          Faltan
                          {' '}
                          {columnasFaltantes}
                          {' '}
                          columna
                          {columnasFaltantes === 1 ? '' : 's'}
                          , por favor revisa los asientos.
                        </p>
                        <p className="text-sm">
                          Campos esperados en orden:
                          {' '}
                          {CAMPOS_OBLIGATORIOS_LABELS.join(', ')}
                          .
                        </p>
                        <p className="text-sm">{MENSAJE_AYUDA}</p>
                      </div>
                    );
                  })()}

                  {esNoEstandar && (
                    <div
                      data-testid="importar_asiento_config_especial"
                      className="grid gap-3 rounded-md border border-border bg-muted/40 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">Este archivo no tiene el formato estándar.</p>
                        <p className="text-sm text-muted-foreground">
                          Se detectaron
                          {' '}
                          {camposDetectados}
                          {' '}
                          campos por línea. Marcá qué columnas adicionales trae tu archivo.
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {CAMPOS_ESPECIALES.map(campo => (
                          <label key={campo} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={camposEspecialesSeleccionados.has(campo)}
                              onCheckedChange={checked => toggleCampoEspecial(campo, checked === true)}
                            />
                            {ETIQUETAS_CAMPOS_ESPECIALES[campo]}
                          </label>
                        ))}
                      </div>

                      <p className={cn('text-sm', configEspecialCompleta ? 'text-muted-foreground' : 'text-warning-text')}>
                        Columnas configuradas: 12 +
                        {' '}
                        {camposEspecialesSeleccionados.size}
                        {' = '}
                        {anchoDeclarado}
                        {' de '}
                        {camposDetectados}
                        {' '}
                        detectados.
                      </p>
                      <p className="text-sm text-muted-foreground">{MENSAJE_AYUDA}</p>
                    </div>
                  )}

                  {error && (
                    <div
                      data-testid="importar_asiento_error"
                      className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text"
                    >
                      {error.kind === 'parse'
                        ? (
                            error.errors.length >= UMBRAL_CAMPOS_INVALIDOS_SIMULTANEOS
                              ? (
                                  <>
                                    <p className="font-medium">
                                      Este archivo no cumple las reglas básicas del TXT.
                                    </p>
                                    <p className="text-sm">
                                      Línea
                                      {' '}
                                      {error.line}
                                      : se detectaron
                                      {' '}
                                      {error.errors.length}
                                      {' '}
                                      campos inválidos a la vez -- es probable que las columnas no coincidan con el orden esperado.
                                    </p>
                                    <p className="text-sm">{MENSAJE_AYUDA}</p>
                                  </>
                                )
                              : (
                                  <>
                                    <p className="font-medium">
                                      Línea
                                      {' '}
                                      {error.line}
                                      :
                                    </p>
                                    <ul className="list-disc pl-4">
                                      {error.errors.map(campoError => (
                                        <li key={campoError.field}>
                                          {`Campo "${campoError.field}": ${campoError.message}`}
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )
                          )
                        : error.message}
                    </div>
                  )}
                </>
              )}

        <DialogFooter>
          {confirmacion
            ? (
                <Button ref={listoButtonRef} type="button" onClick={() => handleClose(false)}>
                  Listo
                </Button>
              )
            : confirmarReemplazo
              ? (
                  <>
                    <Button type="button" variant="outline" disabled={importando} onClick={() => handleClose(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" variant="outline" disabled={importando} onClick={() => setConfirmarReemplazo(false)}>
                      No
                    </Button>
                    <Button ref={reemplazarButtonRef} type="button" disabled={importando} onClick={() => void ejecutarImportacion(true)}>
                      {importando ? 'Reemplazando…' : 'Sí, reemplazar'}
                    </Button>
                  </>
                )
              : (
                  <>
                    <Button type="button" variant="outline" disabled={importando} onClick={() => handleClose(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" disabled={!puedeImportar} onClick={() => void handleImportarClick()}>
                      {importando ? 'Importando…' : 'Importar'}
                    </Button>
                  </>
                )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
