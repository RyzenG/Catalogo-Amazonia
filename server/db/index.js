const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'catalog.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.pragma('journal_mode = WAL');

module.exports = db;
