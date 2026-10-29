# Implementation Plan: Conversor de monedas

**Branch**: `001-currency-conversion` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-currency-conversion/spec.md`

## Summary

Aplicación web estática de una sola pantalla, construida con HTML, CSS y JavaScript, que permite seleccionar dos monedas, introducir un importe y consultar Frankfurter para convertirlo. La validación, el acceso a la API, el cálculo y la presentación se separan en módulos pequeños. El resultado visible debe ajustarse al contrato de datos común de [conversion-result.schema.json](./contracts/conversion-result.schema.json). Frankfurter proporciona una fecha de referencia para la tasa; la interfaz mostrará esa fecha cuando esté disponible y no inferirá ni inventará una hora exacta.

## Technical Context

**Language/Version**: HTML5, CSS3 y JavaScript ES2022 (módulos ES) en navegadores modernos.

**Primary Dependencies**: Frankfurter (`https://api.frankfurter.dev/v1`) para monedas y tasas; `fetch` nativo para HTTP; Vite para servir y generar el sitio estático; Vitest y jsdom para pruebas unitarias/de integración; AJV para validar el contrato JSON; Playwright Test para la verificación de extremo a extremo y rendimiento real del navegador.

**Storage**: Ninguno. No se almacenan cuentas, solicitudes ni resultados.

**Testing**:
- `npm test`: Vitest en modo de ejecución única, con jsdom para pruebas de UI y `fetch` simulado para casos deterministas.
- `npm run test:watch`: Vitest en modo interactivo de desarrollo.
- `npm run test:e2e`: Playwright contra la app local en Chromium, Firefox y Edge (canal Microsoft Edge); flujos funcionales con respuestas deterministas o interceptadas. La matriz E2E comprueba los tres navegadores requeridos.
- `npm run test:performance`: Playwright ejecuta 20 conversiones exitosas con Frankfurter real bajo condiciones de red estables, sin throttling ni interrupciones deliberadas. En cada muestra mide desde el inicio de la consulta de tasa hasta que el resultado se muestra; el criterio pasa si al menos 19 de las 20 conversiones terminan en menos de 3000 ms. Registrar entorno y condiciones de red. Si no se pueden obtener 20 conversiones exitosas por fallos del proveedor o de red, la ejecución es inconclusa, no aprobada.

**Target Platform**: Versiones modernas de Chrome, Firefox y Edge en escritorio y móvil. Playwright ejecutará la suite funcional E2E en los tres navegadores; la medición de rendimiento con API real se ejecutará en Chromium para mantener una única plataforma de medición.

**Project Type**: Aplicación web estática, sin backend.

**Performance Goals**: Respetar RNF-003 y CE-002. El criterio CE-002 es: En condiciones de red estables, realizar 20 conversiones exitosas; medir cada una desde el inicio de la consulta a la API hasta que el resultado de conversión se muestra en pantalla; al menos 19 de las 20 deben terminar en menos de 3000 ms. Registrar el entorno y las condiciones de la prueba.

**Constraints**: API pública y gratuita sin claves; solicitudes limitadas a los datos necesarios; UI y errores en español; entrada decimal finita y no negativa; ninguna tasa fallida o no verificada se presenta como conversión; sin autenticación, base de datos o persistencia.

**Scale/Scope**: Un formulario, dos selectores de moneda, acción de intercambio, estado de carga, resultado y mensajes de error. CE-001 se valida mediante una prueba moderada con 10 usuarios que no hayan usado la app, observando si al menos 9 completan una conversión válida en menos de 60 segundos.

## Architecture

1. `index.html` define el formulario accesible y carga el módulo de la aplicación.
2. `src/ui/form.js` conecta controles y muestra los estados. `styles.css` contiene todos los estilos responsivos.
3. `src/app/currency-converter.js` coordina validación, consulta, cálculo y estados `idle`, `loading`, `success` y `error`.
4. `src/utils/validation.js` analiza la cantidad y rechaza entrada vacía, no numérica, infinita o negativa. Acepta una coma o un punto como separador decimal, pero no separadores de agrupación.
5. `src/api/exchange-rate-client.js` obtiene la lista de divisas compatibles y las tasas de Frankfurter; comprueba estado HTTP, JSON, base y tasa de destino, y convierte fallos en errores de dominio entendibles.
6. `src/utils/conversion.js` calcula y redondea según la precisión fraccionaria habitual de la moneda destino. Para monedas iguales devuelve el importe sin consultar tasas.
7. El resultado renderizado debe ajustarse al contrato canónico `contracts/conversion-result.schema.json`; las pruebas de contrato validan el objeto con AJV 2020 y ningún otro documento vuelve a definir sus campos.

### Monedas y proveedor

La lista del selector se obtiene de `GET /v1/currencies`. Para monedas distintas, se consulta `GET /v1/latest?from={fromCurrency}&to={toCurrency}`. La respuesta se acepta solo si contiene una tasa numérica, finita y positiva para la moneda destino y una base coherente con la solicitud. Para monedas iguales no se consulta al proveedor; el resultado usa tasa identidad `1` y marca `rateSource` como `identity`.

El campo `date` de Frankfurter representa la fecha de referencia de las tasas (no una hora de observación exacta). Se mapeará a `observationDate`; no se fabricará un timestamp ni se presentará la fecha como hora local.

### Validation and error handling

- Parsear y validar la cantidad antes de realizar solicitudes; limpiar cualquier resultado anterior cuando comienza una nueva solicitud.
- Deshabilitar el envío mientras hay una solicitud activa y mostrar indicador de carga.
- Mantener visible y accesible el indicador de carga durante una solicitud pendiente; comprobarlo en E2E antes de resolver una respuesta retenida.
- Distinguir errores de red, HTTP/proveedor, divisa no disponible, JSON malformado y tasa ausente/no positiva; mostrarlos en español, sin detalles técnicos ni datos sensibles.
- Mantener oculto el resultado en todo estado distinto de éxito. Nunca usar tasa de respaldo.
- Mantener la lista de divisas en memoria durante la sesión; no usar almacenamiento persistente.

## Automated Test Configuration

El proyecto usa npm con módulos ES:

- `package.json`: `"type": "module"`; dependencias de desarrollo `vite`, `vitest`, `jsdom`, `ajv` y `@playwright/test`. La prueba de contrato usa el validador `Ajv2020` para admitir el dialecto declarado por el esquema.
- Scripts: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `test` (`vitest run`), `test:watch` (`vitest`), `test:e2e` (`playwright test tests/e2e`), `test:performance` (`playwright test tests/performance`).
- `vitest.config.js`: entorno `jsdom`; incluir `tests/unit/**/*.test.js`, `tests/integration/**/*.test.js` y `tests/contract/**/*.test.js`.
- `playwright.config.js`: proyectos E2E de Chromium, Firefox y Edge; `baseURL` local y `webServer` de Vite. El proyecto de rendimiento usa Chromium y no depende de credenciales.
- Las pruebas de contrato e integración interceptan/mockean `fetch` para cubrir respuestas válidas, HTTP fallido, JSON malformado, tasa ausente/no positiva y errores de red de forma repetible.
- La prueba de rendimiento es un comando explícito separado: usa el proveedor real, recoge 20 conversiones exitosas secuenciales bajo condiciones estables, mide desde el inicio de la consulta hasta que aparece el resultado y comprueba que al menos 19 duren menos de 3000 ms. Registra el entorno y las condiciones de red. Si el proveedor o la red impiden completar las 20 conversiones exitosas, el resultado es inconcluso. No se mezcla con la suite determinista ordinaria.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principio I. Código limpio y modular: PASS. Validación, API, cálculo, coordinación y UI se separan en módulos.
- Principio II. Pruebas básicas obligatorias: PASS. Vitest cubre conversión válida, entrada inválida y errores/respuestas no utilizables; Playwright cubre interacción y rendimiento.
- Principio III. Experiencia de usuario clara: PASS. UI responsiva, carga visible y mensajes en español.
- Principio IV. API pública y protección de datos: PASS. Frankfurter es pública y no requiere claves; no hay almacenamiento ni datos sensibles.
- Principio V. Manejo robusto de errores: PASS. Los fallos del usuario, red, proveedor y datos impiden renderizar un resultado.
- Principio VI. Alcance mínimo: PASS. La solución solo realiza conversiones, sin inicio de sesión ni base de datos.
- Principio VII. Documentación y commits claros: PASS. Se actualizará el README con ejecución y pruebas; no se añade funcionalidad ajena.

**Resultado**: Las decisiones de arquitectura y pruebas respetan la constitución, sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-currency-conversion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
└── contracts/
    ├── conversion-result.schema.json
    └── exchange-rates-api.md
```

### Source Code (repository root)

```text
index.html
styles.css
package.json
README.md
vitest.config.js
playwright.config.js
src/
├── api/
│   └── exchange-rate-client.js
├── app/
│   └── currency-converter.js
├── ui/
│   └── form.js
└── utils/
    ├── conversion.js
    └── validation.js
tests/
├── unit/
│   ├── conversion.test.js
│   └── validation.test.js
├── integration/
│   └── exchange-rate.test.js
├── contract/
│   └── conversion-result.test.js
├── e2e/
│   └── conversion-flow.spec.js
└── performance/
    └── conversion-latency.spec.js
specs/001-currency-conversion/contracts/
├── conversion-result.schema.json
└── exchange-rates-api.md
```

**Structure Decision**: Se adopta una única aplicación estática con `index.html` y `styles.css` en la raíz y módulos de aplicación bajo `src/`. Las pruebas, configuración y tareas deberán usar exactamente estas rutas.

## Success-Criteria Verification

- **CE-001**: Prueba de usabilidad moderada: 10 participantes primerizos ejecutan la misma tarea de conversión; registrar tiempo y éxito individual. Cumple con al menos 9 éxitos antes de 60 segundos. La muestra y observaciones se documentan en `quickstart.md`; no se presenta como prueba automatizada.
- **CE-002 / RNF-003**: En condiciones de red estables, realizar 20 conversiones exitosas; medir cada una desde el inicio de la consulta a la API hasta que el resultado de conversión se muestra en pantalla; al menos 19 de las 20 deben terminar en menos de 3000 ms. Registrar el entorno y las condiciones de la prueba. Si no se completan 20 conversiones exitosas, la ejecución es inconclusa.
- **CE-003**: Pruebas automatizadas de entrada inválida y proveedor no disponible comprueban mensaje español y ausencia de resultado.
- **CE-004**: Pruebas automatizadas comparan resultado, par de monedas, tasa y redondeo con los valores esperados conforme al contrato común.
- **RNF-002**: `npm run test:e2e` ejecuta y reporta el flujo funcional en Chromium, Firefox y Edge.
- **RNF-004**: Una prueba E2E mantiene pendiente la respuesta de tasa y confirma que el indicador de carga permanece visible hasta resolverla.

## Complexity Tracking

No hay violaciones de la constitución que requieran justificación.
