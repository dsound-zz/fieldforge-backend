-- Make sure technicians always point to a user whose role is 'technician' 
CREATE OR REPLACE FUNCTION ensure_user_is_technician()
RETURNS TRIGGER AS $$ 
BEGIN
   IF NOT EXISTS (
      SELECT 1
      FROM users 
      WHERE id = NEW.user_id 
         AND role = 'technician'
   ) THEN 
      RAISE EXCEPTION 'Technician records must reference a user with role technician.';
   END IF; 

   RETURN NEW;
END; 
$$ LANGUAGE plpgsql; 

DROP TRIGGER IF EXISTS ensure_user_is_technician_trigger ON technicians;

CREATE TRIGGER ensure_user_is_technician_trigger 
BEFORE INSERT OR UPDATE ON technicians 
FOR EACH ROW EXECUTE FUNCTION ensure_user_is_technician();