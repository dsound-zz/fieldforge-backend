import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { create, getById, update } from "./controller";
import { createCustomerSchema, customerIdParamSchema, updateCustomerSchema } from "./schema";

const router = Router();

router.post("/customers", authenticate, validate(createCustomerSchema), create);
router.get("/customers/:id", authenticate, validate(customerIdParamSchema), getById);
router.patch("/customers/:id", authenticate, validate(updateCustomerSchema), update);

export default router;
