import { pool } from "../../config/db";
import { logger } from "../../config/logger";
import { AppError, forbidden, notFound } from "../../utils/errors";
import { RequestUser } from "../../types/express";
import { Job } from "./types";

export const createJob = async (customer_id: number, description: string): Promise<Job> => {
  const result = await pool.query(
    `INSERT INTO jobs(customer_id, description) VALUES($1, $2) RETURNING *`,
    [customer_id, description]
  );
  const job = result.rows[0];
  await pool.query(`INSERT INTO logs(event_type, event_data) VALUES($1, $2)`, [
    "job_created",
    { job_id: job.id, customer_id, description }
  ]);
  return job;
};

export const listJobs = async ({ limit, offset }: { limit: number; offset: number }, user?: RequestUser | null): Promise<{ jobs: Job[], total: number }> => {
  const client = await pool.connect()

  const technicianJobsQuery =
    `SELECT j.*
       FROM jobs j
       JOIN job_assignments ja ON ja.job_id = j.id
       JOIN technicians t ON t.id = ja.technician_id
       WHERE t.user_id = $1
       ORDER BY j.created_at DESC
       LIMIT $2 OFFSET $3`;

  const jobsQuery = `
    SELECT * FROM jobs
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `;

  const countQuery = `SELECT COUNT(*) FROM jobs`;

  try {
    const [jobsRes, technicianJobsRes, countRes] = await Promise.all([
      client.query(jobsQuery, [limit, offset]),
      user?.role === "technician" && user?.id
        ? client.query(technicianJobsQuery, [user.id, limit, offset])
        : Promise.resolve({ rows: [] }),
      client.query(countQuery),
    ])

    const listObj = { total: parseInt(countRes.rows[0].count) }

    if (user?.role === "technician") return { jobs: technicianJobsRes.rows, ...listObj }

    return {
      jobs: jobsRes.rows,
      ...listObj
    }
  } finally {
    client.release()
  }

};


export const getJobById = async (id: number, user?: RequestUser): Promise<Job> => {
  const jobResult = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
  const job = jobResult.rows[0];
  if (!job) throw notFound("Job", id);

  if (user && user.role === "technician") {
    const assigned = await pool.query(
      `SELECT 1 FROM job_assignments ja
       JOIN technicians t ON ja.technician_id = t.id
       WHERE ja.job_id = $1 AND t.user_id = $2`,
      [id, user.id]
    );
    if (!assigned.rowCount || assigned.rowCount === 0) throw forbidden("Technicians can only view their assigned jobs");
  }

  return job;
};

export const assignTechnician = async (
  requestedJob: Job,
  technician_id: number,
  scheduled_start: string,
  scheduled_end: string
) => {
  const techResult = await pool.query("SELECT active FROM technicians WHERE id = $1", [technician_id]);
  const technician = techResult.rows[0];
  if (!technician) throw notFound("Technician", technician_id);
  if (!technician.active) throw new AppError("Technician is not active", 400);

  if (requestedJob.status === "completed" || requestedJob.status === "invoiced") {
    throw new AppError("Cannot assign technician to completed/invoiced job", 400);
  }

  const result = await pool.query(
    `INSERT INTO job_assignments(job_id, technician_id, scheduled_start, scheduled_end)
     VALUES($1, $2, $3, $4)
     ON CONFLICT (job_id, technician_id) DO UPDATE
     SET scheduled_start = EXCLUDED.scheduled_start,
         scheduled_end = EXCLUDED.scheduled_end
     RETURNING *`,
    [requestedJob.id, technician_id, scheduled_start, scheduled_end]
  );
  return result.rows[0];
};

export const startJob = async (job_id: number) => {
  const result = await pool.query(
    `UPDATE jobs SET status = 'in_progress', updated_at = NOW() WHERE id = $1 AND status IN ('pending','scheduled') RETURNING *`,
    [job_id]
  );
  const job = result.rows[0];
  if (!job) throw new AppError("Job cannot be started", 400);
  return job;
};

export const completeJob = async (job_id: number) => {
  const res = await pool.query("SELECT * FROM jobs WHERE id = $1", [job_id]);
  const job = res.rows[0];
  if (!job) throw notFound("Job", job_id);

  if (job.status === "completed" || job.status === "invoiced") {
    throw new AppError("Job already completed", 400);
  }

  await pool.query("BEGIN");
  try {
    const updated = await pool.query(
      `UPDATE jobs SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [job_id]
    );
    const completedJob = updated.rows[0];

    // Mock async invoice generation: create invoice immediately and mark job invoiced
    const invoiceResult = await pool.query(
      `INSERT INTO invoices(job_id, amount, status) VALUES($1, $2, 'unpaid')
       ON CONFLICT (job_id) DO NOTHING RETURNING *`,
      [job_id, 0]
    );

    if (invoiceResult.rowCount && invoiceResult.rowCount > 0) {
      await pool.query(`UPDATE jobs SET status = 'invoiced', updated_at = NOW() WHERE id = $1`, [job_id]);
      await pool.query(`INSERT INTO logs(event_type, event_data) VALUES($1, $2)`, [
        "invoice_created",
        { job_id, invoice_id: invoiceResult.rows[0].id }
      ]);
    }

    await pool.query("COMMIT");
    return completedJob;
  } catch (err) {
    await pool.query("ROLLBACK");
    logger.error({ err }, "Failed to complete job");
    throw err;
  }
};
