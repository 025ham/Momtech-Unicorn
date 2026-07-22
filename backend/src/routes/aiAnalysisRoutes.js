import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/ai-analysis?monitor_id=1
router.get('/', (req, res) => {
  const { monitor_id } = req.query;
  let query = `
    SELECT aa.*, m.name as monitor_name
    FROM ai_analysis aa
    LEFT JOIN monitors m ON aa.monitor_id = m.id
  `;
  const params = [];
  if (monitor_id) {
    query += ' WHERE aa.monitor_id = ?';
    params.push(monitor_id);
  }
  query += ' ORDER BY aa.created_at DESC';
  const analysis = db.prepare(query).all(...params);
  res.json(analysis);
});

// GET /api/ai-analysis/:id
router.get('/:id', (req, res) => {
  const result = db.prepare(`
    SELECT aa.*, m.name as monitor_name
    FROM ai_analysis aa
    LEFT JOIN monitors m ON aa.monitor_id = m.id
    WHERE aa.id = ?
  `).get(req.params.id);
  if (!result) return res.status(404).json({ error: 'Analysis not found' });
  res.json(result);
});

// POST /api/ai-analysis
router.post('/', (req, res) => {
  const { monitor_id, analysis_type, result: analysisResult } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO ai_analysis (monitor_id, analysis_type, result)
      VALUES (?, ?, ?)
    `).run(monitor_id, analysis_type, typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult));
    res.status(201).json({ id: result.lastInsertRowid, monitor_id, analysis_type });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/ai-analysis/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM ai_analysis WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Analysis not found' });
  res.json({ message: 'Analysis deleted successfully' });
});

export default router;
