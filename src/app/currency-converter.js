import {
  ExchangeRateClient,
  ExchangeRateError,
} from '../api/exchange-rate-client.js';
import { convertAmount } from '../utils/conversion.js';
import { AmountValidationError, parseAmount } from '../utils/validation.js';
import { createConverterForm } from '../ui/form.js';

const ERROR_MESSAGES = {
  NETWORK:
    'No se pudo conectar con el servicio de tipos de cambio. Comprueba tu conexión e inténtalo de nuevo.',
  HTTP: 'El servicio de tipos de cambio no está disponible en este momento.',
  MALFORMED_RESPONSE: 'El servicio devolvió una respuesta que no se pudo verificar.',
  INVALID_RESPONSE: 'El servicio devolvió datos que no se pudieron verificar.',
  UNSUPPORTED_CURRENCY:
    'Una de las monedas seleccionadas no está disponible. Elige otra moneda.',
  RATE_UNAVAILABLE: 'No hay un tipo de cambio disponible para las monedas seleccionadas.',
  INVALID_RATE: 'El tipo de cambio recibido no es válido. Inténtalo más tarde.',
};

function getErrorMessage(error) {
  if (error instanceof AmountValidationError) {
    return error.message;
  }
  if (error instanceof ExchangeRateError) {
    return ERROR_MESSAGES[error.code] ?? 'No se pudo completar la conversión. Inténtalo de nuevo.';
  }
  return 'No se pudo completar la conversión. Inténtalo de nuevo.';
}

export function mountCurrencyConverter({
  root = document,
  client = new ExchangeRateClient(),
} = {}) {
  const form = createConverterForm(root);
  let supportedCurrencies = [];
  let initialized = false;

  async function convert({ amount: rawAmount, fromCurrency, toCurrency }) {
    form.clearOutput();

    let amount;
    try {
      amount = parseAmount(rawAmount);
      if (!supportedCurrencies.includes(fromCurrency) || !supportedCurrencies.includes(toCurrency)) {
        throw new ExchangeRateError(
          'UNSUPPORTED_CURRENCY',
          'Una de las monedas seleccionadas no está disponible.',
        );
      }
    } catch (error) {
      form.showError(getErrorMessage(error));
      return null;
    }

    try {
      let result;
      if (fromCurrency === toCurrency) {
        result = convertAmount({ amount, fromCurrency, toCurrency });
      } else {
        form.showLoading();
        const { rate, observationDate } = await client.getRate(
          fromCurrency,
          toCurrency,
          supportedCurrencies,
        );
        result = convertAmount({
          amount,
          fromCurrency,
          toCurrency,
          exchangeRate: rate,
          observationDate,
        });
      }

      form.hideLoading();
      form.showResult(result);
      return result;
    } catch (error) {
      form.showError(getErrorMessage(error));
      return null;
    }
  }

  async function initialize() {
    form.showLoading('Cargando monedas disponibles…');
    try {
      const currencies = await client.getCurrencies();
      supportedCurrencies = Object.keys(currencies);
      form.setCurrencies(currencies);
      initialized = true;
      form.hideLoading();
    } catch (error) {
      form.showError(getErrorMessage(error));
    }
  }

  form.onSubmit((request) => {
    if (initialized) {
      void convert(request);
    }
  });

  return { convert, initialize };
}
