-- Migration number: 0001 	 2025-12-15T08:36:16.613Z
PRAGMA foreign_keys=OFF;

ALTER TABLE bids RENAME TO bids_old;

CREATE TABLE bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  value REAL,
  created_at DATE DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (offer_id)
    REFERENCES offers(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  UNIQUE (offer_id, user_id)
);

INSERT INTO bids (id, offer_id, user_id, value, created_at)
SELECT id, offer_id, user_id, value, created_at
FROM bids_old;

DROP TABLE bids_old;

PRAGMA foreign_keys=ON;