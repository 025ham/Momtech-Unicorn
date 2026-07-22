import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/alerts?monitor_id=1&acknowledged=0
router.get('/', (req, res) => {
  const { monitor_id, acknowledged } = req.query;
  let query = `
    SELECT a.*, m.name as monitor_name, m.url as monitor_url
    FROM alerts a
    LEFT JOIN monitors m ON a.monitor_id = m.id
  `;
  const params = [];
  const conditions = [];
  if (monitor_id) {
    conditions.push('a.monitor_id = ?');
    params.push(monitor_id);
  }
  if (acknowledged !== undefined) {
    conditions.push('a.acknowledged = ?');
    params.push(parseInt(acknowledged));
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY a.sent_at DESC';
  const alerts = db.prepare(query).all(...params);
  res.json(alerts);
});

// GET /api/alerts/:id
router.get('/:id', (req, res) => {
  const alert = db.prepare(`
    SELECT a.*, m.name as monitor_name, m.url as monitor_url
    FROM alerts a
    LEFT JOIN monitors m ON a.monitor_id = m.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

// POST /api/alerts
router.post('/', (req, res) => {
  const { monitor_id, type, message } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO alerts (monitor_id, type, message)
      VALUES (?, ?, ?)
    `).run(monitor_id, type, message);
    res.status(201).json({ id: result.lastInsertRowid, monitor_id, type, message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', (req, res) => {
  const result = db.prepare('UPDATE alerts SET acknowledged = 1 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Alert not found' });
  res.json({ id: req.params.id, message: 'Alert acknowledged' });
});

// DELETE /api/alerts/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM alerts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Alert not found' });
  res.json({ message: 'Alert deleted successfully' });
});

export default router;
