import { NextFunction, Request, Response } from "express";
import { createCustomer, getCustomerById, softDeleteCustomer, updateCustomer } from "./service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req.validated!;
    const customer = await createCustomer(body);
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const customer = await getCustomerById(id);
    res.json({ customer });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const { body } = req.validated!;
    const customer = await updateCustomer(id, body);
    res.json({ customer });
  } catch (err) {
    next(err);
  }
};

export const softDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params
    const customer = await softDeleteCustomer(id)
    res.json({ customer })
  } catch (err) {
    next(err)
  }
}
