ALTER TABLE customers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'idx_customers_deleted_at'
      AND relkind = 'i'
  ) THEN
    CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
  END IF;
END$$;
