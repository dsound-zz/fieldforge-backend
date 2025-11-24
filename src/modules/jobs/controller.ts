import { NextFunction, Request, Response } from "express";
import { assignTechnician, completeJob, createJob, getJobById, getPagination, listJobs, startJob } from "./service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id, description } = req.validated!.body;
    const job = await createJob(customer_id, description);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const offset = (page - 1) * limit;

    const jobs = await listJobs(user);

    const results = await getPagination({ limit, offset })

    res.json({ page, limit, jobs });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const user = req.user;
    const job = await getJobById(id, user);
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

export const assign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const { technician_id, scheduled_start, scheduled_end } = req.validated!.body;
    const assignment = await assignTechnician(id, technician_id, scheduled_start, scheduled_end);
    res.status(201).json({ assignment });
  } catch (err) {
    next(err);
  }
};

export const start = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const job = await startJob(id);
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

export const complete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const job = await completeJob(id);
    res.json({ job });
  } catch (err) {
    next(err);
  }
};
