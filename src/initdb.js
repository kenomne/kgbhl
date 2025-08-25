import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// sad čita schema.sql iz root foldera
const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
