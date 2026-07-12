import { describe, expect, it } from 'vitest';
import { getPasswordRules, passwordMeetsRequirements } from './password-rules';

describe('getPasswordRules', () => {
  it('marks every rule false for an empty string', () => {
    expect(getPasswordRules('')).toEqual({
      length: false,
      upper: false,
      lower: false,
      digit: false,
    });
  });

  it('detects each rule independently', () => {
    expect(getPasswordRules('short1A').length).toBe(false);
    expect(getPasswordRules('nouppercase1').upper).toBe(false);
    expect(getPasswordRules('NOLOWERCASE1').lower).toBe(false);
    expect(getPasswordRules('NoDigitsHere').digit).toBe(false);
  });

  it('accepts accented Spanish uppercase and lowercase letters', () => {
    expect(getPasswordRules('contraseñaÑ1').upper).toBe(true);
    expect(getPasswordRules('contraseñaÑ1').lower).toBe(true);
  });
});

describe('passwordMeetsRequirements', () => {
  it('returns false when any rule fails', () => {
    expect(passwordMeetsRequirements('weak')).toBe(false);
  });

  it('returns true when all rules pass', () => {
    expect(passwordMeetsRequirements('ClaveSegura2181')).toBe(true);
  });
});
