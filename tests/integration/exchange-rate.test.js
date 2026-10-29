import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ExchangeRateClient,
  ExchangeRateError,
} from '../../src/api/exchange-rate-client.js';

const currencyResponse = {
  USD: 'United States Dollar',
  EUR: 'Euro',
};

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('Frankfurter exchange rate client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('loads the supported currencies', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(currencyResponse));
    const client = new ExchangeRateClient({ fetchImpl });

    await expect(client.getCurrencies()).resolves.toEqual(currencyResponse);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/currencies',
      expect.any(Object),
    );
    expect(fetchImpl.mock.calls[0][1]).toEqual({
      headers: { Accept: 'application/json' },
    });
  });

  it('requests and validates a successful latest rate', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        amount: 1,
        base: 'USD',
        date: '2026-10-28',
        rates: { EUR: 0.92 },
      }),
    );
    const client = new ExchangeRateClient({ fetchImpl });

    await expect(client.getRate('USD', 'EUR', ['USD', 'EUR'])).resolves.toEqual({
      rate: 0.92,
      observationDate: '2026-10-28',
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR',
      expect.any(Object),
    );
  });

  it('does not require a provider date', async () => {
    const client = new ExchangeRateClient({
      fetchImpl: vi.fn().mockResolvedValue(
        jsonResponse({ base: 'USD', rates: { EUR: 0.92 } }),
      ),
    });

    await expect(client.getRate('USD', 'EUR', ['USD', 'EUR'])).resolves.toEqual({
      rate: 0.92,
      observationDate: null,
    });
  });

  it('maps network, HTTP, and malformed JSON failures', async () => {
    const cases = [
      [() => Promise.reject(new TypeError('offline')), 'NETWORK'],
      [() => Promise.resolve(jsonResponse({}, 503)), 'HTTP'],
      [
        () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.reject(new SyntaxError('invalid JSON')),
          }),
        'MALFORMED_RESPONSE',
      ],
    ];

    for (const [fetchFactory, expectedCode] of cases) {
      const client = new ExchangeRateClient({ fetchImpl: vi.fn(fetchFactory) });
      await expect(client.getCurrencies()).rejects.toMatchObject({
        name: 'ExchangeRateError',
        code: expectedCode,
      });
    }
  });

  it.each([
    [
      'an unsupported currency',
      { base: 'USD', rates: { EUR: 0.92 } },
      'GBP',
      'UNSUPPORTED_CURRENCY',
    ],
    ['an unexpected base currency', { base: 'GBP', rates: { EUR: 0.92 } }, 'EUR', 'INVALID_RESPONSE'],
    ['a missing rates object', { base: 'USD' }, 'EUR', 'RATE_UNAVAILABLE'],
    ['a missing destination rate', { base: 'USD', rates: {} }, 'EUR', 'RATE_UNAVAILABLE'],
    ['a non-numeric rate', { base: 'USD', rates: { EUR: '0.92' } }, 'EUR', 'INVALID_RATE'],
    ['a non-finite rate', { base: 'USD', rates: { EUR: Infinity } }, 'EUR', 'INVALID_RATE'],
    ['a non-positive rate', { base: 'USD', rates: { EUR: 0 } }, 'EUR', 'INVALID_RATE'],
  ])('rejects %s', async (_description, body, toCurrency, expectedCode) => {
    const client = new ExchangeRateClient({
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse(body)),
    });

    await expect(
      client.getRate('USD', toCurrency, ['USD', 'EUR']),
    ).rejects.toMatchObject({
      name: ExchangeRateError.name,
      code: expectedCode,
    });
  });
});
