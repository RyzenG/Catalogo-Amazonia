const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const slugify = (value) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 80);

const normalizeSpecs = (specs) => {
  if (!specs) {
    return [];
  }

  if (Array.isArray(specs)) {
    return specs
      .map((entry) => {
        if (Array.isArray(entry) && entry.length >= 2) {
          return [String(entry[0]).trim(), String(entry[1]).trim()];
        }
        return null;
      })
      .filter(Boolean);
  }

  if (typeof specs === 'string') {
    return specs
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...valueParts] = line.split(':');
        if (!label || valueParts.length === 0) {
          return null;
        }
        return [label.trim(), valueParts.join(':').trim()];
      })
      .filter(Boolean);
  }

  return [];
};

router.use(requireAuth);

router.get('/', (req, res) => {
  const { categoryId } = req.query;
  let query = `
    SELECT id, category_id AS categoryId, name, slug, icon, description, specs, price, image_url AS imageUrl,
           created_at AS createdAt, updated_at AS updatedAt
    FROM products
  `;
  const params = [];

  if (categoryId !== undefined) {
    const parsedCategoryId = Number.parseInt(categoryId, 10);
    if (Number.isNaN(parsedCategoryId)) {
      return res.status(400).json({ error: 'El identificador de categoría no es válido.' });
    }
    query += ' WHERE category_id = ?';
    params.push(parsedCategoryId);
  }

  query += ' ORDER BY name ASC';

  const products = db.prepare(query).all(...params).map((product) => ({
    ...product,
    specs: product.specs ? JSON.parse(product.specs) : []
  }));

  return res.json({ products });
});

router.post('/', (req, res) => {
  const { name, description, slug, icon, specs, price, imageUrl, categoryId } = req.body || {};

  const numericCategoryId = Number.parseInt(categoryId, 10);
  if (Number.isNaN(numericCategoryId)) {
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(numericCategoryId);
  if (!category) {
    return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
  }

  const normalizedName = name.trim();
  const normalizedSlug = (slug && slug.trim()) || slugify(normalizedName);
  const normalizedSpecs = normalizeSpecs(specs);
  const now = new Date().toISOString();

  let normalizedPrice = null;
  if (price !== undefined && price !== null && String(price).trim() !== '') {
    const parsed = Number.parseFloat(price);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido.' });
    }
    normalizedPrice = parsed;
  }

  try {
    const result = db.prepare(`
      INSERT INTO products (category_id, name, slug, icon, description, specs, price, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      numericCategoryId,
      normalizedName,
      normalizedSlug,
      icon || null,
      description || null,
      JSON.stringify(normalizedSpecs),
      normalizedPrice,
      imageUrl || null,
      now,
      now
    );

    const product = db
      .prepare(
        `SELECT id, category_id AS categoryId, name, slug, icon, description, specs, price, image_url AS imageUrl,
                created_at AS createdAt, updated_at AS updatedAt FROM products WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      product: {
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : []
      }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug.' });
    }
    console.error('Error al crear producto:', error);
    return res.status(500).json({ error: 'No se pudo crear el producto.' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  const existing = db
    .prepare('SELECT id FROM products WHERE id = ?')
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const { name, description, slug, icon, specs, price, imageUrl, categoryId } = req.body || {};

  const numericCategoryId = Number.parseInt(categoryId, 10);
  if (Number.isNaN(numericCategoryId)) {
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(numericCategoryId);
  if (!category) {
    return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
  }

  const normalizedName = name.trim();
  const normalizedSlug = (slug && slug.trim()) || slugify(normalizedName);
  const normalizedSpecs = normalizeSpecs(specs);
  const now = new Date().toISOString();

  let normalizedPrice = null;
  if (price !== undefined && price !== null && String(price).trim() !== '') {
    const parsed = Number.parseFloat(price);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido.' });
    }
    normalizedPrice = parsed;
  }

  try {
    db.prepare(`
      UPDATE products
      SET category_id = ?, name = ?, slug = ?, icon = ?, description = ?, specs = ?, price = ?, image_url = ?, updated_at = ?
      WHERE id = ?
    `).run(
      numericCategoryId,
      normalizedName,
      normalizedSlug,
      icon || null,
      description || null,
      JSON.stringify(normalizedSpecs),
      normalizedPrice,
      imageUrl || null,
      now,
      id
    );

    const product = db
      .prepare(
        `SELECT id, category_id AS categoryId, name, slug, icon, description, specs, price, image_url AS imageUrl,
                created_at AS createdAt, updated_at AS updatedAt FROM products WHERE id = ?`
      )
      .get(id);

    return res.json({
      product: {
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : []
      }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug.' });
    }
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ error: 'No se pudo actualizar el producto.' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  const existing = db
    .prepare('SELECT id FROM products WHERE id = ?')
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  return res.status(204).send();
});

module.exports = router;
