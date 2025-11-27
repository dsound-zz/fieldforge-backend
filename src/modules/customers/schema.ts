import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

export const updateCustomerSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) }),
  body: z
    .object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional()
    })
    .refine((data) => Object.keys(data).length > 0, { message: "At least one field required" })
});

export const customerIdParamSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) })
});

export const softCustomerDeleteSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) })
})
