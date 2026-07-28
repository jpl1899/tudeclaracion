import { describe, expect, it, vi } from 'vitest';
import * as fetchBcu from './fetch-cotizacion-bcu';
import { asegurarCotizacionesBcuCacheadas, resolverCotizacionParaDia } from './resolve-cotizacion-por-dia';

function mockSupabase(overrides: { upsert?: ReturnType<typeof vi.fn>, select?: ReturnType<typeof vi.fn> } = {}) {
  const from = vi.fn(() => ({
    upsert: overrides.upsert ?? vi.fn().mockResolvedValue({ error: null }),
    select: overrides.select ?? vi.fn(),
  }));
  return { from } as unknown as Parameters<typeof asegurarCotizacionesBcuCacheadas>[0];
}

describe('asegurarCotizacionesBcuCacheadas', () => {
  it('upserts every cotización returned by the BCU for the período range', async () => {
    vi.spyOn(fetchBcu, 'obtenerCotizacionesBcuRango').mockResolvedValue([
      { fecha: '2026-06-30', valor: 40.1 },
      { fecha: '2026-07-01', valor: 40.2 },
    ]);
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = mockSupabase({ upsert });

    await asegurarCotizacionesBcuCacheadas(supabase, '202607');

    expect(upsert).toHaveBeenCalledWith([
      { moneda_codigo: fetchBcu.CODIGO_DOLAR_INTERBANCARIO_FONDO, fecha: '2026-06-30', valor: 40.1 },
      { moneda_codigo: fetchBcu.CODIGO_DOLAR_INTERBANCARIO_FONDO, fecha: '2026-07-01', valor: 40.2 },
    ]);
  });

  it('does not touch the cache when the BCU returns nothing for the range', async () => {
    vi.spyOn(fetchBcu, 'obtenerCotizacionesBcuRango').mockResolvedValue([]);
    const upsert = vi.fn();
    const supabase = mockSupabase({ upsert });

    await asegurarCotizacionesBcuCacheadas(supabase, '202607');

    expect(upsert).not.toHaveBeenCalled();
  });
});

describe('resolverCotizacionParaDia', () => {
  function mockSelectChain(maybeSingleResult: { data: { valor: number } | null }) {
    const chain = {
      eq: vi.fn(function (this: unknown) { return this; }),
      lt: vi.fn(function (this: unknown) { return this; }),
      order: vi.fn(function (this: unknown) { return this; }),
      limit: vi.fn(function (this: unknown) { return this; }),
      maybeSingle: vi.fn().mockResolvedValue(maybeSingleResult),
    };
    return vi.fn(() => chain);
  }

  it('resolves the value of the most recent cached day strictly before the asiento date', async () => {
    const select = mockSelectChain({ data: { valor: 40.251 } });
    const supabase = mockSupabase({ select });

    const valor = await resolverCotizacionParaDia(supabase, '202607', 7);

    expect(valor).toBe(40.251);
    const chain = select.mock.results[0].value;
    expect(chain.lt).toHaveBeenCalledWith('fecha', '2026-07-07');
    expect(chain.order).toHaveBeenCalledWith('fecha', { ascending: false });
  });

  it('returns null when there is no cached day before the asiento date', async () => {
    const select = mockSelectChain({ data: null });
    const supabase = mockSupabase({ select });

    const valor = await resolverCotizacionParaDia(supabase, '202607', 1);

    expect(valor).toBeNull();
  });
});
