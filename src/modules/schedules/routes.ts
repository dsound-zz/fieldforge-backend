import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { create, list } from "./controller";
import { createScheduleSchema } from "./schema";

const router = Router();

router.get("/schedules", authenticate, list);
router.post("/schedules", authenticate, validate(createScheduleSchema), create);

export default router;
