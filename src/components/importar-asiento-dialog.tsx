'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
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

const ACCEPTED_EXTENSION = '.txt';

/** `null` = éxito. `parse` = dato inválido con línea/campo identificados (05-parser.md); `guardado` = falló la persistencia tras un parseo válido. */
export type ImportarAsientoError
  = | { kind: 'parse', line: number, field: string, message: string }
    | { kind: 'guardado', message: string };

interface ImportarAsientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaActiva: string
  onImportar: (file: File, periodo: string) => Promise<ImportarAsientoError | null>
}

function isArchivoValido(file: File) {
  return file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION);
}

export function ImportarAsientoDialog({
  open,
  onOpenChange,
  empresaActiva,
  onImportar,
}: ImportarAsientoDialogProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoInvalido, setArchivoInvalido] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [error, setError] = useState<ImportarAsientoError | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [confirmacion, setConfirmacion] = useState<{ archivo: string, timestamp: Date } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listoButtonRef = useRef<HTMLButtonElement>(null);

  const puedeImportar = archivo !== null && periodo.length === 7 && empresaActiva.length > 0 && !importando;

  // Radix solo maneja foco en apertura/cierre del diálogo, no en swaps de
  // contenido interno -- sin esto, el foco cae al <body> al pasar al estado
  // de confirmación, justo cuando más importa que el usuario lo note.
  useEffect(() => {
    if (confirmacion) {
      listoButtonRef.current?.focus();
    }
  }, [confirmacion]);

  function seleccionarArchivo(file: File | undefined) {
    if (!file) { return; }
    if (!isArchivoValido(file)) {
      setArchivo(null);
      setArchivoInvalido(true);
      return;
    }
    setArchivo(file);
    setArchivoInvalido(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(false);
    seleccionarArchivo(event.dataTransfer.files[0]);
  }

  function resetEstado() {
    setArchivo(null);
    setArchivoInvalido(false);
    setArrastrando(false);
    setImportando(false);
    setError(null);
    setPeriodo('');
    setConfirmacion(null);
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

  async function handleImportar() {
    if (!archivo || periodo.length !== 7) { return; }
    setError(null);
    setImportando(true);
    const nombreArchivo = archivo.name;
    const resultado = await onImportar(archivo, periodo.replace('-', ''));
    setImportando(false);

    if (resultado) {
      setError(resultado);
      return;
    }
    setConfirmacion({ archivo: nombreArchivo, timestamp: new Date() });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar asiento</DialogTitle>
          <DialogDescription>
            Subí el TXT mensual exportado desde Memory para
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
                    onChange={event => seleccionarArchivo(event.target.files?.[0])}
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

                {error && (
                  <div
                    data-testid="importar_asiento_error"
                    className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text"
                  >
                    {error.kind === 'parse'
                      ? `Línea ${error.line}, campo "${error.field}": ${error.message}`
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
            : (
                <>
                  <Button type="button" variant="outline" disabled={importando} onClick={() => handleClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" disabled={!puedeImportar} onClick={() => void handleImportar()}>
                    {importando ? 'Importando…' : 'Importar'}
                  </Button>
                </>
              )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
