import * as SQLite from 'expo-sqlite';

export const getDatabase = () => {
    const db = SQLite.openDatabaseSync('bambole.db');

    db.execSync(`
    CREATE TABLE IF NOT EXISTS cache_children (
      id TEXT PRIMARY KEY,
      name TEXT,
      class_id TEXT
    );
    CREATE TABLE IF NOT EXISTS cache_attendance (
      id TEXT PRIMARY KEY,
      child_id TEXT,
      date TEXT,
      status TEXT,
      synced INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS cache_announcements (
      id TEXT PRIMARY KEY,
      content TEXT,
      published_at TEXT,
      audience_type TEXT
    );
  `);

    return db;
};
