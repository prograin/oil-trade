-- seed.sql

INSERT INTO users (name, nickname, email, password) VALUES
  ('Alice', 'Super Seller', 'alice@example.com', 'password123'),
  ('Bob',   'Fire Alarm Guy',  'bob@example.com',   'secret456');

INSERT INTO offers (
  user_id,
  document_type,
  product,
  api,
  sulfur,
  quantity,
  deal_type,
  delivery_term,
  delivery_detail,
  transfer_zone,
  benchmark_based,
  payment_term,
  operation_cost,
  down_payment,
  validity
) VALUES
  (
    1,
    'Offer',
    'Crude Oil',
    32.5,
    1.2,
    100000,
    'FOB',
    'CIF',
    'Delivered to Rotterdam',
    'ARA',
    2.5,
    'LC at sight',
    'Included',
    '10%',
    '2025-12-31'
  ),
  (
    2,
    'Offer',
    'Fuel Oil',
    18.0,
    3.5,
    50000,
    'CIF',
    'FOB',
    'Pickup at Houston',
    'USGC',
    1.8,
    '30 days',
    'Excluded',
    '20%',
    '2025-11-30'
  );
