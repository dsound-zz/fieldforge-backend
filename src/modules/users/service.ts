import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import { config } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError, notFound } from "../../utils/errors";
import { User, UserRole } from "./types";

const toUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  role: row.role,
  created_at: row.created_at
});

const generateToken = (user: User) =>
  jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: "7d" });

export const createUser = async (email: string, password: string, role: UserRole) => {
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING *",
      [email, hashed, role]
    );
    const user = toUser(result.rows[0]);
    const token = generateToken(user);
    return { user, token };
  } catch (err: any) {
    logger.error({ err }, "Failed to create user");
    if (err.code === "23505") {
      throw new AppError("Email already in use", 409);
    }
    throw err;
  }
};

export const authenticateUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const row = result.rows[0];
  if (!row) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const user = toUser(row);
  const token = generateToken(user);
  return { user, token };
};

export const listUsers = async (): Promise<User[]> => {
  const result = await pool.query("SELECT id, email, role, created_at FROM users ORDER BY id");
  return result.rows.map(toUser);
};

export const getUserById = async (id: number): Promise<User> => {
  const result = await pool.query("SELECT id, email, role, created_at FROM users WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row) throw notFound("User", id);
  return toUser(row);
};


export async function getMaxUserNumber(role: string): Promise<number> {
  const result = await pool.query(
    `SELECT email FROM users WHERE role = $1 AND email LIKE $2`,
    [role, `${role}%@fieldforge.test`]
  );

  if (result.rows.length === 0) return 0;

  // Extract numbers from emails like "technician5@fieldforge.test"
  const numbers = result.rows
    .map((row) => {
      const match = row.email.match(new RegExp(`${role}(\\d+)@fieldforge\\.test`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  return numbers.length > 0 ? Math.max(...numbers) : 0;
}
