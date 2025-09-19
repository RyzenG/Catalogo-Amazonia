const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const csurf = require('csurf');
const dotenv = require('dotenv');

const db = require('./db');
const { runMigrations } = require('./db/migrate');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');

const rootDir = path.join(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config();

runMigrations();

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

if (allowedOrigins.length > 0) {
  corsOptions.origin = (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  };
} else {
  corsOptions.origin = true;
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'catalogo-amazonia-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

const csrfProtection = csurf();

app.use('/api', (req, res, next) => {
  if (req.path === '/catalog') {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);

app.get('/api/catalog', (req, res) => {
  const categories = db
    .prepare('SELECT id, name, slug, description, created_at AS createdAt, updated_at AS updatedAt FROM categories ORDER BY name ASC')
    .all();

  const products = db
    .prepare(
      'SELECT id, category_id AS categoryId, name, slug, icon, description, specs, price, image_url AS imageUrl, created_at AS createdAt, updated_at AS updatedAt FROM products'
    )
    .all();

  const catalog = categories.map((category) => ({
    ...category,
    products: products
      .filter((product) => product.categoryId === category.id)
      .map((product) => ({
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : []
      }))
  }));

  return res.json({ categories: catalog });
});

app.use('/admin', express.static(path.join(rootDir, 'admin')));

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  if (req.path.startsWith('/api')) {
    return next();
  }

  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(rootDir, 'admin', 'index.html'));
  }

  if (req.path === '/' || req.path === '/index.html') {
    return res.sendFile(path.join(rootDir, 'index.html'));
  }

  return res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Token CSRF inválido o ausente.' });
  }
  return next(err);
});

app.use((err, req, res, next) => {
  console.error('Error inesperado:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
