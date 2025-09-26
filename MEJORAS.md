# Propuestas de mejora para el panel de Amazonia Concrete

## Experiencia de usuario
- Centralizar los estilos en hojas CSS en lugar de repetir `style="..."` en los botones del menú y las llamadas a la acción, de modo que sea más sencillo aplicar temas (p. ej. un modo oscuro) y ajustar espacios para distintos tamaños de pantalla.【F:admin.html†L25-L36】【F:admin.html†L139-L146】
- Añadir etiquetas de texto visibles o `aria-label` descriptivos a los botones con solo iconos en la lista de productos para que el flujo de edición y borrado sea comprensible sin depender de la iconografía.【F:admin.js†L1679-L1691】
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
- Validar el JSON importado contra un esquema explícito antes de aceptarlo, devolviendo errores detallados y evitando que datos corruptos dejen la aplicación en un estado inconsistente.【F:admin.js†L2035-L2078】
- Incorporar comprobaciones previas a la descarga del catálogo (por ejemplo, verificar que las URLs de imágenes responden o que el tamaño estimado del HTML no excede límites) y presentar recomendaciones antes de iniciar la exportación.【F:admin.js†L2083-L2110】

## Documentación y operativa
- Ampliar el README con un flujo de "troubleshooting" (cómo limpiar `localStorage`, cómo restablecer categorías) y con instrucciones para colaboración, dado que actualmente sólo describe el flujo funcional principal.【F:README.md†L1-L61】
- Añadir guías internas sobre estándares de iconografía y tamaños de imagen para que el equipo mantenga consistencia al crear nuevos productos o categorías.【F:README.md†L63-L87】
- Documentar un plan de pruebas manuales/regresión que cubra creación, edición, importación y generación de catálogos a fin de garantizar la calidad cuando se incorporen nuevas funcionalidades.【F:README.md†L29-L57】【F:admin.js†L1887-L1983】
