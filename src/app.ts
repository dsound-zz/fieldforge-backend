import express from "express";
import usersRoutes from "./modules/users/routes";
import customerRoutes from "./modules/customers/routes";
import technicianRoutes from "./modules/technicians/routes";
import jobRoutes from "./modules/jobs/routes";
import scheduleRoutes from "./modules/schedules/routes";
import billingRoutes from "./modules/billing/routes";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { pool } from "./config/db";

const app = express();

app.use(express.json());
app.use(apiRateLimiter)
app.use(requestLogger);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      status: "ok",
      db: "connected"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    return res.status(503).json({
      status: "error",
      db: "disconnected",
      message
    });
  }
});

app.use(usersRoutes);
app.use(customerRoutes);
app.use(technicianRoutes);
app.use(jobRoutes);
app.use(scheduleRoutes);
app.use(billingRoutes);

app.use(errorHandler);

export default app;
