import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { create, list, update } from "./controller";
import { createTechnicianSchema, listTechniciansSchema, updateTechnicianSchema } from "./schema";

const router = Router();

router.get("/technicians", authenticate, validate(listTechniciansSchema), list);
router.post("/technicians", authenticate, requireRole(["admin", "dispatcher"]), validate(createTechnicianSchema), create);
router.patch(
  "/technicians/:id",
  authenticate,
  requireRole(["admin", "dispatcher"]),
  validate(updateTechnicianSchema),
  update
);

export default router;
