import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { assign, complete, create, getById, list, start } from "./controller";
import { assignSchema, createJobSchema, jobIdParamSchema, jobsParamSchema } from "./schema";

const router = Router();

router.post("/jobs", authenticate, requireRole(["admin", "dispatcher"]), validate(createJobSchema), create);
router.get("/jobs", authenticate, validate(jobsParamSchema), list);
router.get("/jobs/:id", authenticate, validate(jobIdParamSchema), getById);
router.post(
  "/jobs/:id/assign",
  authenticate,
  requireRole(["admin", "dispatcher"]),
  validate(assignSchema),
  assign
);
router.post("/jobs/:id/start", authenticate, validate(jobIdParamSchema), start);
router.post("/jobs/:id/complete", authenticate, validate(jobIdParamSchema), complete);

export default router;
