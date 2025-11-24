-- Enable needed extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enumerations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'invoiced');
    END IF;
END$$;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'technician', 'dispatcher')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Technicians
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    skill_level VARCHAR(50),
    hourly_rate NUMERIC(10,2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'pending',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Job assignments
CREATE TABLE IF NOT EXISTS job_assignments (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, technician_id),
    CONSTRAINT no_overlapping_assignments EXCLUDE USING gist (
        technician_id WITH =,
        tsrange(scheduled_start, scheduled_end) WITH &&
    )
);
CREATE INDEX IF NOT EXISTS idx_job_assignments_technician ON job_assignments(technician_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);

-- Technician schedules (general availability or blocks)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_schedules_technician ON schedules(technician_id);
CREATE INDEX IF NOT EXISTS idx_schedules_job ON schedules(job_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(16) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid'))
);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type);

-- Helper Views
CREATE OR REPLACE VIEW technician_upcoming_jobs AS
SELECT
    t.id AS technician_id,
    u.email AS technician_email,
    j.id AS job_id,
    j.status,
    ja.scheduled_start,
    ja.scheduled_end
FROM job_assignments ja
JOIN technicians t ON ja.technician_id = t.id
JOIN users u ON t.user_id = u.id
JOIN jobs j ON ja.job_id = j.id
WHERE ja.scheduled_start > NOW();

CREATE OR REPLACE VIEW job_financials AS
SELECT
    j.id AS job_id,
    j.status,
    COALESCE(i.amount, 0) AS invoice_amount,
    COALESCE(SUM(p.amount), 0) AS payments_total,
    CASE WHEN i.status = 'paid' THEN TRUE ELSE FALSE END AS is_paid
FROM jobs j
LEFT JOIN invoices i ON j.id = i.job_id
LEFT JOIN payments p ON i.id = p.invoice_id
GROUP BY j.id, i.amount, i.status;

-- Seed admin user placeholder (password should be reset later)
INSERT INTO users (email, password_hash, role)
VALUES ('admin@fieldforge.test', '$2a$10$Y1YhWfes2yZX0FqP/d9vyOeGZrx5K6.jWiYVl45BwPMYqZagkeVbq', 'admin')
ON CONFLICT (email) DO NOTHING;
