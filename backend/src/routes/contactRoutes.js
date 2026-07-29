import { Router } from 'express';
import { queryAll, queryGet, queryRun } from '../db/connection.js';

const router = Router();

// GET /api/contacts?user_id=1
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  const contacts = queryAll('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY contact_type, name', [user_id]);
  res.json(contacts);
});

// POST /api/contacts
router.post('/', (req, res) => {
  const { user_id, name, phone, contact_type } = req.body;
  if (!user_id || !name || !phone || !contact_type) {
    return res.status(400).json({ error: 'user_id, name, phone, contact_type are required' });
  }
  try {
    const result = queryRun(
      'INSERT INTO emergency_contacts (user_id, name, phone, contact_type) VALUES (?, ?, ?, ?)',
      [user_id, name, phone, contact_type]
    );
    res.status(201).json({ id: result.lastInsertRowid, user_id, name, phone, contact_type });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', (req, res) => {
  const { name, phone, contact_type } = req.body;

  if (name === undefined && phone === undefined && contact_type === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
  if (contact_type !== undefined) { fields.push('contact_type = ?'); values.push(contact_type); }

  values.push(req.params.id);

  const query = `UPDATE emergency_contacts SET ${fields.join(', ')} WHERE id = ?`;
  const result = queryRun(query, values);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ id: req.params.id, message: 'Contact updated successfully' });
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  const result = queryRun('DELETE FROM emergency_contacts WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ message: 'Contact deleted successfully' });
});

export default router;
