import { pool } from "../../config/db";
import { AppError, notFound } from "../../utils/errors";
import { Customer } from "./types";

export const createCustomer = async (data: Omit<Customer, "id" | "created_at">): Promise<Customer> => {
  const result = await pool.query(
    `INSERT INTO customers(name, email, phone, address) VALUES($1, $2, $3, $4) RETURNING *`,
    [data.name, data.email, data.phone, data.address]
  );
  return result.rows[0];
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const result = await pool.query("SELECT * FROM customers WHERE deleted_at IS NULL AND id = $1", [id]);
  const row = result.rows[0];
  if (!row) throw notFound("Customer", id);
  return row;
};

export const updateCustomer = async (id: number, data: Partial<Omit<Customer, "id" | "created_at">>): Promise<Customer> => {
  const fields = Object.keys(data);
  if (fields.length === 0) throw new AppError("No fields to update", 400);
  const setClauses = fields.map((field, idx) => `${field} = $${idx + 2}`).join(", ");
  const values = Object.values(data);
  const result = await pool.query(
    `UPDATE customers SET ${setClauses} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [id, ...values]
  );
  const row = result.rows[0];
  if (!row) throw notFound("Customer", id);
  return row;
};

export const softDeleteCustomer = async (id: number): Promise<Customer> => {
  const result = await pool.query(
    `UPDATE customers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [id]
  );
  const row = result.rows[0]
  if (!row) throw notFound("Customer", id);
  return row;
}
