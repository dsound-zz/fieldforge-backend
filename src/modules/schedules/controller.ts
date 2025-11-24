import { NextFunction, Request, Response } from "express";
import { createSchedule, listSchedules } from "./service";

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schedules = await listSchedules();
    res.json({ schedules });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req.validated!;
    const schedule = await createSchedule(body);
    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
};
