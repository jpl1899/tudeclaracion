'use client';

import type { LadoMapeo, MapeoFila } from '@/modules/mapeo-1376/mapeo-1376';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';
import { cn } from '@/lib/utils';
import {
  construirFilasParaGuardar,
  filaIncompleta,
  filaTieneDatos,
  LADO_OPCIONES,
  UNIQUE_VIOLATION_CODE,
  validarMapeo,
} from '@/modules/mapeo-1376/mapeo-1376';

/**
 * Configuración del mapeo del Formulario 1376 — TD-38,
 * `.context/design/master-design-plan.md` §5 D10.
 *
 * Reutiliza el patrón de tabla editable de `empresa-detalle-client.tsx` (TD-30):
 * `selectClassName`, Input/Button/Label, 3 banners de guardado. Diferencia: las
 * filas son fijas — las manda el catálogo `codigo_linea_1376` — y el contador
 * engancha una cuenta a cada código (relación biyectiva). No se agregan ni
 * quitan filas.
 */
const selectClassName = cn(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
);

type SaveState = 'idle' | 'success' | 'validation-error' | 'save-error';

interface EmpresaResumen {
  id: string
  nombre: string
  rut: string
}

export function Mapeo1376Client({ empresa, filasIniciales }: {
  empresa: EmpresaResumen
  filasIniciales: MapeoFila[]
}) {
  const router = useRouter();
  const [filas, setFilas] = useState<MapeoFila[]>(filasIniciales);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  function clearBanners() {
    setSaveState('idle');
    setSaveErrorMessage('');
  }

  function updateFila(codigoLinea: string, patch: Partial<MapeoFila>) {
    setFilas(prev => prev.map(f => (f.codigoLinea === codigoLinea ? { ...f, ...patch } : f)));
    clearBanners();
  }

  async function handleSubmit() {
    setSubmitted(true);

    const problema = validarMapeo(filas);
    if (problema) {
      setSaveState('validation-error');
      setSaveErrorMessage(problema);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('guardar_mapeo_1376', {
      p_empresa_id: empresa.id,
      p_filas: construirFilasParaGuardar(filas),
    });
    setIsSubmitting(false);

    if (error?.code === UNIQUE_VIOLATION_CODE) {
      setSaveState('save-error');
      setSaveErrorMessage(
        'Una cuenta contable o un código de IVA quedó asignado a más de un código de línea. Revisá el mapeo: cada uno va a un solo código.',
      );
      return;
    }
    if (error) {
      throw new Error(`No se pudo guardar el mapeo: ${error.message}`);
    }

    // Alinea el estado con lo que quedó persistido: una fila sin datos no
    // guarda el lado, así que se limpia también en pantalla.
    setFilas(prev => prev.map(f => (filaTieneDatos(f) ? f : { ...f, lado: '' })));
    setSaveState('success');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[900px] gap-6 rounded-lg border border-border bg-card p-10 shadow-md">
        <div>
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
            Mapeo del Formulario 1376
          </span>
          <h1 className="text-lg font-semibold">{empresa.nombre}</h1>
          <p className="mt-2 text-muted-foreground">
            Asigná a cada código de línea del 1376 su código de IVA y su cuenta contable. El motor
            junta los movimientos del TXT del período con los mismos dos criterios que el 2181:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Formato rápido</strong>
              {' '}
              (con código de IVA): suma la columna IVA de los movimientos con ese código.
            </li>
            <li>
              <strong className="text-foreground">Asiento abierto</strong>
              {' '}
              (código de IVA 0): suma la columna Total de los movimientos donde la cuenta aparece del lado elegido.
            </li>
          </ul>
          <p className="mt-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Esto no es el plan de cuentas del 2181.</strong>
            {' '}
            Aquel mapea cada cuenta a un código PADI de IVA; este mapea cada código de línea del 1376
            a un código de IVA y una única cuenta contable, con su lado. El código de IVA es opcional:
            sin él, la línea solo junta asientos abiertos.
          </p>
        </div>

        {saveState === 'success' && (
          <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
            <strong className="mb-1 block">Mapeo guardado correctamente.</strong>
            Ya está disponible para generar la 1376 de esta empresa.
          </div>
        )}
        {saveState === 'validation-error' && (
          <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
            <strong className="mb-1 block">Revisá el mapeo antes de guardar.</strong>
            {saveErrorMessage}
          </div>
        )}
        {saveState === 'save-error' && (
          <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
            <strong className="mb-1 block">No fue posible guardar el mapeo.</strong>
            {saveErrorMessage}
          </div>
        )}

        <div className="grid gap-3">
          {filas.map((fila) => {
            const incompleta = submitted && filaIncompleta(fila);
            return (
              <div
                key={fila.codigoLinea}
                className="grid grid-cols-[96px_72px_1fr_1fr_140px] items-end gap-3 rounded-md border border-border bg-muted/40 p-4"
              >
                <div className="grid gap-1.5">
                  <Label htmlFor={`codigo-iva-${fila.codigoLinea}`}>Código IVA</Label>
                  <Input
                    id={`codigo-iva-${fila.codigoLinea}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="h-[52px]"
                    value={fila.codigoIva}
                    onChange={e => updateFila(fila.codigoLinea, { codigoIva: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código</span>
                  <span className="font-mono text-base">{fila.codigoLinea}</span>
                </div>
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Concepto</span>
                  <span className="text-sm">{fila.concepto}</span>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`cuenta-${fila.codigoLinea}`}>Cuenta contable</Label>
                  <Input
                    id={`cuenta-${fila.codigoLinea}`}
                    type="text"
                    inputMode="numeric"
                    className="h-[52px]"
                    value={fila.cuentaContable}
                    onChange={e => updateFila(fila.codigoLinea, { cuentaContable: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`lado-${fila.codigoLinea}`}>Lado</Label>
                  <select
                    id={`lado-${fila.codigoLinea}`}
                    className={cn(selectClassName, 'h-[52px]')}
                    value={fila.lado}
                    onChange={e => updateFila(fila.codigoLinea, { lado: e.target.value as LadoMapeo | '' })}
                  >
                    <option value="">—</option>
                    {LADO_OPCIONES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {incompleta && (
                  <span className="col-span-full text-sm text-error-text">
                    Esta fila necesita también la cuenta contable y el lado.
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar mapeo'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-[52px]"
            onClick={() => router.push(`/empresas/${empresa.id}`)}
          >
            Volver sin guardar
          </Button>
        </div>
      </div>
    </main>
  );
}
