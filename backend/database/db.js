const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "alumni.db");

const raw = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error("DB open error:", err); process.exit(1); }
});

raw.run("PRAGMA journal_mode = WAL");
raw.run("PRAGMA foreign_keys = ON");

// Promise wrappers
const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    raw.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    })
  );

const get = (sql, params = []) =>
  new Promise((resolve, reject) =>
    raw.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );

const all = (sql, params = []) =>
  new Promise((resolve, reject) =>
    raw.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])))
  );

const exec = (sql) =>
  new Promise((resolve, reject) =>
    raw.exec(sql, (err) => (err ? reject(err) : resolve()))
  );

const initSchema = async () => {
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'alumni', avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS alumni (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      batch TEXT NOT NULL, department TEXT NOT NULL, job_title TEXT, company TEXT,
      location TEXT, phone TEXT, linkedin TEXT, skills TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active', bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT,
      event_date TEXT NOT NULL, location TEXT, type TEXT, capacity INTEGER DEFAULT 100,
      status TEXT DEFAULT 'upcoming', created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(event_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, company TEXT NOT NULL,
      description TEXT, location TEXT, type TEXT DEFAULT 'Full-time', skills TEXT DEFAULT '[]',
      posted_by INTEGER REFERENCES users(id), status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(job_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS mentorship_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, mentor_id INTEGER REFERENCES users(id),
      mentee_id INTEGER REFERENCES users(id), message TEXT, status TEXT DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, donor_id INTEGER REFERENCES users(id),
      amount REAL NOT NULL, purpose TEXT DEFAULT 'General Fund', message TEXT,
      donated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

initSchema().catch(console.error);

module.exports = { run, get, all, exec };
