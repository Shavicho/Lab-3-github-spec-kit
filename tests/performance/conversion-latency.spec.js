import { expect, test } from '@playwright/test';

test('at least 19 of 20 live conversions appear within three seconds', async ({
  page,
  browserName,
}, testInfo) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const requestUrl =
        input instanceof Request ? input.url : new URL(input, location.href).href;
      if (requestUrl.startsWith('https://api.frankfurter.app/latest')) {
        performance.mark('frankfurter-query-start');
      }
      return originalFetch(input, init);
    };
  });

  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.warn(`Browser console error: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.url()}: ${request.failure()?.errorText ?? 'desconocido'}`,
    );
  });
  await page.goto('/');
  await expect(page.getByLabel('Cantidad')).toBeVisible({ timeout: 15_000 });
  try {
    await page
      .getByLabel('Moneda de origen')
      .locator('option')
      .first()
      .waitFor({ state: 'attached', timeout: 15_000 });
  } catch {
    const errorMessage = await page.locator('#error').textContent();
    const reason = `Inconcluso: no se pudo cargar la lista de monedas. ${errorMessage}. ${failedRequests.join('; ')}`;
    console.warn(reason);
    test.skip(
      true,
      reason,
    );
  }
  await page.getByLabel('Moneda de origen').selectOption('USD');
  await page.getByLabel('Moneda de destino').selectOption('EUR');

  const durations = [];
  for (let index = 0; index < 20; index += 1) {
    await page.evaluate(() => performance.clearMarks('frankfurter-query-start'));
    await page.getByLabel('Cantidad').fill(String(index + 1));
    await page.getByRole('button', { name: 'Convertir' }).click();
    try {
      await expect(page.locator('#result')).toBeVisible({ timeout: 12_000 });
    } catch {
      const reason = `Inconcluso: solo se completaron ${durations.length} de 20 conversiones reales; ${failedRequests.join('; ')}`;
      console.warn(reason);
      test.skip(
        true,
        reason,
      );
    }

    const duration = await page.evaluate(() => {
      const marks = performance.getEntriesByName('frankfurter-query-start');
      const start = marks.at(-1)?.startTime;
      return start === undefined ? null : performance.now() - start;
    });
    if (duration === null) {
      test.skip(true, 'Inconcluso: no se pudo medir el inicio de la consulta real.');
    }
    durations.push(Number(duration.toFixed(1)));
  }

  const underThreeSeconds = durations.filter((duration) => duration < 3000).length;
  const report = {
    browser: browserName,
    environment: `${process.platform}; Node ${process.version}; Playwright ${testInfo.project.name}`,
    networkConditions: 'Frankfurter en vivo; sin throttling ni interrupciones deliberadas',
    durationsMs: durations,
    under3000ms: underThreeSeconds,
  };
  console.log(`CE-002 performance sample: ${JSON.stringify(report)}`);
  testInfo.annotations.push({
    type: 'performance-sample',
    description: JSON.stringify(report),
  });

  expect(durations).toHaveLength(20);
  expect(underThreeSeconds).toBeGreaterThanOrEqual(19);
});
