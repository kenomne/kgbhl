import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// apsolutna putanja do schema.sql i baze
const schemaPath = path.join(__dirname, "..", "schema.sql");
const dbPath = path.join(__dirname, "..", "database.sqlite");

// Kreiraj ili otvori bazu
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB connection error:", err);
  else console.log("Connected to SQLite DB");
});

// Funkcija za inicijalizaciju tabela
export const initDb = () => {
  const sql = fs.readFileSync(schemaPath, "utf8");
  db.exec(sql, (err) => {
    if (err) console.error("DB init error:", err);
    else console.log("Database initialized");
  });
  return db;
};

export default db;
