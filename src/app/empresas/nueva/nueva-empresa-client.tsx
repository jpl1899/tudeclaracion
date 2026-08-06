'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';
import { cn } from '@/lib/utils';
import { CODIGO_PADI_EXENTA, CODIGOS_PADI_IVA, DUPLICATE_RUT_ERROR_CODE } from '@/modules/empresa/plan-cuentas';

/**
 * Agregar nueva empresa — .context/design/master-design-plan.md §4.7,
 * mockup en .context/designs/tudeclaracion/company-onboarding/company-onboarding-2.html
 *
 * Rediseño TD-7/TD-24 (2026-07-15): reemplaza el mapa fijo de 5 cuentas por
 * dos tablas libres — ver engram topic tax-rules/2181-amount-resolution-two-paths
 * y SRS/06-normalizer.md / SRS/08-tax-engine.md para la regla de negocio
 * (Camino 1: Código IVA > 0 vía "formato rápido" / Camino 2: cuenta contable
 * para asientos abiertos, incluye Compras exentas).
 *
 * Parte A (TD-8): datos de la empresa. Parte B (TD-7/TD-24): plan de cuentas
 * libre. Ambas partes se guardan en una sola transacción vía el RPC
 * crear_empresa_con_plan_cuentas.
 */
const selectClassName = cn(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
);

interface IvaRow {
  key: string
  codigoIva: string
  cuentaContable: string
  codigoPadi: string
}

interface ExentaRow {
  key: string
  cuentaContable: string
}

function emptyIvaRow(key: string): IvaRow {
  return { key, codigoIva: '', cuentaContable: '', codigoPadi: CODIGOS_PADI_IVA[0].value };
}

function emptyExentaRow(key: string): ExentaRow {
  return { key, cuentaContable: '' };
}

export function NuevaEmpresaClient() {
  const router = useRouter();
  const nextKey = useRef(2);

  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [ivaRows, setIvaRows] = useState<IvaRow[]>([emptyIvaRow('iva-0')]);
  const [exentaRows, setExentaRows] = useState<ExentaRow[]>([emptyExentaRow('exenta-0')]);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateRutError, setDuplicateRutError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ nombre: string, rut: string } | null>(null);

  function handleRutChange(value: string) {
    setRut(value.replace(/\D/g, ''));
    setDuplicateRutError(false);
  }

  function addIvaRow() {
    setIvaRows(prev => [...prev, emptyIvaRow(`iva-${nextKey.current++}`)]);
  }

  function removeIvaRow(key: string) {
    setIvaRows(prev => prev.filter(r => r.key !== key));
  }

  function updateIvaRow(key: string, patch: Partial<IvaRow>) {
    setIvaRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addExentaRow() {
    setExentaRows(prev => [...prev, emptyExentaRow(`exenta-${nextKey.current++}`)]);
  }

  function removeExentaRow(key: string) {
    setExentaRows(prev => prev.filter(r => r.key !== key));
  }

  function updateExentaRow(key: string, patch: Partial<ExentaRow>) {
    setExentaRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
  }

  const missingRut = submitted && rut.trim() === '';
  const invalidRutLength = submitted && rut.trim() !== '' && rut.trim().length !== 12;
  const missingNombre = submitted && nombre.trim() === '';
  const ivaRowsIncomplete = ivaRows.some(r => r.codigoIva.trim() === '' || r.cuentaContable.trim() === '');
  const exentaRowsIncomplete = exentaRows.some(r => r.cuentaContable.trim() === '');

  async function handleSubmit() {
    setSubmitted(true);
    setDuplicateRutError(false);

    const trimmedRut = rut.trim();
    const trimmedNombre = nombre.trim();

    if (trimmedRut === '' || trimmedRut.length !== 12 || trimmedNombre === '' || ivaRowsIncomplete || exentaRowsIncomplete) {
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_empresa_con_plan_cuentas', {
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
      setDuplicateRutError(true);
      return;
    }

    if (error) {
      throw new Error(`No se pudo crear la empresa: ${error.message}`);
    }

    setSuccess({ nombre: trimmedNombre, rut: trimmedRut });
  }

  function handleAddAnother() {
    setRut('');
    setNombre('');
    setIvaRows([emptyIvaRow(`iva-${nextKey.current++}`)]);
    setExentaRows([emptyExentaRow(`exenta-${nextKey.current++}`)]);
    setSubmitted(false);
    setDuplicateRutError(false);
    setSuccess(null);
  }

  if (success) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <div className="grid w-full max-w-[600px] gap-4 rounded-lg border border-border bg-card p-10 shadow-md">
          <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
            <strong className="mb-1 block">Empresa creada correctamente.</strong>
            {`${success.nombre} (RUT ${success.rut}) ya está disponible en tu listado, con el mapeo inicial completo para empezar la carga del Formulario 2181.`}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="h-[52px]" onClick={() => router.push('/empresas')}>
              Volver a empresas
            </Button>
            <Button type="button" variant="outline" size="lg" className="h-[52px]" onClick={handleAddAnother}>
              Agregar otra empresa
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[760px] gap-6 rounded-lg border border-border bg-card p-10 shadow-md">
        <div>
          <strong className="text-lg">Agregá la empresa y dejá listo el vínculo con los conceptos fiscales del 2181.</strong>
          <p className="mt-2 text-muted-foreground">
            Registrás RUT y nombre. En el mismo flujo completás cómo el motor va a leer el archivo que subís cada mes.
          </p>
        </div>

        <section className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Datos de la empresa</h2>

          <div className="grid gap-2">
            <Label htmlFor="rut">RUT</Label>
            <Input
              id="rut"
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="214589630019"
              className="h-[52px]"
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
            {duplicateRutError && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                Este RUT ya está registrado en tu cuenta.
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre de la empresa</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Comercial del Sur S.A."
              className="h-[52px]"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
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
              Para cada código de IVA que uses (0 a 9), indicá a qué cuenta contable corresponde y a qué
              línea de PADI se declara.
            </p>
          </div>

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
                    disabled={ivaRows.length === 1}
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
              Cargá acá todas las cuentas contables que representen bienes o servicios exentos (ej. gasoil, leche,
              carne). Todas se declaran juntas en la línea 504.
            </p>
          </div>

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
                    disabled={exentaRows.length === 1}
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

          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addExentaRow}>
            + Agregar cuenta exenta
          </Button>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear empresa'}
          </Button>
          <Button type="button" variant="outline" size="lg" className="h-[52px]" onClick={() => router.push('/empresas')}>
            Cancelar
          </Button>
        </div>
      </div>
    </main>
  );
}
