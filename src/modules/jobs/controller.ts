import { NextFunction, Request, Response } from "express";
import { assignTechnician, completeJob, createJob, getJobById, listJobs, startJob } from "./service";
import { AppError } from "../../utils/errors";

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

    const { page, limit } = req.validated!.query
    const user = req.user

    const offset = (page - 1) * limit;

    const results = await listJobs({ limit, offset }, user)

    res.status(200).json({ page, limit, jobs: results.jobs, totalJobs: results.total });
  } catch (err) {
    console.error("Error in list function:", err);
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
    const requestedJob = await getJobById(id)
    const jobStatus = requestedJob.status
    if (jobStatus === 'completed' || jobStatus === 'invoiced') throw new AppError("Job is already completed or invoiced", 400)
    const { technician_id, scheduled_start, scheduled_end } = req.validated!.body;
    const assignment = await assignTechnician(requestedJob, technician_id, scheduled_start, scheduled_end);
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
