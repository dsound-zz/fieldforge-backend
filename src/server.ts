import { config } from "./config/env";
import { logger } from "./config/logger";
import app from "./app";

const server = app.listen(config.PORT, () => {
  logger.info(`FieldForge backend simulator running on port ${config.PORT}`);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down");
  server.close();
});
