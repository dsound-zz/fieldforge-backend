import { z } from "zod";

export const invoiceIdParamSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) })
});

export const createPaymentSchema = z.object({
  params: z.object({ id: z.string().transform((v) => parseInt(v, 10)) }),
  body: z.object({ amount: z.number().positive() })
});
