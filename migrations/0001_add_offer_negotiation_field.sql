-- Migration number: 0001 	 2026-01-06T06:46:06.721Z
ALTER TABLE offers
ADD COLUMN negotiation_field TEXT;

UPDATE offers
SET negotiation_field = '[price]';