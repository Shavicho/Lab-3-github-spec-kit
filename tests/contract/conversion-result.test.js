import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

const schema = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      'specs/001-currency-conversion/contracts/conversion-result.schema.json',
    ),
    'utf8',
  ),
);
const validate = new Ajv2020({ allErrors: true }).compile(schema);

describe('conversion result contract', () => {
  it('accepts a verified Frankfurter conversion', () => {
    expect(
      validate({
        originalAmount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        exchangeRate: 0.92,
        convertedAmount: 92,
        observationDate: '2026-10-28',
        rateSource: 'frankfurter',
      }),
    ).toBe(true);
  });

  it('accepts an identity conversion without an observation date', () => {
    expect(
      validate({
        originalAmount: 50,
        fromCurrency: 'EUR',
        toCurrency: 'EUR',
        exchangeRate: 1,
        convertedAmount: 50,
        observationDate: null,
        rateSource: 'identity',
      }),
    ).toBe(true);
  });

  it.each([
    ['a non-positive exchange rate', { exchangeRate: 0 }],
    ['an invalid currency code', { fromCurrency: 'US' }],
    ['an invalid date', { observationDate: '2026-10-28T12:00:00Z' }],
    ['an unsupported source', { rateSource: 'fallback' }],
    ['an extra field', { extra: true }],
  ])('rejects %s', (_description, override) => {
    const result = {
      originalAmount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      convertedAmount: 92,
      observationDate: '2026-10-28',
      rateSource: 'frankfurter',
      ...override,
    };

    expect(validate(result)).toBe(false);
  });
});
