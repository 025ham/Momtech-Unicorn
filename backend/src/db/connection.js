import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../db.sqlite');

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

// Helper to run SELECT queries and return array of objects (like better-sqlite3)
function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper to run SELECT query and return single object (like better-sqlite3)
function queryGet(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

// Helper to run INSERT/UPDATE/DELETE and return result info
function queryRun(sql, params = []) {
  getDb().run(sql, params);
  return {
    changes: getDb().getRowsModified(),
    lastInsertRowid: getLastInsertRowid()
  };
}

function getLastInsertRowid() {
  const result = getDb().exec('SELECT last_insert_rowid()');
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return null;
}

function saveDb() {
  const data = getDb().export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

export { initDb, getDb, queryAll, queryGet, queryRun, saveDb };
export default { queryAll, queryGet, queryRun, saveDb };
