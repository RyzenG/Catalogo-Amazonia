# Panel de Administración de Catálogo – Amazonia Concrete

## Introducción
El panel de administración permite a Amazonia Concrete configurar su información corporativa, gestionar categorías y productos, y generar un catálogo HTML listo para compartir con clientes. Toda la interfaz está disponible en `admin.html`, que concentra el menú lateral, las secciones de configuración y productos, además de la vista previa integrada y las acciones de exportación.

## Requisitos y flujo de uso
1. **Abrir la herramienta**: descargue o clone el repositorio y abra `admin.html` en un navegador moderno (Chrome, Edge, Firefox o Safari). No se requieren dependencias externas ni un servidor adicional.
2. **Configurar la información base**: en la sección **⚙️ Configuración General** ingrese datos de contacto, branding y footer, y cargue el logo si es necesario. Guarde con el botón **Guardar Configuración** para persistir los cambios en `localStorage` y actualizar la vista previa.
3. **Gestionar categorías y productos**: cambie al apartado **📦 Gestión de Productos** desde el menú lateral. Allí encontrará las pestañas de categoría, controles para abrir el modal de categorías y el formulario para crear o editar productos con campos de precio, descripciones, características y especificaciones técnicas.
4. **Actualizar la vista previa**: utilice el botón **🔄 Actualizar vista previa** o cualquier acción de guardado para regenerar el iframe con el catálogo actual, gracias a `updateCatalogPreview()` en `admin.js` que reconstruye el HTML con los datos vigentes.
5. **Generar el catálogo final**: cuando todo esté listo, pulse **📥 Generar Catálogo** (en el menú o en la sección inferior). El script invoca `generateCatalog()`, guarda los datos y descarga un archivo HTML autónomo con fecha en el nombre.
6. **Gestionar el carrito de compras**: en la vista previa del catálogo, cada tarjeta incluye un botón **➕ Añadir al carrito** que alimenta un panel flotante accesible desde el control "Carrito" ubicado en la esquina inferior derecha. El carrito se guarda automáticamente en `localStorage`, permite ajustar cantidades, escribir notas por producto, vaciarlo con un clic y finalizar la compra mediante WhatsApp.

### Carrito de compras flotante
- **Persistencia automática**: el carrito usa la clave `amazoniaCatalogSelectedProducts` en `localStorage`. Si el visitante vuelve al catálogo desde el mismo navegador, encontrará sus productos previos con cantidades y anotaciones intactas.
- **Controles accesibles**: el panel cuenta con roles ARIA, se abre/cierra mediante teclado, muestra un contador dinámico en el botón flotante y ofrece un atajo para "Vaciar carrito".
- **Sincronización con contactos**: el botón **Finalizar compra** arma un mensaje de WhatsApp con todos los productos seleccionados, sus cantidades y notas, mientras que **💬 WhatsApp** y **📋 Solicitar Cotización** del modal continúan disponibles para consultas puntuales.

## Manejo de imágenes
- **Preferencia por URLs directas**: el formulario de productos incluye un campo para pegar enlaces a imágenes, recomendando explícitamente el uso de rutas de `raw.githubusercontent.com` para recursos alojados en GitHub, lo que evita redirecciones y facilita la carga desde el catálogo final.
- **Entrada mediante enlaces**: todas las imágenes de productos se gestionan a través de URLs proporcionadas por el usuario. El panel guarda únicamente la cadena del enlace (`product.image`), por lo que no se almacena contenido binario ni representaciones en Base64 dentro del catálogo.
- **Lógica de visualización**: `getProductImageSource()` utiliza la URL registrada en `product.image`; si no hay una imagen definida, genera un marcador SVG con el icono o emoji del producto para garantizar una presentación consistente.

## Guardado, carga y portabilidad de datos
- **Persistencia local**: `loadData()` intenta leer la clave `amazoniaData` desde `localStorage`, reconstruye la estructura de categorías/productos y refresca la interfaz. `saveData()` asegura la estructura interna, guarda el JSON serializado en la misma clave y refresca la vista previa.
- **Exportar/Importar JSON**: el botón **📤 Exportar Datos** descarga un archivo JSON con sangría, generado por `exportData()`. Para restituir información, utilice **📥 Importar Datos**, seleccione el archivo exportado y deje que el manejador con `FileReader` valide y cargue el contenido antes de persistirlo de nuevo en `localStorage`.
- **Generar HTML final**: `generateCatalog()` guarda el estado, produce el HTML a través de `generateCatalogHTML()` y crea un `Blob` descargable con un nombre fechado, dejando un mensaje de confirmación al usuario.

## Buenas prácticas para alojar y optimizar imágenes
- **GitHub Raw**: si las imágenes viven en repositorios públicos, copie la URL directa de `raw.githubusercontent.com` o use el botón "View raw" para evitar redirecciones y cabeceras no compatibles con `<img>` en sitios estáticos.
- **Conversión de enlaces de Google Drive**: transforme la URL de vista previa (`https://drive.google.com/file/d/.../view`) en un enlace directo (`https://drive.google.com/uc?export=view&id=...`) antes de pegarlo, garantizando que la imagen cargue sin autenticación.
- **Optimización pendiente**: reduzca el peso de los recursos antes de subirlos (TinyPNG, Squoosh) y documente un flujo de compresión para no exceder cuotas de hosting o límites de `localStorage`. Planifique un repositorio dedicado o CDN ligero para evitar bloqueos por ancho de banda y simplificar el mantenimiento.

## Guía de troubleshooting y operación diaria
Cuando el panel no responde como se espera, siga este flujo para recuperar la estabilidad sin perder información importante:

1. **Verificar la versión del navegador**: confirme que utiliza una versión actualizada de Chrome, Edge, Firefox o Safari. Los navegadores desactualizados pueden bloquear APIs como `localStorage` o descargas de archivos.
2. **Revisar bloqueadores de pop-ups**: la exportación del catálogo y del JSON de respaldo se realiza con descargas directas. Habilite temporalmente el dominio local (`file://`) para permitir la descarga.
3. **Limpiar el estado de `localStorage`**: si aparecen campos vacíos o datos corruptos, abra las herramientas de desarrollador (F12), vaya a **Application → Local Storage → file://** y elimine la clave `amazoniaData`. Vuelva a cargar la página para iniciar con un estado limpio.
4. **Restablecer categorías predefinidas**: importe el archivo JSON de referencia almacenado en `docs/seed/amazonia-default.json` (compártalo internamente) para reconstruir categorías y productos iniciales.
5. **Reinstalar el proyecto**: en caso de cambios accidentales sobre los archivos fuente, vuelva a clonar el repositorio o ejecute `git checkout -- admin.html admin.js admin.css` para restaurar la versión oficial.

### Procedimiento de colaboración
- Cree ramas temáticas (`feature/`, `fix/`, `docs/`) y solicite revisión antes de fusionar en `main`.
- Documente cada cambio de datos que requiera migraciones (p. ej. nuevos campos en productos) dentro de `docs/changelog.md`.
- Coordine la publicación del catálogo compartiendo el archivo HTML exportado en un canal interno y manteniendo una copia en el repositorio de activos.

## Guías internas de iconografía e imágenes
- **Iconos**: utilice la familia `Material Symbols Rounded` o emojis nativos. Los iconos deben representar la categoría de manera inequívoca y mantener un tamaño de 32px en los listados y 48px en la cabecera del catálogo.
- **Colores**: respete la paleta corporativa (`#004225`, `#5B8C51`, `#F4A300`) y garantice una relación de contraste mínima de 4.5:1 frente a los fondos.
- **Formato de imagen**: priorice PNG o WebP para productos con transparencia y JPEG optimizado (calidad 70) para fotografías. Las dimensiones recomendadas son 800x600 px para productos y 1200x400 px para banners.
- **Peso máximo**: cada imagen no debe exceder 350 KB para asegurar tiempos de carga ágiles. Documente cualquier excepción en el registro de activos.
- **Repositorio interno**: suba los recursos al repositorio `amazonia-assets` en carpetas `categories/` y `products/` con nombres en `kebab-case` para facilitar su búsqueda.

## Plan de pruebas manuales y de regresión
Realice las siguientes verificaciones antes de liberar un nuevo catálogo o fusionar cambios relevantes:

1. **Configuración general**
   - Actualizar los campos de contacto y guardar; comprobar que persisten tras recargar el archivo.
   - Cambiar el logo y validar que se refleje en la vista previa y en el HTML exportado.
2. **Gestión de categorías**
   - Crear una categoría nueva, reorganizarla y confirmar su aparición en los selectores y la vista previa.
   - Editar una categoría existente y verificar que el cambio se propaga a todos los productos asociados.
3. **Gestión de productos**
   - Crear, editar y eliminar un producto con todos los campos completos; asegurar que los íconos y las imágenes se muestran correctamente.
   - Validar la importación y exportación del JSON, confirmando que los campos obligatorios se mantienen intactos.
   - Probar el carrito flotante: agregar varios productos, ajustar cantidades/notas, recargar el HTML generado para confirmar la persistencia y verificar que **Finalizar compra** abra WhatsApp con el pedido completo, además de que los botones de WhatsApp/correo utilicen el resumen actualizado.
4. **Generación de catálogo**
   - Ejecutar `Generar Catálogo` y abrir el HTML resultante en un navegador distinto para comprobar estilos, imágenes y enlaces.
   - Simular un catálogo sin conexión a Internet para verificar que los recursos embebidos siguen operativos.
5. **Accesibilidad básica**
   - Navegar el panel con teclado (Tab, Shift+Tab, Enter, Space) y revisar que todos los controles son alcanzables.
   - Ejecutar un lector de pantalla (NVDA/VoiceOver) para validar que los botones críticos poseen etiquetas descriptivas.

Registre la fecha de ejecución y hallazgos en `docs/testing-log.md` para sostener un historial de regresión.

## Guardado y carga de trabajo cotidiano
1. Ingrese cambios en configuraciones o productos.
2. Pulse **💾 Guardar Cambios** para persistir en `localStorage`.
3. Use **📂 Cargar Datos** cuando requiera restablecer el último estado guardado manualmente.
4. Antes de compartir, **📤 Exportar Datos** genera un respaldo y **📥 Importar Datos** permite restaurar configuraciones entre equipos.

## Mejoras futuras sugeridas
- Automatizar la optimización de imágenes (compresión y redimensionamiento) antes de subirlas a un hosting público o CDN ligero, garantizando que las URLs compartidas mantengan un peso reducido.
- Implementar un validador de enlaces externos que confirme la disponibilidad y el tamaño máximo permitido.
- Añadir métricas o advertencias sobre el uso de almacenamiento para informar al usuario cuando el catálogo se acerque a los límites del navegador.
