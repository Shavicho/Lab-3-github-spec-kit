export function getCurrencyFractionDigits(currency) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits;
}

export function roundForCurrency(amount, currency) {
  const fractionDigits = getCurrencyFractionDigits(currency);
  const factor = 10 ** fractionDigits;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function convertAmount({
  amount,
  fromCurrency,
  toCurrency,
  exchangeRate,
  observationDate = null,
}) {
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      exchangeRate: 1,
      convertedAmount: amount,
      observationDate: null,
      rateSource: 'identity',
    };
  }

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new RangeError('No se puede calcular sin un tipo de cambio válido.');
  }

  const convertedAmount = roundForCurrency(amount * exchangeRate, toCurrency);
  if (!Number.isFinite(convertedAmount)) {
    throw new RangeError('El importe convertido está fuera del rango permitido.');
  }

  return {
    originalAmount: amount,
    fromCurrency,
    toCurrency,
    exchangeRate,
    convertedAmount,
    observationDate,
    rateSource: 'frankfurter',
  };
}

export function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatExchangeRate(rate) {
  return new Intl.NumberFormat('es-ES', {
    maximumSignificantDigits: 10,
  }).format(rate);
}
