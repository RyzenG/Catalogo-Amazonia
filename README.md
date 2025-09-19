# Catálogo Amazonia

Este repositorio contiene un catálogo público de productos de concreto y un panel administrativo para gestionarlo. Incluye un backend en Node.js con SQLite, autenticación basada en sesiones y protección CSRF, así como una SPA ligera para administración y un sitio público que consume el catálogo dinámicamente.

## Requisitos previos

- Node.js 18 o superior
- npm

## Configuración inicial

1. Instala las dependencias del backend:

   ```bash
   cd server
   npm install
   ```

2. Crea un archivo `.env` (opcional) a partir del ejemplo y ajusta las variables según tus necesidades:

   ```bash
   cp ../.env.example .env  # opcional: también puedes mantener el .env en la raíz
   ```

   Variables disponibles:

   | Variable | Descripción |
   | --- | --- |
   | `SESSION_SECRET` | Clave usada para firmar la sesión. |
   | `ADMIN_USER` / `ADMIN_PASSWORD` | Credenciales iniciales para el panel administrativo. |
   | `PORT` | Puerto donde se expone el backend (por defecto `3000`). |
   | `ALLOWED_ORIGINS` | Lista separada por comas con los orígenes permitidos para CORS (si el panel se sirve desde otro host). |

3. Ejecuta la migración y seed inicial de la base de datos:

   ```bash
   npm run migrate
   ```

   Esto crea las tablas `users`, `categories` y `products`, además de poblarlas con datos de ejemplo y un usuario administrador por defecto (`admin`/`admin123`).

## Ejecución

- **Modo desarrollo** (reinicio automático con `nodemon`):

  ```bash
  npm run dev
  ```

- **Modo producción/simple**:

  ```bash
  npm start
  ```

El servidor expone:

- Panel administrativo en `http://localhost:<PORT>/admin`
- Sitio público en `http://localhost:<PORT>/`
- API REST autenticada en `/api/categories` y `/api/products`
- Endpoint público `GET /api/catalog` con el catálogo completo para el sitio público

## Panel administrativo

1. Accede a `http://localhost:<PORT>/admin`.
2. Inicia sesión con las credenciales configuradas (por defecto `admin` / `admin123`).
3. Gestiona categorías y productos mediante los formularios disponibles. Todos los cambios requieren un token CSRF válido, que la SPA solicita automáticamente.

La aplicación usa `fetch` con `credentials: 'include'`, por lo que si sirves el panel desde otro dominio asegúrate de configurar `ALLOWED_ORIGINS` y los encabezados CORS correspondientes.

## API principal

Todos los endpoints (excepto `GET /api/catalog`) están protegidos por sesión y requieren el token CSRF en el encabezado `X-CSRF-Token` para peticiones de escritura.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/catalog` | Catálogo completo (categorías + productos) para el sitio público. |
| `POST` | `/api/auth/login` | Inicia sesión de administrador. |
| `POST` | `/api/auth/logout` | Cierra sesión. |
| `GET` | `/api/auth/csrf` | Obtiene un token CSRF válido. |
| `GET` | `/api/auth/session` | Estado de autenticación actual. |
| `GET/POST/PUT/DELETE` | `/api/categories` | CRUD de categorías (requiere sesión). |
| `GET/POST/PUT/DELETE` | `/api/products` | CRUD de productos (requiere sesión). |

## Estructura de carpetas

```
.
├── admin/              # SPA administrativa (HTML, CSS, JS)
├── server/             # Backend en Node.js/Express + SQLite
│   ├── db/             # Configuración de la base de datos y migraciones
│   ├── middleware/     # Middlewares personalizados
│   ├── routes/         # Rutas REST (auth, categories, products)
│   ├── scripts/        # Scripts auxiliares (migraciones)
│   └── index.js        # Punto de entrada del servidor
├── index.html          # Sitio público (consume /api/catalog)
├── .env.example        # Variables de entorno sugeridas
└── README.md
```

## Notas adicionales

- La base de datos SQLite se almacena en `server/data/catalog.db`. Esta ruta está ignorada en Git.
- Para cambiar las credenciales del administrador crea tu propio usuario en la tabla `users` o modifica las variables `ADMIN_USER` y `ADMIN_PASSWORD` antes de ejecutar la migración.
- El backend habilita CORS condicionalmente según la variable `ALLOWED_ORIGINS`. Si no se define, se permite el origen de la propia petición.
