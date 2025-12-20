-- DROP TABLE IF EXISTS bids;
-- DROP TABLE IF EXISTS offers;
-- DROP TABLE IF EXISTS demands;
-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

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
  price INTEGER NOT NULL,
  validity DATE,
  type TEXT DEFAULT 'offer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS demands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  document_type TEXT NOT NULL,
  product TEXT NOT NULL,

  api_min FLOAT,          
  api_max FLOAT,         
  sulfur_max FLOAT,         


  quantity INTEGER NOT NULL,

  deal_type TEXT NOT NULL,
  delivery_term TEXT NOT NULL,
  delivery_detail TEXT NOT NULL,
  transfer_zone TEXT NOT NULL,

  benchmark_based FLOAT,   
  payment_term TEXT NOT NULL,
  operation_cost TEXT NOT NULL,
  down_payment TEXT NOT NULL,

  target_price INTEGER NOT NULL, 
  is_active BOOLEAN NOT NULL DEFAULT true,

  validity DATE NOT NULL,
  type TEXT DEFAULT 'demand',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_demands_user_id ON demands(user_id);
CREATE INDEX IF NOT EXISTS idx_demands_is_active ON demands(is_active);
CREATE INDEX IF NOT EXISTS idx_demands_product ON demands(product);


CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id INTEGER,
  user_id INTEGER,
  value REAL,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at DATE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (offer_id,user_id)
)

