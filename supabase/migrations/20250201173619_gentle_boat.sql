/*
  # Add method column to webhooks table

  1. Changes
    - Add `method` column to `webhooks` table with default value 'POST'
    - Make the column non-nullable to ensure data consistency
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhooks' AND column_name = 'method'
  ) THEN
    ALTER TABLE webhooks 
    ADD COLUMN method text NOT NULL DEFAULT 'POST';
  END IF;
END $$;