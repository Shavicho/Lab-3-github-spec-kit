# Modelo de datos

## Resultado de conversión

El contrato canónico del resultado es [contracts/conversion-result.schema.json](./contracts/conversion-result.schema.json). Es la única definición de sus campos, tipos y restricciones. La aplicación debe producir objetos conformes y las pruebas de contrato los validan contra el esquema, en lugar de mantener una definición paralela.

Para una conversión entre monedas distintas se usa la tasa validada de Frankfurter y su fecha de referencia cuando esté disponible. La fecha no implica una hora exacta. Para monedas iguales se devuelve una tasa identidad sin consulta al proveedor y sin fecha de referencia.

## Solicitud de conversión

La solicitud contiene la cantidad como texto y códigos de moneda de origen y destino. Antes de producir un resultado, la cantidad debe ser no vacía, finita y no negativa; se acepta una coma o un punto como separador decimal, pero no separadores de agrupación. Las monedas elegidas deben estar en la lista de divisas compatibles obtenida del proveedor.

## Tipo de cambio

La tasa procede de una respuesta validada de Frankfurter: la moneda base debe coincidir con la moneda de origen y debe existir una tasa finita y positiva para la moneda destino. La fecha de referencia puede faltar. Una respuesta malformada o incompleta no produce un resultado.

## Estados

- `idle` pasa a `validating`, después a `loading` y finalmente a `success` o `error`.
- Una solicitud con monedas iguales termina en `success` sin solicitar una tasa.
- Los errores de validación, red, proveedor o datos dejan la interfaz en `error` y no muestran un resultado.
