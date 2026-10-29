const API_BASE_URL = 'https://api.frankfurter.app';

export class ExchangeRateError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ExchangeRateError';
    this.code = code;
  }
}

export class ExchangeRateClient {
  constructor({
    fetchImpl = globalThis.fetch?.bind(globalThis),
    baseUrl = API_BASE_URL,
  } = {}) {
    if (typeof fetchImpl !== 'function') {
      throw new TypeError('Se requiere una implementación de fetch.');
    }

    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getCurrencies() {
    const response = await this.#request(`${this.baseUrl}/currencies`);
    const currencies = await this.#readJson(response);

    if (
      currencies === null ||
      typeof currencies !== 'object' ||
      Array.isArray(currencies) ||
      Object.keys(currencies).length === 0 ||
      Object.entries(currencies).some(
        ([code, name]) => !/^[A-Z]{3}$/.test(code) || typeof name !== 'string',
      )
    ) {
      throw new ExchangeRateError(
        'INVALID_RESPONSE',
        'La lista de monedas recibida no es válida.',
      );
    }

    return currencies;
  }

  async getRate(fromCurrency, toCurrency, supportedCurrencies) {
    if (
      !Array.isArray(supportedCurrencies) ||
      !supportedCurrencies.includes(fromCurrency) ||
      !supportedCurrencies.includes(toCurrency)
    ) {
      throw new ExchangeRateError(
        'UNSUPPORTED_CURRENCY',
        'Una de las monedas seleccionadas no está disponible.',
      );
    }

    const url = new URL(`${this.baseUrl}/latest`);
    url.searchParams.set('from', fromCurrency);
    url.searchParams.set('to', toCurrency);
    const response = await this.#request(url.toString());
    const data = await this.#readJson(response);

    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new ExchangeRateError(
        'INVALID_RESPONSE',
        'La respuesta del servicio no es válida.',
      );
    }

    if (data.base !== fromCurrency) {
      throw new ExchangeRateError(
        'INVALID_RESPONSE',
        'La moneda base de la respuesta no coincide con la solicitada.',
      );
    }

    if (
      data.rates === null ||
      typeof data.rates !== 'object' ||
      Array.isArray(data.rates) ||
      !Object.hasOwn(data.rates, toCurrency)
    ) {
      throw new ExchangeRateError(
        'RATE_UNAVAILABLE',
        'El servicio no devolvió un tipo de cambio para la moneda seleccionada.',
      );
    }

    const rate = data.rates[toCurrency];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new ExchangeRateError(
        'INVALID_RATE',
        'El servicio devolvió un tipo de cambio que no se puede verificar.',
      );
    }

    const observationDate =
      typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
        ? data.date
        : null;

    return { rate, observationDate };
  }

  async #request(url) {
    let response;
    try {
      response = await this.fetchImpl(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
    } catch {
      throw new ExchangeRateError(
        'NETWORK',
        'No se pudo conectar con el servicio de tipos de cambio.',
      );
    }

    if (!response.ok) {
      throw new ExchangeRateError(
        'HTTP',
        'El servicio de tipos de cambio no está disponible.',
      );
    }

    return response;
  }

  async #readJson(response) {
    try {
      return await response.json();
    } catch {
      throw new ExchangeRateError(
        'MALFORMED_RESPONSE',
        'El servicio devolvió una respuesta que no se pudo leer.',
      );
    }
  }
}
