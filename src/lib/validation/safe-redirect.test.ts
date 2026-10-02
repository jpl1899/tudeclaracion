import { describe, expect, it } from 'vitest';
import { safeInternalPath } from './safe-redirect';

describe('safeInternalPath', () => {
  it('keeps internal paths, including query and hash', () => {
    expect(safeInternalPath('/empresas', '/login')).toBe('/empresas');
    expect(safeInternalPath('/reset-password', '/login')).toBe('/reset-password');
    expect(safeInternalPath('/dashboard/cotizaciones?periodo=202601#top', '/login')).toBe('/dashboard/cotizaciones?periodo=202601#top');
  });

  it('falls back when next is missing or empty', () => {
    expect(safeInternalPath(null, '/empresas')).toBe('/empresas');
    expect(safeInternalPath('', '/empresas')).toBe('/empresas');
  });

  it.each([
    'https://evil.example',
    'http://evil.example/empresas',
    '//evil.example',
    '/\\evil.example',
    '\\\\evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
    'javascript:alert(1)',
    'empresas',
    ' https://evil.example',
  ])('rejects %j and falls back', (next) => {
    expect(safeInternalPath(next, '/empresas')).toBe('/empresas');
  });
});
