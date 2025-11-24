export interface Invoice {
  id: number;
  job_id: number;
  amount: number;
  status: "unpaid" | "paid";
  created_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  paid_at: string;
}
