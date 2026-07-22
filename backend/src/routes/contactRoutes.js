import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/contacts?user_id=1
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY contact_type, name').all(user_id);
  res.json(contacts);
});

// POST /api/contacts
router.post('/', (req, res) => {
  const { user_id, name, phone, contact_type } = req.body;
  if (!user_id || !name || !phone || !contact_type) {
    return res.status(400).json({ error: 'user_id, name, phone, contact_type are required' });
  }
  try {
    const result = db.prepare(
      'INSERT INTO emergency_contacts (user_id, name, phone, contact_type) VALUES (?, ?, ?, ?)'
    ).run(user_id, name, phone, contact_type);
    res.status(201).json({ id: result.lastInsertRowid, user_id, name, phone, contact_type });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', (req, res) => {
  const { name, phone, contact_type } = req.body;
  const result = db.prepare(
    'UPDATE emergency_contacts SET name = COALESCE(?, name), phone = COALESCE(?, phone), contact_type = COALESCE(?, contact_type) WHERE id = ?'
  ).run(name, phone, contact_type, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ id: req.params.id, message: 'Contact updated successfully' });
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM emergency_contacts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ message: 'Contact deleted successfully' });
});

export default router;
