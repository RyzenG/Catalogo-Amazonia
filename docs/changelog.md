# Registro de cambios operativos del catálogo

Utilice esta tabla para documentar ajustes en la estructura de datos, nuevas funcionalidades o decisiones operativas relevantes.

| Fecha | Responsable | Descripción del cambio | Impacto en datos |
|-------|-------------|------------------------|------------------|
| 2025-02-14 | Equipo catálogo | Se retira el `index.html` generado para que el panel admin vuelva a ser la única fuente del catálogo público | No |
| 2025-03-03 | Equipo catálogo | Se incorporan atributos de carga diferida, dimensiones y `srcset/sizes` opcionales para imágenes de productos; nuevos campos `imageSmall`/`imageMedium`/`imageLarge`/`imageFull` alimentan esas variantes | No |
| AAAA-MM-DD | Nombre Apellido | Resumen del ajuste (p. ej. "Se añade campo `product.warranty`") | ¿Requiere migrar datos existentes? |

**Formato esperado para variantes responsive de imágenes:**
- `imageSmall`: URL para la versión hasta ~480px (1x). Opcional.
- `imageMedium`: URL para la versión hasta ~768px. Opcional.
- `imageLarge`: URL para la versión hasta ~1200px. Opcional.
- `imageFull`: URL para la versión de mayor calidad (~1600px). Opcional.

Si se proveen, estos campos generan automáticamente `srcset`/`sizes` compartidos entre tarjetas y modal de producto; de lo contrario, se usa solo la primera URL de `images`/`image`.
