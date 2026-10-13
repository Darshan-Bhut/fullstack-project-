require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "tasks.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function asTask(row) {
  return { ...row, completed: Boolean(row.completed) };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "taskflow-api", timestamp: new Date().toISOString() });
});

app.get("/api/tasks", (_req, res) => {
  const rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
  res.json(rows.map(asTask));
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  if (!title || title.length > 120) {
    return res.status(400).json({ error: "Title is required and must be 120 characters or fewer." });
  }
  if (description.length > 1000) {
    return res.status(400).json({ error: "Description must be 1000 characters or fewer." });
  }
  const result = db.prepare("INSERT INTO tasks (title, description) VALUES (?, ?)").run(title, description);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(asTask(task));
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid task ID." });

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Task not found." });

  const title = req.body.title === undefined ? existing.title :
    (typeof req.body.title === "string" ? req.body.title.trim() : "");
  const description = req.body.description === undefined ? existing.description :
    (typeof req.body.description === "string" ? req.body.description.trim() : "");
  const completed = req.body.completed === undefined ? existing.completed :
    (req.body.completed === true ? 1 : req.body.completed === false ? 0 : null);

  if (!title || title.length > 120) return res.status(400).json({ error: "Title is required and must be 120 characters or fewer." });
  if (description.length > 1000) return res.status(400).json({ error: "Description must be 1000 characters or fewer." });
  if (completed === null) return res.status(400).json({ error: "completed must be true or false." });

  db.prepare("UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?")
    .run(title, description, completed, id);
  res.json(asTask(db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)));
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid task ID." });
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (!result.changes) return res.status(404).json({ error: "Task not found." });
  res.status(204).end();
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled request error:", err.message);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, "0.0.0.0", () => console.log(`TaskFlow running on http://localhost:${PORT}`));
