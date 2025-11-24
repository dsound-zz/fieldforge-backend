export type JobStatus = "pending" | "scheduled" | "in_progress" | "completed" | "invoiced";

export interface Job {
  id: number;
  customer_id: number;
  status: JobStatus;
  description: string;
  created_at: string;
  updated_at: string;
}
