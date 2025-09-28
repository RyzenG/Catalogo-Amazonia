# Propuestas de mejora para el panel de Amazonia Concrete

## Experiencia de usuario

- Proporcionar equivalentes textuales a los iconos de categorías/acciones dentro del catálogo generado (por ejemplo usando `aria-label` o texto alternativo adicional) para evitar pérdida de información en usuarios con tecnologías asistivas.【F:admin.js†L1674-L1687】【F:admin.js†L2188-L2199】
- Preparar la interfaz para traducciones (mensajes, etiquetas, notificaciones) extrayendo los literales actuales a un diccionario, ya que todo el contenido está embebido directamente en el HTML y JavaScript.【F:admin.html†L12-L147】【F:admin.js†L1987-L2110】
- Transformar las tarjetas de producto generadas en elementos interactivos accesibles (por ejemplo, botones o enlaces) en lugar de `<div>` con manejadores `onclick`, de modo que sean enfocables y operables con teclado y lectores de pantalla.【F:admin.js†L2172-L2182】【F:admin.js†L3243-L3304】
- Añadir etiquetas accesibles (`aria-label`) y gestión de foco al botón de cierre del modal de producto para que la opción sea identificable y navegable sin visión, además de exponer un punto de retorno al cerrar.【F:admin.js†L2320-L2328】【F:admin.js†L3265-L3311】
- Implementar cierre mediante tecla Escape y un pequeño “focus trap” dentro del modal generado para impedir que el foco se pierda detrás de la ventana cuando se navega únicamente con teclado.【F:admin.js†L3265-L3311】

## Calidad de código y mantenibilidad
- Dividir `admin.js` en módulos especializados (gestión de categorías, productos, configuración, exportación) para reducir el archivo monolítico de más de 2.100 líneas y facilitar las pruebas unitarias.【F:admin.js†L1-L2151】
- Sustituir la construcción manual de HTML con concatenaciones en `loadProducts()` por utilidades declarativas (por ejemplo `template literals` parametrizados con funciones puras o librerías ligeras) que simplifiquen el renderizado condicional y eviten errores al añadir nuevos campos.【F:admin.js†L1655-L1695】
- Extraer las utilidades compartidas (normalización de IDs, formateo de moneda, sanitización) a un módulo independiente o carpeta `utils/` para promover su reutilización y disminuir duplicidades en validaciones.【F:admin.js†L34-L243】

## Fiabilidad de datos y exportaciones

- Escapar el identificador de producto antes de inyectarlo en atributos como `onclick="openModal('...')"` para evitar roturas de HTML o potenciales inyecciones si se importa un catálogo con IDs que contengan comillas u otros caracteres especiales.【F:admin.js†L2172-L2204】

