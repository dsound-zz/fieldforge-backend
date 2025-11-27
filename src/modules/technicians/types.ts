export interface Technician {
  id: number;
  user_id: number;
  skill_level?: string;
  hourly_rate?: number;
  active: boolean;
  created_at: string;
}

