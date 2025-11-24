export interface Schedule {
  id: number;
  technician_id: number;
  start_time: string;
  end_time: string;
  job_id?: number | null;
  created_at: string;
}
