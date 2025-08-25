import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "..", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

const db = new sqlite3.Database(path.join(__dirname, "..", "database.sqlite"), (err) => {
  if (err) console.error("DB connection error:", err);
  else console.log("Connected to SQLite DB");
});

db.exec(sql, (err) => {
  if (err) console.error("DB init error:", err);
  else console.log("Database initialized");
});

// Ovo je ključno da auth.js može da radi
export default db;
