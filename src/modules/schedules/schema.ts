import { z } from "zod";

export const createScheduleSchema = z.object({
  body: z.object({
    technician_id: z.number(),
    start_time: z.string(),
    end_time: z.string(),
    job_id: z.number().optional().nullable()
  })
});
