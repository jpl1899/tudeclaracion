'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';

/**
 * Agregar nueva empresa — .context/design/master-design-plan.md §4.7,
 * mockup en .context/designs/tudeclaracion/company-onboarding/company-onboarding-2.html
 *
 * Built against /empresas' existing simple shell, not the mockup's
 * dashboard-sidebar chrome — see §5 D4 for the ratified divergence.
 *
 * Parte A (TD-8): datos de la empresa. Parte B (TD-7, self-service desde el
 * 2026-07-12): mapa fijo de 5 cuentas contables. Ambas partes se guardan en
 * una sola transacción vía el RPC crear_empresa_con_plan_cuentas.
 */
export interface CodigoIva {
  id: number
  tipo: string
  tasa: number
  rubro_padi: string
  descripcion: string
}

const DUPLICATE_RUT_ERROR_CODE = '23505';

export function NuevaEmpresaClient({ catalogo }: { catalogo: CodigoIva[] }) {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [cuentas, setCuentas] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [duplicateRutError, setDuplicateRutError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ nombre: string, rut: string } | null>(null);

  function handleRutChange(value: string) {
    setRut(value.replace(/\D/g, ''));
    setDuplicateRutError(false);
  }

  function handleCuentaChange(codigoIvaId: number, value: string) {
    setCuentas(prev => ({ ...prev, [codigoIvaId]: value }));
  }

  const missingRut = submitted && rut.trim() === '';
  const missingNombre = submitted && nombre.trim() === '';

  async function handleSubmit() {
    setSubmitted(true);
    setDuplicateRutError(false);

    const trimmedRut = rut.trim();
    const trimmedNombre = nombre.trim();
    const cuentasCompletas = catalogo.every(c => (cuentas[c.id] ?? '').trim() !== '');

    if (trimmedRut === '' || trimmedNombre === '' || !cuentasCompletas) {
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_empresa_con_plan_cuentas', {
      p_rut: trimmedRut,
      p_nombre: trimmedNombre,
      p_cuentas: catalogo.map(c => ({ codigo_iva: c.id, numero_cuenta: cuentas[c.id]?.trim() })),
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
    setCuentas({});
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
      <div className="grid w-full max-w-[720px] gap-6 rounded-lg border border-border bg-card p-10 shadow-md">
        <div>
          <strong className="text-lg">Agregá la empresa y dejá listo el vínculo con los conceptos fiscales del 2181.</strong>
          <p className="mt-2 text-muted-foreground">
            Primero registrás RUT y nombre. En el mismo flujo completás las cinco cuentas contables base que usa
            el motor para resolver compras, ventas y exentos sin carga manual posterior.
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
              placeholder="214589630019"
              className="h-[52px]"
              value={rut}
              onChange={e => handleRutChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Ingresá el RUT completo, sin puntos ni guiones.</p>
            {missingRut && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                El RUT es obligatorio.
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
              Mapa inicial de cuentas contables
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estas cinco relaciones conectan tu plan de cuentas con las líneas fiscales estándar que usa DGI
              en el 2181.
            </p>
          </div>

          <div className="grid gap-3">
            {catalogo.map((c) => {
              const missingCuenta = submitted && (cuentas[c.id] ?? '').trim() === '';
              return (
                <div key={c.id} className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-md border border-border bg-muted/40 p-4">
                  <div className="grid gap-0.5">
                    <strong className="text-sm">{c.tipo}</strong>
                    <span className="text-xs text-muted-foreground">
                      {c.tasa}
                      % — concepto fiscal fijo
                    </span>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`cuenta-${c.id}`}>Número de cuenta contable</Label>
                    <Input
                      id={`cuenta-${c.id}`}
                      type="text"
                      inputMode="numeric"
                      className="h-[52px]"
                      value={cuentas[c.id] ?? ''}
                      onChange={e => handleCuentaChange(c.id, e.target.value)}
                    />
                    {missingCuenta && (
                      <span className="text-sm text-error-text">
                        {`Completá la cuenta para ${c.tipo} ${c.tasa}%.`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
