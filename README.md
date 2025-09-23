# Panel de Administración de Catálogo – Amazonia Concrete

## Introducción
El panel de administración permite a Amazonia Concrete configurar su información corporativa, gestionar categorías y productos, y generar un catálogo HTML listo para compartir con clientes. Toda la interfaz está disponible en `admin.html`, que concentra el menú lateral, las secciones de configuración y productos, además de la vista previa integrada y las acciones de exportación.

## Requisitos y flujo de uso
1. **Abrir la herramienta**: descargue o clone el repositorio y abra `admin.html` en un navegador moderno (Chrome, Edge, Firefox o Safari). No se requieren dependencias externas ni un servidor adicional.
2. **Configurar la información base**: en la sección **⚙️ Configuración General** ingrese datos de contacto, branding y footer, y cargue el logo si es necesario. Guarde con el botón **Guardar Configuración** para persistir los cambios en `localStorage` y actualizar la vista previa.
3. **Gestionar categorías y productos**: cambie al apartado **📦 Gestión de Productos** desde el menú lateral. Allí encontrará las pestañas de categoría, controles para abrir el modal de categorías y el formulario para crear o editar productos con campos de precio, descripciones, características y especificaciones técnicas.
4. **Actualizar la vista previa**: utilice el botón **🔄 Actualizar vista previa** o cualquier acción de guardado para regenerar el iframe con el catálogo actual, gracias a `updateCatalogPreview()` en `admin.js` que reconstruye el HTML con los datos vigentes.
5. **Generar el catálogo final**: cuando todo esté listo, pulse **📥 Generar Catálogo** (en el menú o en la sección inferior). El script invoca `generateCatalog()`, guarda los datos y descarga un archivo HTML autónomo con fecha en el nombre.

## Manejo de imágenes
- **Preferencia por URLs directas**: el formulario de productos incluye un campo para pegar enlaces a imágenes, recomendando explícitamente el uso de rutas de `raw.githubusercontent.com` para recursos alojados en GitHub, lo que evita redirecciones y facilita la carga desde el catálogo final.
- **Selección local vs. remota**: el usuario puede cargar una imagen desde su equipo (`<input type="file">`) o proporcionar una URL. Al seleccionar un archivo, se genera un `DataURL` almacenado en `imageData`; si se ingresa una URL, se guarda en `image` y se descarta `imageData` para priorizar el recurso externo.
- **Lógica de visualización**: `getProductImageSource()` evalúa primero `imageData`, luego `image`; si ninguno existe, genera un marcador SVG con el icono o emoji del producto para garantizar una presentación consistente.

## Guardado, carga y portabilidad de datos
- **Persistencia local**: `loadData()` intenta leer la clave `amazoniaData` desde `localStorage`, reconstruye la estructura de categorías/productos y refresca la interfaz. `saveData()` asegura la estructura interna, guarda el JSON serializado en la misma clave y refresca la vista previa.
- **Exportar/Importar JSON**: el botón **📤 Exportar Datos** descarga un archivo JSON con sangría, generado por `exportData()`. Para restituir información, utilice **📥 Importar Datos**, seleccione el archivo exportado y deje que el manejador con `FileReader` valide y cargue el contenido antes de persistirlo de nuevo en `localStorage`.
- **Generar HTML final**: `generateCatalog()` guarda el estado, produce el HTML a través de `generateCatalogHTML()` y crea un `Blob` descargable con un nombre fechado, dejando un mensaje de confirmación al usuario.

## Buenas prácticas para alojar y optimizar imágenes
- **GitHub Raw**: si las imágenes viven en repositorios públicos, copie la URL directa de `raw.githubusercontent.com` o use el botón "View raw" para evitar redirecciones y cabeceras no compatibles con `<img>` en sitios estáticos.
- **Conversión de enlaces de Google Drive**: transforme la URL de vista previa (`https://drive.google.com/file/d/.../view`) en un enlace directo (`https://drive.google.com/uc?export=view&id=...`) antes de pegarlo, garantizando que la imagen cargue sin autenticación.
- **Optimización pendiente**: reduzca el peso de los recursos antes de subirlos (TinyPNG, Squoosh) y documente un flujo de compresión para no exceder cuotas de hosting o límites de `localStorage`. Planifique un repositorio dedicado o CDN ligero para evitar bloqueos por ancho de banda y simplificar el mantenimiento.

## Guardado y carga de trabajo cotidiano
1. Ingrese cambios en configuraciones o productos.
2. Pulse **💾 Guardar Cambios** para persistir en `localStorage`.
3. Use **📂 Cargar Datos** cuando requiera restablecer el último estado guardado manualmente.
4. Antes de compartir, **📤 Exportar Datos** genera un respaldo y **📥 Importar Datos** permite restaurar configuraciones entre equipos.

## Mejoras futuras sugeridas
- Automatizar la optimización de imágenes (compresión y redimensionamiento) antes de guardarlas como `imageData` para evitar superar la cuota de `localStorage`.
- Implementar un validador de enlaces externos que confirme la disponibilidad y el tamaño máximo permitido.
- Añadir métricas o advertencias sobre el uso de almacenamiento para informar al usuario cuando el catálogo se acerque a los límites del navegador.
