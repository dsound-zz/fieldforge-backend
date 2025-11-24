export type UserRole = "admin" | "technician" | "dispatcher";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}
