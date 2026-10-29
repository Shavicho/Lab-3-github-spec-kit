# Conversor de monedas

Aplicación web estática en español para convertir importes entre monedas con tasas actuales de Frankfurter. No requiere claves, cuentas ni almacenamiento.

## Requisitos

- Node.js compatible con Vite 7 y npm.
- Conexión a Internet para consultar las monedas y las tasas de Frankfurter.
- Chromium, Firefox y Microsoft Edge instalados para ejecutar las pruebas de navegador.

## Uso

```bash
npm install
npm run dev
```

Abre en el navegador la dirección local indicada por Vite. Para generar o previsualizar la versión de producción:

```bash
npm run build
npm run preview
```

## Pruebas

```bash
npm test
npm run test:e2e
npm run test:performance
```

Las pruebas unitarias, de integración y de contrato son deterministas. Las pruebas E2E funcionales usan Chromium, Firefox y Edge; la suite de rendimiento consulta Frankfurter en vivo y mide 20 conversiones secuenciales.
