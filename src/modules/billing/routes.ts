import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { list, pay } from "./controller";
import { createPaymentSchema } from "./schema";

const router = Router();

router.get("/invoices", authenticate, requireRole(["admin", "dispatcher"]), list);
router.post("/invoices/:id/pay", authenticate, requireRole(["admin", "dispatcher"]), validate(createPaymentSchema), pay);

export default router;
