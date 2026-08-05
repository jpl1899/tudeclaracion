'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';
import { cn } from '@/lib/utils';
import { CODIGO_PADI_EXENTA, CODIGOS_PADI_IVA, DUPLICATE_RUT_ERROR_CODE } from '@/modules/empresa/plan-cuentas';

/**
 * Detalle/edición de empresa existente — TD-30, .context/design/master-design-plan.md
 * §4.9, mockup en .context/designs/tudeclaracion/company-detail-edit/empresa-detalle-edicion.html
 *
 * Mirror de nueva-empresa-client.tsx (TD-7/TD-8/TD-24): mismas dos tablas
 * libres (Códigos de formato rápido de IVA / Compras Exentas) y misma
 * validación, pero precargado con los datos de una empresa ya existente
 * (props resueltas por page.tsx vía RLS, sin fetch-on-mount) y guardado vía
 * editar_empresa_con_plan_cuentas (delete-then-reinsert de plan_cuentas, ver
 * la migración 20260805100000) en vez de crear_empresa_con_plan_cuentas.
 *
 * Divergencias deliberadas respecto al flujo de creación (documentadas en el
 * Spec Implementation Plan de TD-30, Decisiones 1/3/4):
 * - Ambas tablas pueden llegar a 0 filas (el botón "Quitar" nunca se
 *   deshabilita) — a diferencia de la creación, que exige mínimo 1 fila.
 * - El badge "Empresa existente" usa un tono neutral (`outline`), no
 *   `warning` — el badge component no tiene todavía una variante
 *   info/neutral dedicada, así que se reutiliza la más cercana existente.
 * - Guardado con 3 banners (éxito / validación / RUT duplicado) en vez del
 *   panel de éxito de pantalla completa de la creación, porque esta pantalla
 *   no tiene una acción equivalente a "Agregar otra empresa".
 */
const selectClassName = cn(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
);

interface EmpresaDetalle {
  id: string
  nombre: string
  rut: string
}

interface IvaRowInicial {
  id: string
  codigoIva: string
  cuentaContable: string
  codigoPadi: string
}

interface ExentaRowInicial {
  id: string
  cuentaContable: string
}

interface IvaRow {
  key: string
  id: string | null
  codigoIva: string
  cuentaContable: string
  codigoPadi: string
}

interface ExentaRow {
  key: string
  id: string | null
  cuentaContable: string
}

type SaveState = 'idle' | 'success' | 'validation-error' | 'save-error';

function emptyIvaRow(key: string): IvaRow {
  return { key, id: null, codigoIva: '', cuentaContable: '', codigoPadi: CODIGOS_PADI_IVA[0].value };
}

function emptyExentaRow(key: string): ExentaRow {
  return { key, id: null, cuentaContable: '' };
}

export function EmpresaDetalleClient({ empresa, ivaRowsIniciales, exentaRowsIniciales }: {
  empresa: EmpresaDetalle
  ivaRowsIniciales: IvaRowInicial[]
  exentaRowsIniciales: ExentaRowInicial[]
}) {
  const router = useRouter();
  const nextKey = useRef(0);

  const [rut, setRut] = useState(empresa.rut);
  const [nombre, setNombre] = useState(empresa.nombre);
  const [ivaRows, setIvaRows] = useState<IvaRow[]>(
    () => ivaRowsIniciales.map(r => ({ key: r.id, id: r.id, codigoIva: r.codigoIva, cuentaContable: r.cuentaContable, codigoPadi: r.codigoPadi })),
  );
  const [exentaRows, setExentaRows] = useState<ExentaRow[]>(
    () => exentaRowsIniciales.map(r => ({ key: r.id, id: r.id, cuentaContable: r.cuentaContable })),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  function clearBanners() {
    setSaveState('idle');
    setSaveErrorMessage('');
  }

  function handleRutChange(value: string) {
    setRut(value.replace(/\D/g, ''));
    clearBanners();
  }

  function handleNombreChange(value: string) {
    setNombre(value);
    clearBanners();
  }

  function addIvaRow() {
    setIvaRows(prev => [...prev, emptyIvaRow(`nueva-iva-${nextKey.current++}`)]);
    clearBanners();
  }

  function removeIvaRow(key: string) {
    setIvaRows(prev => prev.filter(r => r.key !== key));
    clearBanners();
  }

  function updateIvaRow(key: string, patch: Partial<IvaRow>) {
    setIvaRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
    clearBanners();
  }

  function addExentaRow() {
    setExentaRows(prev => [...prev, emptyExentaRow(`nueva-exenta-${nextKey.current++}`)]);
    clearBanners();
  }

  function removeExentaRow(key: string) {
    setExentaRows(prev => prev.filter(r => r.key !== key));
    clearBanners();
  }

  function updateExentaRow(key: string, patch: Partial<ExentaRow>) {
    setExentaRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
    clearBanners();
  }

  const missingRut = submitted && rut.trim() === '';
  const invalidRutLength = submitted && rut.trim() !== '' && rut.trim().length !== 12;
  const missingNombre = submitted && nombre.trim() === '';
  const ivaRowsIncomplete = ivaRows.some(r => r.codigoIva.trim() === '' || r.cuentaContable.trim() === '');
  const exentaRowsIncomplete = exentaRows.some(r => r.cuentaContable.trim() === '');

  async function handleSubmit() {
    setSubmitted(true);

    const trimmedRut = rut.trim();
    const trimmedNombre = nombre.trim();

    if (trimmedRut === '' || trimmedRut.length !== 12 || trimmedNombre === '' || ivaRowsIncomplete || exentaRowsIncomplete) {
      setSaveState('validation-error');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('editar_empresa_con_plan_cuentas', {
      p_empresa_id: empresa.id,
      p_rut: trimmedRut,
      p_nombre: trimmedNombre,
      p_cuentas: [
        ...ivaRows.map(r => ({
          cuenta_contable: r.cuentaContable.trim(),
          codigo_padi: r.codigoPadi,
          codigo_iva: Number(r.codigoIva),
        })),
        ...exentaRows.map(r => ({
          cuenta_contable: r.cuentaContable.trim(),
          codigo_padi: CODIGO_PADI_EXENTA,
        })),
      ],
    });
    setIsSubmitting(false);

    if (error?.code === DUPLICATE_RUT_ERROR_CODE) {
      setSaveState('save-error');
      setSaveErrorMessage(`Ya existe otra empresa en esta cuenta con el RUT ${trimmedRut}.`);
      return;
    }

    if (error) {
      throw new Error(`No se pudieron guardar los cambios: ${error.message}`);
    }

    setSaveState('success');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[760px] gap-6 rounded-lg border border-border bg-card p-10 shadow-md">
        <div>
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
            Edición de empresa existente
          </span>
          <p className="text-muted-foreground">
            Esta pantalla no crea una empresa nueva. Solo permite consultar y actualizar la ficha ya
            existente, junto con la parametrización contable que usa el estudio para IVA y compras
            exentas.
          </p>
        </div>

        {saveState === 'success' && (
          <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
            <strong className="mb-1 block">Cambios guardados correctamente.</strong>
            La empresa quedó actualizada y la parametrización contable ya está disponible para próximas
            declaraciones.
          </div>
        )}
        {saveState === 'validation-error' && (
          <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
            <strong className="mb-1 block">Revisá los datos antes de guardar.</strong>
            Faltan campos obligatorios o hay filas incompletas en la configuración contable.
          </div>
        )}
        {saveState === 'save-error' && (
          <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
            <strong className="mb-1 block">No fue posible guardar los cambios.</strong>
            {saveErrorMessage}
          </div>
        )}

        <section className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Datos generales</h2>
            <Badge variant="outline">Empresa existente</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Nombre y RUT identifican la empresa sobre la que ya estás trabajando. Si cancelas, vuelves
            al listado sin guardar.
          </p>

          <div className="grid gap-2">
            <Label htmlFor="rut">RUT</Label>
            <Input
              id="rut"
              type="text"
              inputMode="numeric"
              maxLength={12}
              className="h-[52px] font-mono"
              value={rut}
              onChange={e => handleRutChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              12 dígitos, sin puntos ni guiones. Es el valor que va primero en cada línea de PADI.
            </p>
            {missingRut && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                El RUT es obligatorio.
              </div>
            )}
            {invalidRutLength && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                {`"${rut.trim()}" no tiene el formato de 12 dígitos.`}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre de la empresa</Label>
            <Input
              id="nombre"
              type="text"
              className="h-[52px]"
              value={nombre}
              onChange={e => handleNombreChange(e.target.value)}
            />
            {missingNombre && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                El nombre de la empresa es obligatorio.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Códigos de formato rápido de IVA
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada fila relaciona código de IVA, cuenta contable y código PADI para automatizar la
              generación.
            </p>
          </div>

          {ivaRows.length === 0
            ? (
                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Todavía no hay códigos de IVA cargados para esta empresa.
                </div>
              )
            : (
                <div className="grid gap-3">
                  {ivaRows.map((row) => {
                    const rowIncomplete = submitted && (row.codigoIva.trim() === '' || row.cuentaContable.trim() === '');
                    return (
                      <div key={row.key} className="grid grid-cols-[96px_1fr_1fr_auto] items-end gap-3 rounded-md border border-border bg-muted/40 p-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`codigo-iva-${row.key}`}>Código IVA</Label>
                          <Input
                            id={`codigo-iva-${row.key}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="h-[52px]"
                            value={row.codigoIva}
                            onChange={e => updateIvaRow(row.key, { codigoIva: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`cuenta-iva-${row.key}`}>Cuenta contable</Label>
                          <Input
                            id={`cuenta-iva-${row.key}`}
                            type="text"
                            inputMode="numeric"
                            className="h-[52px]"
                            value={row.cuentaContable}
                            onChange={e => updateIvaRow(row.key, { cuentaContable: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`padi-iva-${row.key}`}>Código PADI</Label>
                          <select
                            id={`padi-iva-${row.key}`}
                            className={cn(selectClassName, 'h-[52px]')}
                            value={row.codigoPadi}
                            onChange={e => updateIvaRow(row.key, { codigoPadi: e.target.value })}
                          >
                            {CODIGOS_PADI_IVA.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-[52px]"
                          onClick={() => removeIvaRow(row.key)}
                          aria-label="Quitar código de IVA"
                        >
                          ×
                        </Button>
                        {rowIncomplete && (
                          <span className="col-span-full text-sm text-error-text">Completá los tres campos de esta fila.</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addIvaRow}>
            + Agregar código de IVA
          </Button>
        </section>

        <section className="grid gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Compras Exentas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estas cuentas se declaran siempre en línea PADI 504. Mantenelas separadas para evitar
              carga manual posterior.
            </p>
          </div>

          {exentaRows.length === 0
            ? (
                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Todavía no hay cuentas exentas cargadas para esta empresa.
                </div>
              )
            : (
                <div className="grid gap-3">
                  {exentaRows.map((row) => {
                    const rowIncomplete = submitted && row.cuentaContable.trim() === '';
                    return (
                      <div key={row.key} className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-md border border-border bg-muted/40 p-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`cuenta-exenta-${row.key}`}>Cuenta contable</Label>
                          <Input
                            id={`cuenta-exenta-${row.key}`}
                            type="text"
                            inputMode="numeric"
                            className="h-[52px]"
                            value={row.cuentaContable}
                            onChange={e => updateExentaRow(row.key, { cuentaContable: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-[52px]"
                          onClick={() => removeExentaRow(row.key)}
                          aria-label="Quitar cuenta exenta"
                        >
                          ×
                        </Button>
                        {rowIncomplete && (
                          <span className="col-span-full text-sm text-error-text">Completá la cuenta contable.</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addExentaRow}>
            + Agregar cuenta exenta
          </Button>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="outline" size="lg" className="h-[52px]" onClick={() => router.push('/empresas')}>
            Volver sin guardar
          </Button>
        </div>
      </div>
    </main>
  );
}
