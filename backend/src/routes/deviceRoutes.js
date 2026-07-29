import { Router } from 'express';
import { queryAll, queryGet, queryRun } from '../db/connection.js';

const router = Router();

// GET /api/devices?user_id=1
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  const devices = queryAll('SELECT * FROM bluetooth_devices WHERE user_id = ? ORDER BY is_active DESC, last_connected DESC', [user_id]);
  res.json(devices);
});

// GET /api/devices/:id
router.get('/:id', (req, res) => {
  const device = queryGet('SELECT * FROM bluetooth_devices WHERE id = ?', [req.params.id]);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

// POST /api/devices
router.post('/', (req, res) => {
  const { user_id, name, device_type, mac_address } = req.body;
  if (!user_id || !name || !device_type) {
    return res.status(400).json({ error: 'user_id, name, device_type are required' });
  }
  try {
    const result = queryRun(
      'INSERT INTO bluetooth_devices (user_id, name, device_type, mac_address) VALUES (?, ?, ?, ?)',
      [user_id, name, device_type, mac_address]
    );
    res.status(201).json({ id: result.lastInsertRowid, user_id, name, device_type, mac_address });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/devices/:id/set-active
router.put('/:id/set-active', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  // Deactivate all user's devices first
  queryRun('UPDATE bluetooth_devices SET is_active = 0 WHERE user_id = ?', [user_id]);

  // Activate this device
  const result = queryRun('UPDATE bluetooth_devices SET is_active = 1, last_connected = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Device not found' });

  res.json({ id: req.params.id, message: 'Device activated successfully' });
});

// PUT /api/devices/:id
router.put('/:id', (req, res) => {
  const { name, mac_address } = req.body;

  if (name === undefined && mac_address === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (mac_address !== undefined) { fields.push('mac_address = ?'); values.push(mac_address); }

  values.push(req.params.id);

  const query = `UPDATE bluetooth_devices SET ${fields.join(', ')} WHERE id = ?`;
  const result = queryRun(query, values);
  if (result.changes === 0) return res.status(404).json({ error: 'Device not found' });
  res.json({ id: req.params.id, message: 'Device updated successfully' });
});

// DELETE /api/devices/:id
router.delete('/:id', (req, res) => {
  // First delete related health logs
  queryRun('DELETE FROM health_logs WHERE device_id = ?', [req.params.id]);
  // Then delete the device
  const result = queryRun('DELETE FROM bluetooth_devices WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Device not found' });
  res.json({ message: 'Device deleted successfully' });
});

export default router;
