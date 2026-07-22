import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/health-logs?user_id=1&limit=100
router.get('/', (req, res) => {
  const { user_id, limit = 100, from_date, to_date } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  let query = `
    SELECT hl.*, bd.name as device_name, bd.device_type
    FROM health_logs hl
    LEFT JOIN bluetooth_devices bd ON hl.device_id = bd.id
    WHERE hl.user_id = ?
  `;
  const params = [user_id];

  if (from_date) {
    query += ' AND hl.logged_at >= ?';
    params.push(from_date);
  }
  if (to_date) {
    query += ' AND hl.logged_at <= ?';
    params.push(to_date);
  }

  query += ' ORDER BY hl.logged_at DESC LIMIT ?';
  params.push(parseInt(limit));

  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

// GET /api/health-logs/latest?user_id=1
router.get('/latest', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const latest = db.prepare(`
    SELECT hl.*, bd.name as device_name, bd.device_type
    FROM health_logs hl
    LEFT JOIN bluetooth_devices bd ON hl.device_id = bd.id
    WHERE hl.user_id = ?
    ORDER BY hl.logged_at DESC
    LIMIT 1
  `).get(user_id);

  res.json(latest || null);
});

// GET /api/health-logs/stats?user_id=1
router.get('/stats', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_logs,
      AVG(heart_rate) as avg_heart_rate,
      AVG(temperature) as avg_temperature,
      AVG(baby_movement) as avg_baby_movement,
      MIN(heart_rate) as min_heart_rate,
      MAX(heart_rate) as max_heart_rate,
      MIN(temperature) as min_temperature,
      MAX(temperature) as max_temperature
    FROM health_logs
    WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
  `).get(user_id);

  res.json(stats);
});

// POST /api/health-logs
router.post('/', (req, res) => {
  const { user_id, device_id, heart_rate, temperature, baby_movement, stress_level } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const result = db.prepare(`
      INSERT INTO health_logs (user_id, device_id, heart_rate, temperature, baby_movement, stress_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user_id, device_id || null, heart_rate, temperature, baby_movement, stress_level);
    res.status(201).json({ id: result.lastInsertRowid, user_id, heart_rate, temperature, baby_movement });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/health-logs/export?user_id=1&format=csv
router.get('/export', (req, res) => {
  const { user_id, format = 'json' } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const logs = db.prepare(`
    SELECT hl.*, bd.name as device_name
    FROM health_logs hl
    LEFT JOIN bluetooth_devices bd ON hl.device_id = bd.id
    WHERE hl.user_id = ?
    ORDER BY hl.logged_at DESC
  `).all(user_id);

  if (format === 'csv') {
    const headers = 'id,user_id,device_id,device_name,heart_rate,temperature,baby_movement,stress_level,logged_at\n';
    const rows = logs.map(l => `${l.id},${l.user_id},${l.device_id || ''},${l.device_name || ''},${l.heart_rate || ''},${l.temperature || ''},${l.baby_movement || ''},${l.stress_level || ''},${l.logged_at}`).join('\n');
    res.type('text/csv').send(headers + rows);
  } else {
    res.json(logs);
  }
});

export default router;
