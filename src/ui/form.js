import { formatCurrency, formatExchangeRate } from '../utils/conversion.js';

export function createConverterForm(root = document) {
  const form = root.querySelector('#converter-form');
  const amountInput = root.querySelector('#amount');
  const fromSelect = root.querySelector('#from-currency');
  const toSelect = root.querySelector('#to-currency');
  const submitButton = root.querySelector('#convert-button');
  const swapButton = root.querySelector('#swap-currencies');
  const loadingRegion = root.querySelector('#loading');
  const errorRegion = root.querySelector('#error');
  const resultRegion = root.querySelector('#result');

  function setBusy(busy) {
    const currenciesAvailable = fromSelect.options.length > 0;
    amountInput.disabled = busy;
    fromSelect.disabled = busy || !currenciesAvailable;
    toSelect.disabled = busy || !currenciesAvailable;
    swapButton.disabled = busy || !currenciesAvailable;
    submitButton.disabled = busy || !currenciesAvailable;
  }

  function clearOutput() {
    errorRegion.hidden = true;
    errorRegion.textContent = '';
    resultRegion.hidden = true;
    resultRegion.replaceChildren();
    loadingRegion.hidden = true;
    form.setAttribute('aria-busy', 'false');
    setBusy(false);
  }

  function setCurrencies(currencies) {
    const previousFrom = fromSelect.value;
    const previousTo = toSelect.value;
    const entries = Object.entries(currencies).sort(([left], [right]) =>
      left.localeCompare(right),
    );

    for (const select of [fromSelect, toSelect]) {
      select.replaceChildren(
        ...entries.map(([code, name]) => {
          const option = root.createElement('option');
          option.value = code;
          option.textContent = `${code} — ${name}`;
          return option;
        }),
      );
      select.disabled = entries.length === 0;
    }

    fromSelect.value = entries.some(([code]) => code === previousFrom)
      ? previousFrom
      : entries.some(([code]) => code === 'USD')
        ? 'USD'
        : entries[0]?.[0] ?? '';
    toSelect.value = entries.some(([code]) => code === previousTo)
      ? previousTo
      : entries.some(([code]) => code === 'EUR')
        ? 'EUR'
        : entries.find(([code]) => code !== fromSelect.value)?.[0] ??
          entries[0]?.[0] ??
          '';
    setBusy(false);
  }

  function showLoading(message = 'Consultando el tipo de cambio…') {
    errorRegion.hidden = true;
    errorRegion.textContent = '';
    resultRegion.hidden = true;
    resultRegion.replaceChildren();
    loadingRegion.textContent = message;
    loadingRegion.hidden = false;
    form.setAttribute('aria-busy', 'true');
    setBusy(true);
  }

  function hideLoading() {
    loadingRegion.hidden = true;
    form.setAttribute('aria-busy', 'false');
    setBusy(false);
  }

  function showError(message) {
    loadingRegion.hidden = true;
    form.setAttribute('aria-busy', 'false');
    errorRegion.textContent = message;
    errorRegion.hidden = false;
    resultRegion.hidden = true;
    resultRegion.replaceChildren();
    setBusy(false);
  }

  function showResult(result) {
    const heading = root.createElement('h2');
    heading.textContent = 'Resultado de la conversión';
    const amount = root.createElement('p');
    amount.className = 'result__amount';
    amount.dataset.testid = 'converted-amount';
    amount.textContent = formatCurrency(result.convertedAmount, result.toCurrency);
    const details = root.createElement('dl');
    details.className = 'result__details';

    const rows = [
      [
        'Importe original',
        formatCurrency(result.originalAmount, result.fromCurrency),
      ],
      [
        'Tipo de cambio',
        `1 ${result.fromCurrency} = ${formatExchangeRate(result.exchangeRate)} ${result.toCurrency}`,
      ],
    ];

    if (result.observationDate !== null) {
      rows.push(['Fecha de referencia', result.observationDate]);
    }

    for (const [label, value] of rows) {
      const term = root.createElement('dt');
      term.textContent = label;
      const description = root.createElement('dd');
      description.textContent = value;
      if (label === 'Fecha de referencia') {
        const time = root.createElement('time');
        time.dateTime = result.observationDate;
        time.textContent = result.observationDate;
        description.replaceChildren(time);
      }
      details.append(term, description);
    }

    resultRegion.replaceChildren(heading, amount, details);
    resultRegion.hidden = false;
    errorRegion.hidden = true;
    loadingRegion.hidden = true;
    form.setAttribute('aria-busy', 'false');
    setBusy(false);
  }

  function swapCurrencies() {
    const from = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = from;
    clearOutput();
  }

  function onSubmit(handler) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handler({
        amount: amountInput.value,
        fromCurrency: fromSelect.value,
        toCurrency: toSelect.value,
      });
    });
  }

  swapButton.addEventListener('click', swapCurrencies);

  return {
    clearOutput,
    hideLoading,
    onSubmit,
    setCurrencies,
    showError,
    showLoading,
    showResult,
  };
}
