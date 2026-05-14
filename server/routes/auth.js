const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });

  const users = query('SELECT id, name, role FROM users WHERE pin = ?', [pin]);
  if (users.length === 0) return res.status(401).json({ error: 'Invalid PIN' });

  res.json(users[0]);
});

// GET /api/auth/drivers
router.get('/drivers', (req, res) => {
  const drivers = query("SELECT id, name FROM users WHERE role = 'driver'");
  res.json(drivers);
});

module.exports = router;
