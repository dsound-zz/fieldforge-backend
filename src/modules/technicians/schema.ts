import { z } from "zod";

export const createTechnicianSchema = z.object({
  body: z.object({
    user_id: z.number(),
    skill_level: z.string().optional(),
    hourly_rate: z.number().optional(),
    active: z.boolean().optional()
  })
});

export const updateTechnicianSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) }),
  body: z.object({
    skill_level: z.enum(["junior", "field", "master"]).optional(),
    hourly_rate: z.number().optional(),
    active: z.boolean().optional()
  })
});

export const listTechniciansSchema = z.object({
  query: z.object({
    active: z.coerce.boolean().optional(),
    skill_level: z.enum(["junior", "field", "master"]).optional(),
  })
})

const weeklyHoursQueryInnerSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start must be YYYY-MM-DD")
    .optional()
});

export const weeklyHoursQuerySchema = z.object({
  query: weeklyHoursQueryInnerSchema
});

export type WeeklyHoursQuery = z.infer<typeof weeklyHoursQueryInnerSchema>;