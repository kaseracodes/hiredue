const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app } = require('electron');

const dbDir = path.join(app.getPath('userData'), 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const dbPath = path.join(dbDir, 'app.db');
const db = new Database(dbPath);

// Example: init
db.exec(`
  CREATE TABLE IF NOT EXISTS counters (
    id INTEGER PRIMARY KEY,
    value INTEGER
  );
`);

// Insert a row with id=1 and value=0 if it doesn't already exist
const row = db.prepare('SELECT 1 FROM counters WHERE id = 1').get();
if (!row) {
  db.prepare('INSERT INTO counters (id, value) VALUES (1, 0)').run();
}

module.exports = db;
