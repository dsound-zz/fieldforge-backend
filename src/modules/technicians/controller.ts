import { NextFunction, Request, Response } from "express";
import { createTechnician, listTechnicians, updateTechnician } from "./service";

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const technicians = await listTechnicians();
    res.json({ technicians });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req.validated!;
    const technician = await createTechnician(body);
    res.status(201).json({ technician });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const { body } = req.validated!;
    const technician = await updateTechnician(id, body);
    res.json({ technician });
  } catch (err) {
    next(err);
  }
};
