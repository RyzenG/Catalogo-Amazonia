# Propuestas de mejora para el panel de Amazonia Concrete

## Experiencia de usuario

- Incluir ayudas en contexto dentro de los formularios (placeholders dinámicos, ejemplos validados, contadores de caracteres) para reducir la fricción al completar campos como precio o especificaciones técnicas.【F:admin.html†L181-L198】【F:admin.js†L1918-L1934】
- Mostrar estados de carga persistentes cuando se exporta o genera el catálogo, indicando progreso y posibles errores en lugar de solo notificaciones temporales; esto ayuda cuando se trabaja con catálogos grandes.【F:admin.js†L2000-L2012】【F:admin.js†L2083-L2110】

## Accesibilidad e internacionalización
- Mantener sincronizados los atributos `aria-expanded` de los botones de navegación con el estado visual de las secciones, y comunicar el cambio en un `aria-live` dedicado para los lectores de pantalla.【F:admin.js†L1548-L1580】
- Proporcionar equivalentes textuales a los iconos de categorías/acciones dentro del catálogo generado (por ejemplo usando `aria-label` o texto alternativo adicional) para evitar pérdida de información en usuarios con tecnologías asistivas.【F:admin.js†L1674-L1687】【F:admin.js†L2188-L2199】
- Preparar la interfaz para traducciones (mensajes, etiquetas, notificaciones) extrayendo los literales actuales a un diccionario, ya que todo el contenido está embebido directamente en el HTML y JavaScript.【F:admin.html†L12-L147】【F:admin.js†L1987-L2110】

## Calidad de código y mantenibilidad
- Dividir `admin.js` en módulos especializados (gestión de categorías, productos, configuración, exportación) para reducir el archivo monolítico de más de 2.100 líneas y facilitar las pruebas unitarias.【F:admin.js†L1-L2151】
- Sustituir la construcción manual de HTML con concatenaciones en `loadProducts()` por utilidades declarativas (por ejemplo `template literals` parametrizados con funciones puras o librerías ligeras) que simplifiquen el renderizado condicional y eviten errores al añadir nuevos campos.【F:admin.js†L1655-L1695】
- Extraer las utilidades compartidas (normalización de IDs, formateo de moneda, sanitización) a un módulo independiente o carpeta `utils/` para promover su reutilización y disminuir duplicidades en validaciones.【F:admin.js†L34-L243】

## Fiabilidad de datos y exportaciones
- Versionar la estructura guardada en `localStorage` (`amazoniaData`) para poder migrar o invalidar datos antiguos cuando cambie el esquema y evitar errores silenciosos al parsear configuraciones previas.【F:admin.js†L1245-L1253】