-- DROP TABLE if EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- DROP TABLE if EXISTS offers;
CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  document_type TEXT,
  product TEXT,
  api FLOAT,
  sulfur FLOAT,
  quantity INTEGER,
  deal_type TEXT,
  delivery_term TEXT,
  delivery_detail TEXT,
  transfer_zone TEXT,
  benchmark_based FLOAT,
  payment_term TEXT,
  operation_cost TEXT,
  down_payment TEXT,
  validity DATE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id INTEGER,
  user_id INTEGER,
  value REAL,
  created_at DATE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (offer_id,user_id)
)