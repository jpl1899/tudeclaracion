const LENGTH_MIN = 10;
const UPPER_RE = /[A-ZÁÉÍÓÚÜÑ]/;
const LOWER_RE = /[a-záéíóúüñ]/;
const DIGIT_RE = /\d/;

export interface PasswordRules {
  length: boolean
  upper: boolean
  lower: boolean
  digit: boolean
}

export function getPasswordRules(value: string): PasswordRules {
  return {
    length: value.length >= LENGTH_MIN,
    upper: UPPER_RE.test(value),
    lower: LOWER_RE.test(value),
    digit: DIGIT_RE.test(value),
  };
}

export function passwordMeetsRequirements(value: string): boolean {
  return Object.values(getPasswordRules(value)).every(Boolean);
}
