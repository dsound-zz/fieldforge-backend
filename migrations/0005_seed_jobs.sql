-- Seed five representative jobs along with schedules and assignments.
WITH job_specs AS (
  SELECT
    c.id AS customer_id,
    tech.id AS technician_id,
    spec.description,
    spec.status,
    spec.start_time,
    spec.end_time
  FROM (
    VALUES
      ('customer1@example.test', 'technician1@fieldforge.test', 'scheduled'::job_status, 'Inspect rooftop HVAC system', TIMESTAMPTZ '2026-01-04 08:00:00+00', TIMESTAMPTZ '2026-01-04 12:00:00+00'),
      ('customer2@example.test', 'technician2@fieldforge.test', 'scheduled'::job_status, 'Replace water heater valves', TIMESTAMPTZ '2026-01-04 13:00:00+00', TIMESTAMPTZ '2026-01-04 17:00:00+00'),
      ('customer3@example.test', 'technician3@fieldforge.test', 'in_progress'::job_status, 'Upgrade lighting controls', TIMESTAMPTZ '2026-01-05 08:30:00+00', TIMESTAMPTZ '2026-01-05 12:30:00+00'),
      ('customer4@example.test', 'technician4@fieldforge.test', 'pending'::job_status, 'Emergency generator maintenance', TIMESTAMPTZ '2026-01-06 09:00:00+00', TIMESTAMPTZ '2026-01-06 12:30:00+00'),
      ('customer5@example.test', 'technician5@fieldforge.test', 'completed'::job_status, 'Design solar panel layout', TIMESTAMPTZ '2026-01-07 07:30:00+00', TIMESTAMPTZ '2026-01-07 11:30:00+00')
  ) AS spec(customer_email, technician_email, status, description, start_time, end_time)
  JOIN customers c ON c.email = spec.customer_email
  JOIN users u ON u.email = spec.technician_email
  JOIN technicians tech ON tech.user_id = u.id
),
inserted_jobs AS (
  INSERT INTO jobs (customer_id, status, description, created_at, updated_at)
  SELECT customer_id, status, description, NOW(), NOW()
  FROM job_specs
  RETURNING id, customer_id, description
),
schedules_inserted AS (
  INSERT INTO schedules (technician_id, start_time, end_time, job_id)
  SELECT js.technician_id, js.start_time, js.end_time, ij.id
  FROM job_specs js
  JOIN inserted_jobs ij ON ij.customer_id = js.customer_id AND ij.description = js.description
  RETURNING job_id, technician_id, start_time AS scheduled_start, end_time AS scheduled_end
)
INSERT INTO job_assignments (job_id, technician_id, scheduled_start, scheduled_end)
SELECT job_id, technician_id, scheduled_start, scheduled_end
FROM schedules_inserted;
