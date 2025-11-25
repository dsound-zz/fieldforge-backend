-- Seed five new customers

INSERT INTO customers (name, email, phone, address)
VALUES 
  ('customer one', 'customer1@example.test', '444-444-4444', '123 lincoln ave, Beaverton, NY, 20000'),
  ('customer two', 'customer2@example.test', '444-444-3333', '125 lincoln ave, Beaverton, NY, 20000'),
  ('customer three', 'customer3@example.test', '444-444-3344', '94 hertmouth ave, Beaverton, NY, 20000'),
  ('customer four', 'customer4@example.test', '444-222-4444', '4 mostgot ave, Beaverton, NY, 20000'),
  ('customer five', 'customer5@example.test', '444-232-4444', '250 lincoln ave, Beaverton, NY, 20000')
RETURNING id, email;
