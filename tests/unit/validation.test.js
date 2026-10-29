import { describe, expect, it } from 'vitest';
import { AmountValidationError, parseAmount } from '../../src/utils/validation.js';

describe('amount validation', () => {
  it.each(['', '   ', 'abc', 'Infinity', '-1', '1,2,3', '1.2.3', '1,234.56'])(
    'rejects %j',
    (value) => {
      expect(() => parseAmount(value)).toThrow(AmountValidationError);
    },
  );

  it.each([
    ['0', 0],
    ['100', 100],
    ['1,25', 1.25],
    ['1.25', 1.25],
  ])('accepts %s as %s', (value, expected) => {
    expect(parseAmount(value)).toBe(expected);
  });
});
