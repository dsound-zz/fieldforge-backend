-- Seed five base technician users and profiles
WITH new_users AS (
  INSERT INTO users (email, password_hash, role)
  VALUES
    ('technician1@fieldforge.test', '$2a$10$CVv.Ck7JgLfW/EPM5863LOVNszVO/dsK2Fhigxa2672ppTUCP05P6', 'technician'),
    ('technician2@fieldforge.test', '$2a$10$CVv.Ck7JgLfW/EPM5863LOVNszVO/dsK2Fhigxa2672ppTUCP05P6', 'technician'),
    ('technician3@fieldforge.test', '$2a$10$CVv.Ck7JgLfW/EPM5863LOVNszVO/dsK2Fhigxa2672ppTUCP05P6', 'technician'),
    ('technician4@fieldforge.test', '$2a$10$CVv.Ck7JgLfW/EPM5863LOVNszVO/dsK2Fhigxa2672ppTUCP05P6', 'technician'),
    ('technician5@fieldforge.test', '$2a$10$CVv.Ck7JgLfW/EPM5863LOVNszVO/dsK2Fhigxa2672ppTUCP05P6', 'technician')
  ON CONFLICT (email) DO UPDATE
    SET password_hash = users.password_hash
  RETURNING id, email
)
INSERT INTO technicians (user_id, skill_level, hourly_rate, active)
SELECT
  nu.id,
  CASE nu.email
    WHEN 'technician1@fieldforge.test' THEN 'junior'
    WHEN 'technician2@fieldforge.test' THEN 'field'
    WHEN 'technician3@fieldforge.test' THEN 'field'
    WHEN 'technician4@fieldforge.test' THEN 'master'
    WHEN 'technician5@fieldforge.test' THEN 'master'
    ELSE NULL
  END,
  CASE nu.email
    WHEN 'technician1@fieldforge.test' THEN 35
    WHEN 'technician2@fieldforge.test' THEN 40
    WHEN 'technician3@fieldforge.test' THEN 42
    WHEN 'technician4@fieldforge.test' THEN 45
    WHEN 'technician5@fieldforge.test' THEN 50
    ELSE 0
  END,
  TRUE
FROM new_users nu
WHERE NOT EXISTS (
  SELECT 1
  FROM technicians t
  WHERE t.user_id = nu.id
);
