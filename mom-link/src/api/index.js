const API_BASE = 'http://localhost:3000/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Users
  getUsers: () => request('GET', '/users'),
  getUser: (id) => request('GET', `/users/${id}`),
  register: (data) => request('POST', '/users/register', data),
  login: (data) => request('POST', '/users/login', data),
  updateUser: (id, data) => request('PUT', `/users/${id}`, data),

  // Devices
  getDevices: (userId) => request('GET', `/devices?user_id=${userId}`),
  getDevice: (id) => request('GET', `/devices/${id}`),
  addDevice: (data) => request('POST', '/devices', data),
  setActiveDevice: (id, userId) => request('PUT', `/devices/${id}/set-active`, { user_id: userId }),
  updateDevice: (id, data) => request('PUT', `/devices/${id}`, data),
  deleteDevice: (id) => request('DELETE', `/devices/${id}`),

  // Health Logs
  getHealthLogs: (userId, limit = 100) => request('GET', `/health-logs?user_id=${userId}&limit=${limit}`),
  getLatestHealth: (userId) => request('GET', `/health-logs/latest?user_id=${userId}`),
  getHealthStats: (userId) => request('GET', `/health-logs/stats?user_id=${userId}`),
  addHealthLog: (data) => request('POST', '/health-logs', data),
  exportHealthLogs: (userId, format = 'json') => `${API_BASE}/health-logs/export?user_id=${userId}&format=${format}`,

  // Contacts
  getContacts: (userId) => request('GET', `/contacts?user_id=${userId}`),
  addContact: (data) => request('POST', '/contacts', data),
  updateContact: (id, data) => request('PUT', `/contacts/${id}`, data),
  deleteContact: (id) => request('DELETE', `/contacts/${id}`),
};
