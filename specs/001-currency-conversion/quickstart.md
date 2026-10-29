# Guía de validación

## Prerrequisitos

- Node.js y npm compatibles con la versión de Vite declarada en `package.json`.
- Conexión a Internet para las pruebas de rendimiento con Frankfurter.
- Chromium, Firefox y Microsoft Edge instalados para Playwright.

## Preparación

Desde la raíz del proyecto:

```bash
npm install
npx playwright install chromium firefox msedge
```

Iniciar la app con `npm run dev` y abrir la URL local que Vite indique. Para producir el sitio estático, ejecutar `npm run build`.

## Pruebas automatizadas

```bash
npm test
npm run test:e2e
```

`npm test` ejecuta las pruebas unitarias, de integración y de contrato. Las llamadas a Frankfurter están simuladas en esas suites para que los casos de éxito y fallo sean reproducibles. El resultado que las pruebas validan se rige por [contracts/conversion-result.schema.json](./contracts/conversion-result.schema.json).

`npm run test:e2e` ejecuta los flujos funcionales en Chrome/Chromium, Firefox y Edge. La suite incluye una respuesta de tasa retenida: comprobar que el indicador de carga está visible mientras la solicitud sigue pendiente y desaparece cuando la respuesta se resuelve.

## Escenarios funcionales

1. **Conversión válida**: introducir `100`, seleccionar `USD` y `EUR` y convertir. Verificar resultado, monedas y tasa; mostrar la fecha de Frankfurter si se recibió. La fecha es solo una fecha de referencia, no se debe inventar una hora.
2. **Monedas iguales**: introducir `50`, seleccionar `EUR` en ambos campos y convertir. Verificar que se devuelve el importe sin solicitar una tasa y sin mostrar una fecha de proveedor.
3. **Entrada**: probar vacío, `-10`, `abc`, `1,2`, `1.2` y `1,2,3`. La coma o el punto decimal único se acepta; entradas inválidas muestran un mensaje español y ningún resultado.
4. **Proveedor**: simular fallo de red, respuesta malformada, tasa ausente y tasa no positiva. Verificar mensaje español y ausencia de resultado.
5. **Intercambio**: pulsar el control de intercambio y verificar que se invierten las divisas origen y destino.

## Rendimiento (CE-002 / RNF-003)

Ejecutar con condiciones de red estables, sin throttling ni interrupciones deliberadas:

```bash
npm run test:performance
```

CE-002: En condiciones de red estables, realizar 20 conversiones exitosas; medir cada una desde el inicio de la consulta a la API hasta que el resultado de conversión se muestra en pantalla; al menos 19 de las 20 deben terminar en menos de 3000 ms. Registrar el entorno y las condiciones de la prueba.

El test abre la app en Chromium y obtiene las 20 conversiones exitosas secuenciales contra Frankfurter real. Si Frankfurter o la red impiden completar las 20 conversiones exitosas, marcar la ejecución como inconclusa; no sustituir resultados fallidos por tasas simuladas. La comprobación de compatibilidad funcional de Firefox y Edge se realiza con `npm run test:e2e`.

## Usabilidad (CE-001)

Realizar una prueba moderada con 10 participantes que no hayan usado la app:

1. Dar a cada participante la misma instrucción: “Convierte 100 USD a EUR”.
2. Iniciar el cronómetro cuando se muestra la instrucción y detenerlo cuando el participante ve un resultado válido.
3. No dar ayuda durante el intento; registrar éxito y duración por participante.
4. El criterio se cumple si al menos 9 de los 10 participantes terminan en menos de 60 segundos.

Registrar fecha, dispositivo/navegador, número de éxitos y tiempos (sin información personal) como evidencia de la validación. Esta es una evaluación con participantes, no una prueba automatizada.
