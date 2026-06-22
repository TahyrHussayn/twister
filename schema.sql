CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY,
  count INTEGER DEFAULT 0
);
INSERT OR IGNORE INTO likes (id, count) VALUES (1, 42);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL
);
INSERT OR IGNORE INTO comments (id, text) VALUES ('1', 'Great architecture!'), ('2', 'Islands are the future');
