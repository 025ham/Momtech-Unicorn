import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/monitor-logs?monitor_id=1&limit=100
router.get('/', (req, res) => {
  const { monitor_id, limit = 100 } = req.query;
  let query = `
    SELECT ml.*, m.name as monitor_name
    FROM monitor_logs ml
    LEFT JOIN monitors m ON ml.monitor_id = m.id
  `;
  const params = [];
  if (monitor_id) {
    query += ' WHERE ml.monitor_id = ?';
    params.push(monitor_id);
  }
  query += ' ORDER BY ml.checked_at DESC LIMIT ?';
  params.push(parseInt(limit));
  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

// GET /api/monitor-logs/:id
router.get('/:id', (req, res) => {
  const log = db.prepare(`
    SELECT ml.*, m.name as monitor_name
    FROM monitor_logs ml
    LEFT JOIN monitors m ON ml.monitor_id = m.id
    WHERE ml.id = ?
  `).get(req.params.id);
  if (!log) return res.status(404).json({ error: 'Log not found' });
  res.json(log);
});

// POST /api/monitor-logs
router.post('/', (req, res) => {
  const { monitor_id, status, response_time, status_code, error_message } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO monitor_logs (monitor_id, status, response_time, status_code, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).run(monitor_id, status, response_time, status_code, error_message);
    res.status(201).json({ id: result.lastInsertRowid, monitor_id, status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/monitor-logs/stats/:monitor_id (aggregate stats)
router.get('/stats/:monitor_id', (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_checks,
      SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as uptime_count,
      SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as downtime_count,
      AVG(response_time) as avg_response_time,
      MIN(response_time) as min_response_time,
      MAX(response_time) as max_response_time
    FROM monitor_logs
    WHERE monitor_id = ?
  `).get(req.params.monitor_id);
  res.json({
    ...stats,
    uptime_percentage: stats.total_checks > 0
      ? ((stats.uptime_count / stats.total_checks) * 100).toFixed(2)
      : 0
  });
});

export default router;
