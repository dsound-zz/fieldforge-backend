import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PG_HOST: z.string(),
  PG_PORT: z.string(),
  PG_USER: z.string(),
  PG_PASSWORD: z.string(),
  PG_DATABASE: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const config = {
  PORT: parseInt(parsed.data.PORT, 10),
  NODE_ENV: parsed.data.NODE_ENV,
  PG_HOST: parsed.data.PG_HOST,
  PG_PORT: parseInt(parsed.data.PG_PORT, 10),
  PG_USER: parsed.data.PG_USER,
  PG_PASSWORD: parsed.data.PG_PASSWORD,
  PG_DATABASE: parsed.data.PG_DATABASE,
  DATABASE_URL: parsed.data.DATABASE_URL,
  JWT_SECRET: parsed.data.JWT_SECRET
};
