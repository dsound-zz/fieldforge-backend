import pino from "pino";
import { config } from "./env";

const level = config.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  level,
  transport: config.NODE_ENV === "production" ? undefined : { target: "pino-pretty" }
});
