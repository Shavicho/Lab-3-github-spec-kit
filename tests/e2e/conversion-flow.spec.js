import { expect, test } from '@playwright/test';

const currencies = {
  EUR: 'Euro',
  GBP: 'British Pound',
  USD: 'United States Dollar',
};
const corsHeaders = { 'access-control-allow-origin': '*' };

async function openConverter(page) {
  await page.route('https://api.frankfurter.dev/v1/currencies**', (route) =>
    route.fulfill({ json: currencies, headers: corsHeaders }),
  );
  await page.goto('/');
  await expect(page.getByLabel('Cantidad')).toBeVisible();
  await expect(page.getByLabel('Moneda de destino')).toHaveValue('EUR');
}

async function submitConversion(page, amount = '100') {
  await page.getByLabel('Cantidad').fill(amount);
  await page.getByRole('button', { name: 'Convertir' }).click();
}

test('converts an amount and displays the reference date without a time', async ({
  page,
}) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.fulfill({
      json: {
        amount: 1,
        base: 'USD',
        date: '2026-10-28',
        rates: { EUR: 0.92 },
      },
      headers: corsHeaders,
    }),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  const result = page.locator('#result');
  await expect(result).toBeVisible();
  await expect(result).toContainText('92,00');
  await expect(result).toContainText('1 USD = 0,92 EUR');
  const date = result.locator('time');
  await expect(date).toHaveAttribute('datetime', '2026-10-28');
  await expect(date).toHaveText('2026-10-28');
  await expect(date).not.toContainText('T');
});

test('returns the original amount for identical currencies without requesting a rate', async ({
  page,
}) => {
  await openConverter(page);
  let rateRequested = false;
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) => {
    rateRequested = true;
    return route.fulfill({
      json: { amount: 1, base: 'EUR', rates: { EUR: 1 } },
      headers: corsHeaders,
    });
  });
  await page.getByLabel('Moneda de origen').selectOption('EUR');

  await submitConversion(page, '50');

  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('[data-testid="converted-amount"]')).toContainText(
    '50,00',
  );
  expect(rateRequested).toBe(false);
  await expect(page.locator('#result')).not.toContainText('Fecha de referencia');
});

test('swaps the selected currencies', async ({ page }) => {
  await openConverter(page);
  await page.getByLabel('Moneda de origen').selectOption('USD');
  await page.getByRole('button', { name: 'Intercambiar monedas' }).click();

  await expect(page.getByLabel('Moneda de origen')).toHaveValue('EUR');
  await expect(page.getByLabel('Moneda de destino')).toHaveValue('USD');
});

test('keeps the loading indicator visible until the rate response resolves', async ({
  page,
}) => {
  await openConverter(page);
  let resolveRate;
  const pendingResponse = new Promise((resolve) => {
    resolveRate = resolve;
  });
  await page.route('https://api.frankfurter.dev/v1/latest?**', async (route) => {
    await pendingResponse;
    await route.fulfill({
      json: {
        amount: 1,
        base: 'USD',
        date: '2026-10-28',
        rates: { EUR: 0.92 },
      },
      headers: corsHeaders,
    });
  });
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('status')).toHaveText(
    'Consultando el tipo de cambio…',
  );
  await expect(page.getByRole('status')).toBeVisible();
  resolveRate();
  await expect(page.getByRole('status')).toBeHidden();
  await expect(page.locator('#result')).toBeVisible();
});

test('shows Spanish feedback and hides the result when the provider fails', async ({
  page,
}) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.fulfill({
      status: 503,
      json: { message: 'unavailable' },
      headers: corsHeaders,
    }),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('alert')).toContainText(
    'no está disponible en este momento',
  );
  await expect(page.locator('#result')).toBeHidden();
});

test('rejects invalid amounts before querying the provider', async ({ page }) => {
  await openConverter(page);
  let rateRequested = false;
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) => {
    rateRequested = true;
    return route.fulfill({
      json: { base: 'USD', rates: { EUR: 0.92 } },
      headers: corsHeaders,
    });
  });
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page, '1,2,3');

  await expect(page.getByRole('alert')).toContainText('cantidad válida');
  await expect(page.locator('#result')).toBeHidden();
  expect(rateRequested).toBe(false);
});

test('keeps a failed network request out of the result region', async ({ page }) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.abort(),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('alert')).toContainText(
    'No se pudo conectar con el servicio',
  );
  await expect(page.locator('#result')).toBeHidden();
});

test('shows an error and hides the result for malformed or unusable rates', async ({
  page,
}) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{',
      headers: corsHeaders,
    }),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('alert')).toContainText(
    'respuesta que no se pudo verificar',
  );
  await expect(page.locator('#result')).toBeHidden();
});

test('shows an error and hides the result when the requested rate is missing', async ({
  page,
}) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.fulfill({
      json: { amount: 1, base: 'USD', rates: {} },
      headers: corsHeaders,
    }),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('alert')).toContainText(
    'No hay un tipo de cambio disponible',
  );
  await expect(page.locator('#result')).toBeHidden();
});

test('shows an error and hides the result when the provider rate is invalid', async ({
  page,
}) => {
  await openConverter(page);
  await page.route('https://api.frankfurter.dev/v1/latest?**', (route) =>
    route.fulfill({
      json: { amount: 1, base: 'USD', rates: { EUR: -1 } },
      headers: corsHeaders,
    }),
  );
  await page.getByLabel('Moneda de origen').selectOption('USD');

  await submitConversion(page);

  await expect(page.getByRole('alert')).toContainText(
    'tipo de cambio recibido no es válido',
  );
  await expect(page.locator('#result')).toBeHidden();
});
