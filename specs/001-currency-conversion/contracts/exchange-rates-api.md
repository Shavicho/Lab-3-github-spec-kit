# Contrato de la API de Frankfurter

## Proveedor

Frankfurter: `https://api.frankfurter.app`. API pública y gratuita; no requiere clave.

## Divisas soportadas

`GET /currencies`

Devuelve un objeto JSON cuyas claves son códigos de divisa ISO y cuyos valores son nombres legibles. La aplicación usa esas claves para las opciones de ambos selectores. Un fallo HTTP, de red o de JSON impide completar la carga de divisas y se comunica en español.

## Tasa de cambio

`GET /latest?from={fromCurrency}&to={toCurrency}`

Ejemplo: `GET https://api.frankfurter.app/latest?from=USD&to=EUR`

Respuesta esperada:

```json
{
  "amount": 1,
  "base": "USD",
  "date": "2026-10-28",
  "rates": {
    "EUR": 0.9224
  }
}
```

La respuesta se considera utilizable si `base` coincide con el código de origen solicitado y `rates[toCurrency]` existe como número finito positivo. La fecha `date`, cuando está presente, es la fecha de referencia del conjunto de tasas, no necesariamente una hora exacta de observación. Se muestra como fecha sin añadir hora ni zona horaria. Si falta, `observationDate` será `null`.

## Resultado de la aplicación

El único contrato para el resultado de una conversión es [conversion-result.schema.json](./conversion-result.schema.json). La interfaz y las pruebas deben consumir esa definición y no mantener una lista paralela de campos.

Para una conversión entre monedas distintas, `rateSource` es `frankfurter`. Si las monedas son iguales, no se hace una solicitud de tasa: se devuelve una tasa identidad de `1`, fecha `null` y `rateSource` igual a `identity`.

## Errores

Se rechazan los fallos de red, estados HTTP no exitosos, JSON inválido, base inesperada, ausencia de `rates` o de la moneda solicitada, y tasas no numéricas, no finitas o no positivas. La aplicación presenta un mensaje en español y no renderiza un resultado de conversión.
