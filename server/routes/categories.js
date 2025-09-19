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
    .substring(0, 60);

router.use(requireAuth);

router.get('/', (req, res) => {
  const categories = db
    .prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY name ASC')
    .all();

  return res.json({ categories });
});

router.post('/', (req, res) => {
  const { name, description, slug } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  }

  const normalizedName = name.trim();
  const now = new Date().toISOString();
  const generatedSlug = (slug && slug.trim()) || slugify(normalizedName);

  try {
    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(normalizedName, generatedSlug, description || null, now, now);

    const category = db
      .prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);

    return res.status(201).json({ category });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese slug.' });
    }
    console.error('Error al crear categoría:', error);
    return res.status(500).json({ error: 'No se pudo crear la categoría.' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  const existing = db
    .prepare('SELECT id FROM categories WHERE id = ?')
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Categoría no encontrada.' });
  }

  const { name, description, slug } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  }

  const normalizedName = name.trim();
  const now = new Date().toISOString();
  const generatedSlug = (slug && slug.trim()) || slugify(normalizedName);

  try {
    db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, updated_at = ?
      WHERE id = ?
    `).run(normalizedName, generatedSlug, description || null, now, id);

    const category = db
      .prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?')
      .get(id);

    return res.json({ category });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese slug.' });
    }
    console.error('Error al actualizar categoría:', error);
    return res.status(500).json({ error: 'No se pudo actualizar la categoría.' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  const existing = db
    .prepare('SELECT id FROM categories WHERE id = ?')
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Categoría no encontrada.' });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);

  return res.status(204).send();
});

module.exports = router;
