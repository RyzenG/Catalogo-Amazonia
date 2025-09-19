const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./index');

function loadEnv() {
  const dotenvPath = path.join(__dirname, '..', '.env');
  require('dotenv').config({ path: dotenvPath });
}

function runMigrations() {
  loadEnv();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT,
      description TEXT,
      specs TEXT,
      price REAL,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  const now = new Date().toISOString();
  const defaultUsername = process.env.ADMIN_USER || 'admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(defaultUsername);
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(defaultUsername, passwordHash, now, now);
  }

  const categories = [
    { slug: 'macetas', name: 'Macetas', description: 'Colección de macetas inspiradas en la Amazonía.' },
    { slug: 'pisos', name: 'Pisos', description: 'Pisos de concreto de alto rendimiento.' },
    { slug: 'revestimientos', name: 'Revestimientos', description: 'Revestimientos decorativos y funcionales.' }
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      updated_at = excluded.updated_at;
  `);

  categories.forEach((category) => {
    insertCategory.run(
      category.name,
      category.slug,
      category.description,
      now,
      now
    );
  });

  const categoryIds = Object.fromEntries(
    db
      .prepare('SELECT id, slug FROM categories WHERE slug IN (?, ?, ?)')
      .all('macetas', 'pisos', 'revestimientos')
      .map((row) => [row.slug, row.id])
  );

  const products = [
    {
      category: 'macetas',
      slug: 'maceta-tropical',
      name: 'Maceta Tropical',
      icon: '🪴',
      description:
        'Maceta con textura inspirada en la selva amazónica. Incluye sistema de drenaje integrado.',
      specs: [
        ['Material', 'Concreto reforzado con fibra'],
        ['Dimensiones', '30cm x 25cm x 28cm'],
        ['Peso', '8 kg'],
        ['Colores', 'Gris natural, Verde musgo, Terracota'],
        ['Drenaje', 'Sistema integrado con plato'],
        ['Garantía', '2 años']
      ]
    },
    {
      category: 'macetas',
      slug: 'maceta-minimalista',
      name: 'Maceta Minimalista',
      icon: '🌿',
      description:
        'Diseño contemporáneo con acabado liso y formas geométricas. Ideal para suculentas y cactus.',
      specs: [
        ['Material', 'Concreto pulido'],
        ['Dimensiones', '20cm x 20cm x 18cm'],
        ['Peso', '4 kg'],
        ['Colores', 'Blanco, Gris, Negro'],
        ['Acabado', 'Sellador impermeable'],
        ['Garantía', '2 años']
      ]
    },
    {
      category: 'macetas',
      slug: 'jardin-vertical',
      name: 'Set Jardín Vertical',
      icon: '🌱',
      description:
        'Sistema modular para crear jardines verticales con riego por goteo opcional.',
      specs: [
        ['Material', 'Concreto aligerado'],
        ['Módulos', '3 piezas hexagonales'],
        ['Dimensiones', '25cm x 22cm cada módulo'],
        ['Peso total', '12 kg'],
        ['Instalación', 'Incluye kit de montaje'],
        ['Garantía', '3 años']
      ]
    },
    {
      category: 'pisos',
      slug: 'baldosa-amazonia',
      name: 'Baldosa Amazonia',
      icon: '⬜',
      description:
        'Baldosas premium con relieve de hojas y acabado antideslizante para exteriores.',
      specs: [
        ['Material', 'Concreto de alta resistencia'],
        ['Dimensiones', '40cm x 40cm x 4cm'],
        ['Peso', '12 kg/unidad'],
        ['Resistencia', '350 kg/cm²'],
        ['Acabado', 'Antideslizante clase 3'],
        ['Vida útil', '25+ años']
      ]
    },
    {
      category: 'pisos',
      slug: 'concreto-pulido',
      name: 'Concreto Pulido',
      icon: '⬛',
      description:
        'Piso con acabado espejo obtenido mediante pulido diamantado y sellador de última generación.',
      specs: [
        ['Espesor', '10-15cm'],
        ['Acabado', 'Pulido diamantado 3000 grit'],
        ['Sellador', 'Base agua, bajo VOC'],
        ['Mantenimiento', 'Mínimo'],
        ['Colores', 'Personalizable con tintes'],
        ['Garantía', '10 años']
      ]
    },
    {
      category: 'pisos',
      slug: 'adoquin-ecologico',
      name: 'Adoquín Ecológico',
      icon: '🔲',
      description:
        'Adoquines permeables que permiten la filtración natural del agua, ideales para proyectos sostenibles.',
      specs: [
        ['Material', 'Concreto poroso'],
        ['Dimensiones', '20cm x 10cm x 8cm'],
        ['Permeabilidad', '300 l/m²/min'],
        ['Peso', '3.5 kg/unidad'],
        ['Resistencia', '280 kg/cm²'],
        ['Certificación', 'Compatible con LEED']
      ]
    },
    {
      category: 'revestimientos',
      slug: 'panel-3d-selva',
      name: 'Panel 3D Selva',
      icon: '🏗️',
      description:
        'Paneles decorativos con relieve tridimensional que recrea la exuberancia de la selva amazónica.',
      specs: [
        ['Material', 'Concreto arquitectónico'],
        ['Dimensiones', '60cm x 60cm x 3cm'],
        ['Peso', '15 kg/panel'],
        ['Instalación', 'Adhesivo especial incluido'],
        ['Acabado', 'Pintura mineral ecológica'],
        ['Uso', 'Interior']
      ]
    },
    {
      category: 'revestimientos',
      slug: 'ladrillo-aparente',
      name: 'Ladrillo Aparente',
      icon: '🧱',
      description:
        'Revestimiento que simula ladrillo expuesto con durabilidad del concreto y múltiples tonos.',
      specs: [
        ['Material', 'Concreto texturizado'],
        ['Formato', 'Placas de 50x25cm'],
        ['Espesor', '2cm'],
        ['Colores', 'Rojo, Café, Gris, Blanco'],
        ['Instalación', 'Sistema click o adhesivo'],
        ['Rendimiento', '8 placas/m²']
      ]
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      category_id,
      name,
      slug,
      icon,
      description,
      specs,
      price,
      image_url,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      category_id = excluded.category_id,
      name = excluded.name,
      icon = excluded.icon,
      description = excluded.description,
      specs = excluded.specs,
      price = excluded.price,
      image_url = excluded.image_url,
      updated_at = excluded.updated_at;
  `);

  products.forEach((product) => {
    const categoryId = categoryIds[product.category];
    if (!categoryId) {
      return;
    }
    insertProduct.run(
      categoryId,
      product.name,
      product.slug,
      product.icon,
      product.description,
      JSON.stringify(product.specs),
      null,
      null,
      now,
      now
    );
  });
}

module.exports = { runMigrations };
