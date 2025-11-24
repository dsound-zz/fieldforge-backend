import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema, userIdParamSchema } from "./schema";
import { getUser, getUsers, login, register } from "./controller";

const router = Router();

router.post("/auth/register", validate(registerSchema), register);
router.post("/auth/login", validate(loginSchema), login);

router.get("/users", authenticate, requireRole(["admin", "dispatcher"]), getUsers);
router.get("/users/:id", authenticate, requireRole(["admin", "dispatcher"]), validate(userIdParamSchema), getUser);

export default router;
