import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/monitors
router.get('/', (req, res) => {
  const monitors = db.prepare(`
    SELECT m.*, u.name as user_name
    FROM monitors m
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
  `).all();
  res.json(monitors);
});

// GET /api/monitors/:id
router.get('/:id', (req, res) => {
  const monitor = db.prepare(`
    SELECT m.*, u.name as user_name
    FROM monitors m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `).get(req.params.id);
  if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
  res.json(monitor);
});

// POST /api/monitors
router.post('/', (req, res) => {
  const { user_id, name, url, method, interval, timeout } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO monitors (user_id, name, url, method, interval, timeout)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user_id, name, url, method || 'GET', interval || 60000, timeout || 30000);
    res.status(201).json({ id: result.lastInsertRowid, user_id, name, url, method, interval, timeout });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/monitors/:id
router.put('/:id', (req, res) => {
  const { name, url, method, interval, timeout, status } = req.body;
  const result = db.prepare(`
    UPDATE monitors
    SET name = COALESCE(?, name),
        url = COALESCE(?, url),
        method = COALESCE(?, method),
        interval = COALESCE(?, interval),
        timeout = COALESCE(?, timeout),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, url, method, interval, timeout, status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Monitor not found' });
  res.json({ id: req.params.id, message: 'Updated successfully' });
});

// DELETE /api/monitors/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM monitors WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Monitor not found' });
  res.json({ message: 'Monitor deleted successfully' });
});

export default router;
