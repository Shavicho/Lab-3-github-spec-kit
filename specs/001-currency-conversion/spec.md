# Especificación de la funcionalidad: Conversión de monedas

**Rama de funcionalidad**: `no creada`

**Creada**: 2026-10-28

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Vamos a construir una aplicación web que reciba una cantidad de dinero y dos monedas seleccionadas por el usuario, consulte el tipo de cambio mediante una API pública de tasas de cambio y muestre el resultado de la conversión."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1: Convertir una cantidad entre monedas (Prioridad: P1)

Como persona que necesita comparar dinero en distintas monedas, puedo introducir una cantidad, seleccionar la moneda de origen y la de destino, y ver la cantidad convertida usando un tipo de cambio actual.

**Por qué tiene esta prioridad**: Es el propósito principal de la aplicación y proporciona su valor esencial.

**Prueba independiente**: Seleccionar dos monedas compatibles, introducir una cantidad válida y solicitar la conversión. Comprobar que se muestra el resultado en la moneda de destino y que coincide con el tipo de cambio utilizado.

**Escenarios de aceptación**:

1. **Dado** un importe válido y monedas de origen y destino compatibles, **cuando** el usuario solicita una conversión, **entonces** la aplicación muestra el importe convertido con la moneda de destino.
2. **Dadas** la misma moneda de origen y de destino y una cantidad válida, **cuando** el usuario solicita una conversión, **entonces** la aplicación devuelve la cantidad introducida sin modificarla.
3. **Dada** una conversión exitosa, **cuando** se muestra el resultado, **entonces** el importe de origen, ambas monedas y el tipo de cambio utilizado son claros para el usuario.
4. **Dado** que la fuente de tasas proporciona la fecha de referencia del tipo de cambio, **cuando** se muestra el resultado, **entonces** la aplicación muestra esa fecha y no infiere ni inventa una hora.

### Historia de usuario 2: Corregir una cantidad no válida (Prioridad: P2)

Como persona que introduce una cantidad, recibo indicaciones claras cuando el valor está vacío o no es válido para poder corregirlo antes de convertir.

**Por qué tiene esta prioridad**: Evitar que valores no válidos generen resultados engañosos protege la fiabilidad de la función principal.

**Prueba independiente**: Enviar una cantidad vacía, texto no numérico o una cantidad negativa, y comprobar que la aplicación explica el problema de entrada y no muestra un resultado de conversión.

**Escenarios de aceptación**:

1. **Dada** una cantidad vacía, no numérica o negativa, **cuando** el usuario solicita una conversión, **entonces** la aplicación muestra un mensaje de validación claro en español y no muestra un resultado.
2. **Dada** una cantidad escrita con coma decimal o punto decimal, **cuando** el usuario solicita una conversión, **entonces** la cantidad se interpreta como un valor decimal.

### Historia de usuario 3: Saber cuándo no se puede completar una conversión (Prioridad: P2)

Como persona que solicita una conversión, recibo un aviso cuando la información actual del tipo de cambio no está disponible o no es utilizable, para no confundir un valor no verificado con un resultado.

**Por qué tiene esta prioridad**: Los datos del tipo de cambio son esenciales para una conversión fiable y los fallos no deben parecer conversiones exitosas.

**Prueba independiente**: Simular una fuente de tasas no disponible, una moneda no compatible y datos de tasas ausentes o no válidos; comprobar que cada caso muestra un error claro y no presenta un resultado de conversión.

**Escenarios de aceptación**:

1. **Dado** que no se puede acceder a la fuente de tasas, **cuando** el usuario solicita una conversión, **entonces** la aplicación explica en español que no se pudo completar.
2. **Dado** que una moneda seleccionada no es compatible o que la tasa devuelta falta o no es válida, **cuando** el usuario solicita una conversión, **entonces** la aplicación informa que la tasa no está disponible y no muestra un resultado.

### Casos límite

- La cantidad es cero; se acepta y se convierte a cero.
- Las monedas de origen y destino son iguales; la cantidad no cambia.
- La cantidad contiene una coma decimal o un punto decimal, o tiene un formato numérico no válido.
- La moneda seleccionada no es compatible con la fuente de tasas.
- La fuente de tasas no está disponible, no devuelve una tasa o devuelve datos de tasa mal formados o no positivos.
- El valor convertido requiere redondeo para mostrarse en la moneda de destino.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **RF-001**: La aplicación DEBE permitir que el usuario introduzca una cantidad de dinero y seleccione una moneda de origen y una de destino.
- **RF-002**: La aplicación DEBE obtener información del tipo de cambio para las monedas seleccionadas desde una fuente pública y gratuita de tasas de cambio.
- **RF-003**: La aplicación DEBE calcular y mostrar la cantidad convertida en la moneda de destino usando el tipo de cambio obtenido.
- **RF-004**: La aplicación DEBE mostrar, junto con el resultado, la cantidad introducida, la moneda de origen, la moneda de destino y el tipo de cambio utilizado.
- **RF-005**: La aplicación DEBE aceptar cantidades numéricas, finitas y no negativas, e interpretar una sola coma decimal o un solo punto decimal como separador decimal.
- **RF-006**: La aplicación DEBE dar al resultado mostrado el formato correspondiente a la precisión fraccionaria habitual de la moneda de destino.
- **RF-007**: Si las monedas de origen y destino son iguales, la aplicación DEBE devolver la cantidad introducida sin consultar un tipo de cambio.
- **RF-008**: La aplicación DEBE mostrar mensajes de error comprensibles en español para entradas no válidas, datos de tasas no disponibles, monedas no compatibles y respuestas fallidas o no utilizables de la fuente de tasas.
- **RF-009**: La aplicación NO DEBE mostrar un resultado de conversión cuando la cantidad no sea válida o no se pueda verificar el tipo de cambio necesario.
- **RF-010**: La aplicación DEBE mostrar la fecha de referencia del tipo de cambio que proporciona la fuente, si está disponible. La aplicación NO DEBE inferir ni inventar una hora exacta a partir de una fecha.
- **RF-011**: La aplicación DEBE permitir intercambiar las monedas de origen y destino con un solo clic.

### Requisitos no funcionales

- **RNF-001**: La interfaz DEBE ser simple y responsiva, tanto en computadoras como en celulares.
- **RNF-002**: La aplicación DEBE ser compatible con versiones modernas de Chrome, Firefox y Edge.
- **RNF-003**: En condiciones normales de red, la respuesta de una conversión DEBE mostrarse en menos de 3 segundos.
- **RNF-004**: La interfaz DEBE mostrar un indicador de carga mientras consulta el tipo de cambio.
- **RNF-005**: La aplicación NO DEBE exponer claves ni datos sensibles.
- **RNF-006**: El código DEBE ser mantenible e incluir pruebas básicas.

### Entidades clave *(incluir si la funcionalidad involucra datos)*

- **Solicitud de conversión**: La cantidad introducida por el usuario y las monedas de origen y destino seleccionadas.
- **Tipo de cambio**: El valor que relaciona una moneda compatible con otra, incluida su fuente y la fecha de referencia que proporcione.
- **Resultado de conversión**: La cantidad calculada en la moneda de destino, asociada con la solicitud y el tipo de cambio utilizado.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **CE-001**: Al menos 9 de cada 10 usuarios que utilizan la aplicación por primera vez pueden completar una conversión con datos válidos en menos de un minuto.
- **CE-002**: En condiciones de red estables, realizar 20 conversiones exitosas; medir cada una desde el inicio de la consulta a la API hasta que el resultado de conversión se muestra en pantalla; al menos 19 de las 20 deben terminar en menos de 3000 ms. Registrar el entorno y las condiciones de la prueba.
- **CE-003**: En todos los escenarios probados de entrada no válida o tasa no disponible, la aplicación muestra una explicación en español y no presenta un resultado de conversión sin verificar.
- **CE-004**: En todas las conversiones exitosas probadas, el resultado mostrado coincide con las monedas seleccionadas y el tipo de cambio, redondeado a la precisión fraccionaria habitual de la moneda de destino.

## Supuestos

- La aplicación está destinada a usuarios individuales y no requiere cuentas, historial de conversiones guardado ni almacenamiento persistente de datos de usuario.
- La fuente de tasas proporciona las tasas más recientes disponibles para las monedas compatibles; la consulta de tasas históricas queda fuera del alcance inicial.
- Los usuarios pueden elegir entre las monedas compatibles con la fuente pública seleccionada.
- La entrada decimal puede usar coma o punto como separador decimal, pero no separadores de agrupación.
- La disponibilidad y el tiempo de respuesta de la fuente de tasas son dependencias externas; la aplicación informa claramente de los fallos en vez de sustituirlos por tasas no verificadas.
