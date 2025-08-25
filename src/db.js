import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// idi jedan nivo iznad (iz src/ u root) i nadji schema.sql
const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
