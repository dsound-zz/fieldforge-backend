import { createUser, getMaxUserNumber } from "../modules/users/service";
import { pool } from "../config/db";
import { logger } from "../config/logger";

const seedType = process.argv[2];

async function seed() {
   if (seedType === 'users') {
      try {
         // Get the highest existing numbers
         const maxTechnicianNum = await getMaxUserNumber("technician");
         const maxDispatcherNum = await getMaxUserNumber("dispatcher");

         logger.info({ maxDispatcherNum, maxTechnicianNum }, "Starting from existing user counts")
         // Create 5 technicians
         for (let i = maxTechnicianNum + 1; i <= maxTechnicianNum; i++) {
            try {
               await createUser(
                  `technician${i}@fieldforge.test`,
                  "password123",
                  "technician"
               );
               logger.info({ email: `technician${i}@fieldforge.test` }, "Created technician");
            } catch (err: any) {
               if (err.code === 23505 || err.statusCode === 409) {
                  logger.debug({ email: `technician${i}@fieldforge.test` }, "User already exists, skipping");
                  continue;
               }
               throw err;
            }
         }

         // Create 3 dispatchers
         for (let i = maxDispatcherNum + 1; i <= maxDispatcherNum; i++) {
            try {
               await createUser(
                  `dispatcher${i}@fieldforge.test`,
                  "password123",
                  "dispatcher"
               );
               logger.info({ email: `dispatcher${i}@fieldforge.test` }, "Created dispatcher");
            } catch (err: any) {
               if (err.code === 23505 || err.statusCode === 409) {
                  logger.debug({ email: `dispatcher${i}@fieldforge.test` }, "User already exists, skipping");
                  continue;
               }
               throw err;
            }
         }

         logger.info("Seeding completed successfully");
      } catch (err) {
         logger.error({ err }, "Seeding failed");
         throw err;
      } finally {
         await pool.end();
      }
   }
}


seed().catch((err) => {
   logger.error({ err }, "Seed script failed");
   process.exit(1);
});