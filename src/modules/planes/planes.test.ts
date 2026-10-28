import { describe, expect, it } from 'vitest';
import { PLANES, resolverPlan } from './planes';

describe('resolverPlan', () => {
  it('returns the plan for a known id', () => {
    expect(resolverPlan('estudio')?.nombre).toBe('Estudio');
  });

  it('returns null for an unknown, empty or missing value', () => {
    expect(resolverPlan('gratis')).toBeNull();
    expect(resolverPlan('')).toBeNull();
    expect(resolverPlan(null)).toBeNull();
  });
});

describe('plan catalog', () => {
  it('marks exactly one plan as recommended', () => {
    expect(PLANES.filter(plan => plan.recomendado)).toHaveLength(1);
  });

  it('prices the annual plan as ten monthly payments (2 months free)', () => {
    for (const plan of PLANES) {
      expect(plan.precioAnualUsd).toBe(plan.precioMensualUsd * 10);
    }
  });
});
