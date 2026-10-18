import { describe, expect, it } from 'vitest';
import { construirResumenInicio, iniciales } from './resumen-inicio';

describe('construirResumenInicio', () => {
  it('greets by the first word of the name', () => {
    expect(construirResumenInicio({ nombre: 'Juan Leites', empresas: 1, pendientes: 0 }).saludo).toBe('Hola, Juan');
  });

  it.each([null, '', '   '])('greets without a name when nombre is %j', (nombre) => {
    expect(construirResumenInicio({ nombre, empresas: 1, pendientes: 0 }).saludo).toBe('Hola');
  });

  it('pluralises companies and pending declarations', () => {
    expect(construirResumenInicio({ nombre: null, empresas: 4, pendientes: 2 }).resumen)
      .toBe('4 empresas · 2 declaraciones pendientes de generar');
    expect(construirResumenInicio({ nombre: null, empresas: 1, pendientes: 1 }).resumen)
      .toBe('1 empresa · 1 declaración pendiente de generar');
  });

  it('says there is nothing pending when the count is 0', () => {
    expect(construirResumenInicio({ nombre: null, empresas: 3, pendientes: 0 }).resumen)
      .toBe('3 empresas · Sin declaraciones pendientes');
  });

  it('invites to add a company when there are none', () => {
    expect(construirResumenInicio({ nombre: null, empresas: 0, pendientes: 0 }).resumen)
      .toBe('Todavía no cargaste empresas');
  });

  it('has no summary when the counts are unavailable', () => {
    expect(construirResumenInicio({ nombre: null, empresas: null, pendientes: 2 }).resumen).toBeNull();
    expect(construirResumenInicio({ nombre: null, empresas: 2, pendientes: null }).resumen).toBeNull();
  });
});

describe('iniciales', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(iniciales('juan leites')).toBe('JL');
    expect(iniciales('Juan Pablo Leites')).toBe('JP');
  });

  it('uses a single letter for a single word and ignores extra spaces', () => {
    expect(iniciales('  Juan  ')).toBe('J');
    expect(iniciales(' juan   leites ')).toBe('JL');
  });

  it.each([null, '', '   '])('returns null for %j', (nombre) => {
    expect(iniciales(nombre)).toBeNull();
  });
});
