export class AmountValidationError extends Error {
  constructor(message = 'Introduce una cantidad válida, igual o mayor que cero.') {
    super(message);
    this.name = 'AmountValidationError';
  }
}

export function parseAmount(value) {
  const normalized = String(value).trim();

  if (!/^\d+(?:[.,]\d+)?$/.test(normalized)) {
    throw new AmountValidationError();
  }

  const amount = Number(normalized.replace(',', '.'));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new AmountValidationError();
  }

  return amount;
}
