<!--
Sync Impact Report
Version change: sin versión previa -> 1.0.0 (adopción inicial)
Principles added: Código limpio y modular; Pruebas obligatorias; Experiencia de usuario clara;
	API pública y protección de datos; Manejo robusto de errores; Alcance mínimo;
	Documentación y commits claros.
Sections added: Restricciones del producto; Flujo de desarrollo.
Sections removed: Ninguna.
Follow-up TODOs: Confirmar fecha original de ratificación.
-->
# Conversor de monedas Constitution

## Core Principles

### I. Código limpio y modular
El código MUST ser legible y modular. Las funciones MUST tener una responsabilidad
acotada y nombres claros; la lógica de conversión MUST mantenerse separada de la
interfaz y del acceso a la API. Esto facilita probar y mantener cada parte sin
introducir complejidad accidental.

### II. Pruebas básicas obligatorias
Cada cambio MUST incluir pruebas automatizadas para la lógica de conversión y el
manejo de errores que modifica. Las pruebas MUST cubrir conversiones válidas y,
como mínimo, entradas inválidas y fallos o respuestas no utilizables de la API.

### III. Experiencia de usuario clara
La aplicación MUST ofrecer una experiencia simple, clara y responsiva. Las etiquetas
y los mensajes de error visibles MUST estar en español y explicar el problema en
términos comprensibles, sin exponer detalles técnicos o datos sensibles.

### IV. API pública y protección de datos
La obtención de tasas MUST usar exclusivamente una API pública y gratuita. El
repositorio MUST NOT contener claves, credenciales ni datos sensibles; cualquier
secreto requerido por el proveedor MUST mantenerse fuera del código y del control
de versiones. La aplicación MUST solicitar solo los datos necesarios para realizar
la conversión.

### V. Manejo robusto de errores
La aplicación MUST gestionar de forma explícita la caída o indisponibilidad de la
API, la falta de conexión, las entradas inválidas y las respuestas inesperadas o
malformadas. Ante estos casos MUST informar al usuario en español y evitar presentar
un resultado de conversión que no pueda verificarse.

### VI. Alcance mínimo
La implementación MUST limitarse a convertir una cantidad entre dos monedas usando
tasas de cambio. MUST NOT incorporar funcionalidades fuera de ese alcance, incluidos
inicio de sesión y base de datos, salvo que una enmienda a esta constitución lo
autorice.

### VII. Documentación y commits claros
El README MUST documentar de forma concisa el propósito y los pasos esenciales para
ejecutar o probar la aplicación. Cada commit MUST describir claramente el cambio que
introduce, para que el historial permita entender su propósito.

## Restricciones del producto

La aplicación MUST usar tasas obtenidas de la API pública y gratuita elegida por el
proyecto. MUST comunicar los errores de red, proveedor o datos al usuario sin
convertirlos en resultados aparentemente válidos. No se almacenarán cuentas ni datos
de usuario en una base de datos.

## Flujo de desarrollo

Los cambios MUST incluir pruebas para la lógica de conversión y los errores afectados.
Antes de integrar un cambio, la revisión MUST confirmar que respeta los siete
principios, que el README sigue siendo suficiente y que no se han añadido secretos,
dependencias de pago ni funcionalidades fuera de alcance. Los commits MUST tener
mensajes descriptivos.

## Governance

Esta constitución define los requisitos obligatorios del proyecto. Toda enmienda
MUST documentar su motivo y alcance, recibir revisión de las personas responsables
del proyecto y actualizar la versión y la fecha de última modificación. Las
modificaciones de gobernanza MUST preservar esta estructura y explicar cualquier
cambio incompatible.

La versión MUST seguir SemVer: MAJOR para cambios incompatibles o eliminación de
requisitos; MINOR para principios o secciones nuevos o una ampliación material; y
PATCH para aclaraciones y correcciones sin cambio de significado.

Cada revisión de cambios y cada preparación de entrega MUST comprobar el cumplimiento
de estos principios, en especial las pruebas, el manejo de errores, la protección de
secretos y el límite de alcance. Las excepciones requieren una enmienda aprobada a
esta constitución.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirmar fecha original | **Last Amended**: 2026-10-28
