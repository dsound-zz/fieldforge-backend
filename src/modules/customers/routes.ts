import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { create, getById, update, softDelete } from "./controller";
import { createCustomerSchema, customerIdParamSchema, softCustomerDeleteSchema, updateCustomerSchema } from "./schema";

const router = Router();

router.post("/customers", authenticate, validate(createCustomerSchema), create);
router.get("/customers/:id", authenticate, validate(customerIdParamSchema), getById);
router.patch("/customers/:id", authenticate, validate(updateCustomerSchema), update);
router.delete("/customers/:id", authenticate, validate(softCustomerDeleteSchema), softDelete)

export default router;
