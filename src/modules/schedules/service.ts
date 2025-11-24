import { pool } from "../../config/db";
import { Schedule } from "./types";

export const listSchedules = async (): Promise<Schedule[]> => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY start_time DESC");
  return result.rows;
};

export const createSchedule = async (data: Omit<Schedule, "id" | "created_at">): Promise<Schedule> => {
  const result = await pool.query(
    `INSERT INTO schedules(technician_id, start_time, end_time, job_id)
     VALUES($1, $2, $3, $4) RETURNING *`,
    [data.technician_id, data.start_time, data.end_time, data.job_id]
  );
  return result.rows[0];
};
