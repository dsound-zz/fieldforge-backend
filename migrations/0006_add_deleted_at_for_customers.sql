-- add deleted_at column for customers - datetime or null

ALTER TABLE customers 
ADD COLUMN deleted_at TIMESTAMP NULL; 

CREATE INDEX customers_deleted_at_idx
ON customers (deleted_at);

UPDATE customers
SET deleted_at = NOW() 
WHERE id = 1;

