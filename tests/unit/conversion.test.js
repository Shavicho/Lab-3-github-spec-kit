import { describe, expect, it } from 'vitest';
import {
  convertAmount,
  getCurrencyFractionDigits,
  roundForCurrency,
} from '../../src/utils/conversion.js';

describe('currency conversion', () => {
  it('multiplies the amount by the exchange rate', () => {
    expect(
      convertAmount({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        exchangeRate: 0.92,
        observationDate: '2026-10-28',
      }),
    ).toEqual({
      originalAmount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      convertedAmount: 92,
      observationDate: '2026-10-28',
      rateSource: 'frankfurter',
    });
  });

  it('uses the destination currency fraction digits', () => {
    expect(getCurrencyFractionDigits('JPY')).toBe(0);
    expect(getCurrencyFractionDigits('USD')).toBe(2);
    expect(getCurrencyFractionDigits('KWD')).toBe(3);
  });

  it('rounds converted values to the destination currency precision', () => {
    expect(roundForCurrency(1.005, 'USD')).toBe(1.01);
    expect(roundForCurrency(12.8, 'JPY')).toBe(13);
    expect(roundForCurrency(1.23456, 'KWD')).toBe(1.235);
  });

  it('returns an identity conversion without requiring a rate', () => {
    expect(
      convertAmount({
        amount: 12.34,
        fromCurrency: 'EUR',
        toCurrency: 'EUR',
      }),
    ).toEqual({
      originalAmount: 12.34,
      fromCurrency: 'EUR',
      toCurrency: 'EUR',
      exchangeRate: 1,
      convertedAmount: 12.34,
      observationDate: null,
      rateSource: 'identity',
    });
  });
});
