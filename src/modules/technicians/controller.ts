import { NextFunction, Request, Response } from "express";
import { createTechnician, getWeeklyHoursReport, listTechnicians, updateTechnician } from "./service";
import { WeeklyHoursQuery } from "./schema";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const { active, skill_level } = req.validated!.query ?? {}

  try {
    const technicians = await listTechnicians({ isActive: active, skillLevel: skill_level });
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

export const weeklyHoursReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start } = req.validated!.query as WeeklyHoursQuery;

    // 1. Determine start date (anchor)
    const startDate = start ? new Date(start) : new Date();

    // Strip time to midnight to keep things clean
    startDate.setHours(0, 0, 0, 0);

    // 2. End = start + 7 days
    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + 7);

    // 3. Call service
    const result = await getWeeklyHoursReport({ start: startDate, end: endDate });


    // 4. Return JSON
    return res.json({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      technicians: result
    });
  } catch (err) {
    next(err);
  }
};
