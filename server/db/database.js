const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'taxi.db');

let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickup TEXT NOT NULL,
      dropoff TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      passenger_name TEXT,
      passenger_phone TEXT,
      notes TEXT,
      driver_id INTEGER,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      updated_by INTEGER,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const result = db.exec("SELECT COUNT(*) as count FROM users");
  const count = result[0]?.values[0][0];
  if (count === 0) {
    db.run("INSERT INTO users (name, role, pin) VALUES ('Owner', 'owner', '0000')");
    db.run("INSERT INTO users (name, role, pin) VALUES ('Ahmed', 'driver', '1111')");
    db.run("INSERT INTO users (name, role, pin) VALUES ('Mohammed', 'driver', '2222')");
    db.run("INSERT INTO users (name, role, pin) VALUES ('Khalid', 'driver', '3333')");
    console.log('✅ Seeded default users (Owner: 0000, Drivers: 1111/2222/3333)');
    _save();
  }

  return db;
}

function _save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function query(sql, params = []) {
  const result = db.exec(sql, params);
  return rowsToObjects(result);
}

function run(sql, params = []) {
  db.run(sql, params);
  const rowid = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  _save();
  return rowid;
}

module.exports = { initDb, query, run };
