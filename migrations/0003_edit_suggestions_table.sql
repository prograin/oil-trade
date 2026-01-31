-- Migration number: 0003 	 2026-01-07T13:07:41.442Z
CREATE TABLE suggestions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  bid_id INTEGER,
  suggestion TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(suggestion) AND json_type(suggestion) = 'array'),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO suggestions_new (id, user_id, bid_id, suggestion, created_at)
SELECT
  id,
  user_id,
  bid_id,
  CASE
    WHEN json_valid(suggestion) AND json_type(suggestion) = 'object' THEN '[]'
    ELSE suggestion
  END AS suggestion,
  CURRENT_TIMESTAMP AS created_at
FROM suggestions;

DROP TABLE suggestions;
ALTER TABLE suggestions_new RENAME TO suggestions;
