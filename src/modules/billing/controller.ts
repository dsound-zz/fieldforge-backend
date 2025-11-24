import { NextFunction, Request, Response } from "express";
import { listInvoices, payInvoice } from "./service";

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await listInvoices();
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
};

export const pay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const { amount } = req.validated!.body;
    const result = await payInvoice(id, amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
