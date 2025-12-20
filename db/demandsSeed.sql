-- Randomly generate 40 demand rows for 5 users (SQLite / D1)

WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 40
)
INSERT INTO demands (
  user_id,
  document_type,
  product,
  api_min,
  api_max,
  sulfur_max,
  quantity,
  deal_type,
  delivery_term,
  delivery_detail,
  transfer_zone,
  benchmark_based,
  payment_term,
  operation_cost,
  down_payment,
  target_price,
  is_active,
  validity
)
SELECT
  (ABS(RANDOM()) % 5) + 1                                   AS user_id,

  CASE ABS(RANDOM()) % 4
    WHEN 0 THEN 'Spot Purchase Requirement'
    WHEN 1 THEN 'Term Supply Requirement'
    WHEN 2 THEN 'EOI – Refinery Feedstock'
    ELSE 'Purchase Inquiry – Crude Oil'
  END                                                      AS document_type,

  CASE ABS(RANDOM()) % 4
    WHEN 0 THEN 'Light Crude Oil'
    WHEN 1 THEN 'Medium Crude Oil'
    WHEN 2 THEN 'Heavy Crude Oil'
    ELSE 'Super Heavy Crude Oil'
  END                                                      AS product,

  ROUND(28 + (ABS(RANDOM()) % 10), 1)                       AS api_min,
  ROUND(33 + (ABS(RANDOM()) % 10), 1)                       AS api_max,
  ROUND((ABS(RANDOM()) % 500) / 100.0, 2)                   AS sulfur_max,

  (ABS(RANDOM()) % 9 + 1) * 50000                           AS quantity,

  CASE ABS(RANDOM()) % 4
    WHEN 0 THEN 'Spot'
    WHEN 1 THEN 'One-Time Cargo'
    WHEN 2 THEN 'Trial Shipment'
    ELSE 'Term Contract (Monthly Delivery)'
  END                                                      AS deal_type,

  CASE ABS(RANDOM()) % 5
    WHEN 0 THEN 'FOB'
    WHEN 1 THEN 'CFR'
    WHEN 2 THEN 'CIF'
    WHEN 3 THEN 'DAP'
    ELSE 'STS'
  END                                                      AS delivery_term,

  CASE ABS(RANDOM()) % 5
    WHEN 0 THEN 'FOB Ras Tanura'
    WHEN 1 THEN 'CFR Qingdao'
    WHEN 2 THEN 'CIF Rotterdam'
    WHEN 3 THEN 'STS offshore Fujairah'
    ELSE 'FOB Basrah'
  END                                                      AS delivery_detail,

  CASE ABS(RANDOM()) % 5
    WHEN 0 THEN 'Arabian Gulf OPL'
    WHEN 1 THEN 'East China Sea'
    WHEN 2 THEN 'North Sea OPL'
    WHEN 3 THEN 'Persian Gulf OPL'
    ELSE 'Indian Ocean OPL'
  END                                                      AS transfer_zone,

  ROUND((ABS(RANDOM()) % 800 - 300) / 100.0, 2)             AS benchmark_based,

  CASE ABS(RANDOM()) % 4
    WHEN 0 THEN 'TT after independent Q&Q inspection (Dip Test)'
    WHEN 1 THEN 'SBLC (Standby Letter of Credit)'
    WHEN 2 THEN 'DLC (Documentary Letter of Credit)'
    ELSE 'LC at sight'
  END                                                      AS payment_term,

  CASE ABS(RANDOM()) % 3
    WHEN 0 THEN 'Standard STS operation included'
    WHEN 1 THEN 'Buyer to cover STS costs'
    ELSE 'Shared operation costs (50/50)'
  END                                                      AS operation_cost,

  CASE ABS(RANDOM()) % 3
    WHEN 0 THEN 'After Dip Test'
    WHEN 1 THEN 'LC'
    ELSE 'Escrow Account Deposit'
  END                                                      AS down_payment,

  55 + (ABS(RANDOM()) % 25)                                 AS target_price,

  ABS(RANDOM()) % 2                                         AS is_active,

  DATE('2026-01-01', '+' || (ABS(RANDOM()) % 45) || ' days') AS validity
FROM seq;
