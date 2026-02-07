-- Migration 0005 (SQLite)
ALTER TABLE offers
ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active','reserved','sold_out','expired','closed','canceled'));
