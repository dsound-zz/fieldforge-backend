import { pool } from "../../config/db";
import { AppError, notFound } from "../../utils/errors";
import { Technician } from "./types";

export const listTechnicians = async ({ isActive, skillLevel }: { isActive?: boolean; skillLevel?: string }): Promise<Technician[]> => {

  const clauses: string[] = [];
  const values: Array<boolean | string> = [];

  if (isActive !== undefined) {
    clauses.push(`active = $${values.length + 1}`);
    values.push(isActive);
  }
  if (skillLevel) {
    clauses.push(`skill_level = $${values.length + 1}`);
    values.push(skillLevel);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(`SELECT * FROM technicians ${where} ORDER BY id`, values)

  return result.rows
}

export const createTechnician = async (data: Omit<Technician, "id" | "created_at">): Promise<Technician> => {
  const result = await pool.query(
    `INSERT INTO technicians(user_id, skill_level, hourly_rate, active)
     VALUES($1, $2, $3, COALESCE($4, TRUE)) RETURNING *`,
    [data.user_id, data.skill_level, data.hourly_rate, data.active]
  );
  return result.rows[0];
};

export const updateTechnician = async (
  id: number,
  data: Partial<Omit<Technician, "id" | "created_at">>
): Promise<Technician> => {
  const fields = Object.keys(data);
  if (fields.length === 0) throw new AppError("No fields to update", 400);
  const setClauses = fields.map((field, idx) => `${field} = $${idx + 2}`).join(", ");
  const values = Object.values(data);
  const result = await pool.query(
    `UPDATE technicians SET ${setClauses} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  const row = result.rows[0];
  if (!row) throw notFound("Technician", id);
  return row;
};
