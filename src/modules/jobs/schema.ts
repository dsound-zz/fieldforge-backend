import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    customer_id: z.number(),
    description: z.string().min(1)
  })
});

export const jobIdParamSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) })
});

export const assignSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) }),
  body: z.object({
    technician_id: z.number(),
    scheduled_start: z.string(),
    scheduled_end: z.string()
  })
});

export const jobsParamSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  })
})





