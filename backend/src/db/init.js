import db from './connection.js';

// npm run db:init

const schema = `
-- Users (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  age INTEGER,
  pregnancy_week INTEGER,
  due_date TEXT,
  hospital TEXT,
  doctor TEXT,
  blood_type TEXT,
  allergies TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bluetooth Devices
CREATE TABLE IF NOT EXISTS bluetooth_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL,      -- heart_rate_monitor, temperature_sensor, movement_sensor
  mac_address TEXT,
  is_active INTEGER DEFAULT 0,    -- boolean - currently selected
  last_connected DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Health Logs (from Bluetooth devices)
CREATE TABLE IF NOT EXISTS health_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  device_id INTEGER,
  heart_rate INTEGER,
  temperature REAL,
  baby_movement INTEGER,
  stress_level TEXT,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (device_id) REFERENCES bluetooth_devices(id)
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_type TEXT NOT NULL,    -- emergency, personal, doctor
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Uptime Monitors (existing)
CREATE TABLE IF NOT EXISTS monitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  interval INTEGER DEFAULT 60000,
  timeout INTEGER DEFAULT 30000,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Monitor Logs
CREATE TABLE IF NOT EXISTS monitor_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);

-- AI Analysis Results
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  monitor_id INTEGER,
  analysis_type TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_logged_at ON health_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_bluetooth_devices_user_id ON bluetooth_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
`;

db.exec(schema);

// Seed demo user
const existingUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
if (!existingUser) {
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, age, pregnancy_week, due_date, hospital, doctor, blood_type, allergies)
    VALUES (1, 'Sarah Johnson', 'sarah@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 28, 28, '2024-10-15', 'Bangkok Hospital', 'Dr. Maria Chen', 'O+', 'None')
  `).run();
  console.log('✅ Demo user created');
}

console.log('✅ Database initialized with schema');
