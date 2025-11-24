import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "technician", "dispatcher"]).default("technician")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().transform((val) => parseInt(val, 10)) })
});
