# Investigación y decisiones técnicas

## Fuente de tasas

**Decisión**: Usar Frankfurter (`https://api.frankfurter.app`), sin clave, con `GET /currencies` para poblar los selectores y `GET /latest?from={base}&to={symbols}` para una conversión.

**Justificación**: Cumple el requisito de API pública y gratuita sin credenciales; proporciona una estructura JSON directa para comprobar la moneda base, tasa y fecha de referencia.

**Alternativas consideradas**: Proveedores que requieren claves o tienen límites de acceso gratuito más restrictivos; se descartan para evitar credenciales y dependencias de pago. Una tasa codificada localmente se descarta porque no consultaría datos actuales.

**Fecha de la tasa**: Frankfurter devuelve una fecha de referencia (`date`), no necesariamente una hora exacta de observación. Se muestra solo la fecha disponible; no se deriva ni inventa una hora o zona horaria. La definición de resultado compartida está en `contracts/conversion-result.schema.json`.

## Arquitectura

**Decisión**: Aplicación web estática con módulos ES nativos, separación entre presentación, orquestación, validación, cálculo y cliente API; Vite solo se usa como servidor y empaquetador.

**Justificación**: Cumple el alcance mínimo y facilita probar cada responsabilidad sin introducir un backend o almacenamiento.

**Alternativas consideradas**: Framework SPA y backend propio; se descartan porque agregan complejidad sin una necesidad funcional especificada.

## Pruebas y verificaciones

**Decisión**: npm con Vitest y jsdom para pruebas deterministas unitarias/de integración, AJV 2020 para comprobar el esquema del resultado y Playwright en Chromium para el flujo de navegador y la medición real de latencia.

**Scripts planificados**: `npm test`, `npm run test:watch`, `npm run test:e2e` y `npm run test:performance`, además de `npm run dev`, `npm run build` y `npm run preview`.

**Justificación**: Las pruebas de lógica/API pueden simular respuestas y verificar todos los errores sin depender de la disponibilidad externa. Una verificación de rendimiento separada usa Frankfurter real, toma 20 muestras secuenciales y comprueba que al menos 19 resultados se muestran en menos de 3000 ms. La ejecución se considera inconclusa si la red o el proveedor fallan.

**Usabilidad**: CE-001 se valida con 10 participantes primerizos; se registra éxito/tiempo para la tarea “Convierte 100 USD a EUR”. El criterio se satisface con al menos 9 finalizaciones antes de 60 segundos. No se recopilan datos personales.
