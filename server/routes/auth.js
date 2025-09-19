const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/csrf', (req, res) => {
  return res.json({ csrfToken: req.csrfToken() });
});

router.get('/session', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  }

  return res.json({ authenticated: false });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const user = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(username);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  return res.json({
    message: 'Autenticación exitosa.',
    user: { id: user.id, username: user.username },
    csrfToken: req.csrfToken()
  });
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesión finalizada.' });
  });
});

module.exports = router;
