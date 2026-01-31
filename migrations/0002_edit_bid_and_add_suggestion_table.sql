-- Migration number: 0002 	 2026-01-07T06:47:18.821Z

-- Migration number: 0002  2026-01-07T06:47:18.821Z

ALTER TABLE bids
DROP COLUMN value;

CREATE TABLE suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  bid_id INTEGER,
  suggestion TEXT NOT NULL
    DEFAULT '{}'
    CHECK (json_valid(suggestion) AND json_type(suggestion) = 'object'),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE ON UPDATE CASCADE
);
