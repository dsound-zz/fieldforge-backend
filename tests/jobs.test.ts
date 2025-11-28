import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockQuery } = vi.hoisted(() => {
   return {
      mockQuery: vi.fn().mockResolvedValue({ rows: [] })
   };
});

vi.mock("../src/config/db", () => ({
   pool: {
      query: mockQuery
   }
}));

import { assignTechnician } from "../src/modules/jobs/service";
import { AppError } from "../src/utils/errors";
import { Job } from "../src/modules/jobs/types";

describe("jobs service module", () => {
   beforeEach(() => {
      mockQuery.mockClear()
   })

   it("throws error if job is completed or invoiced", async () => {
      mockQuery
         .mockResolvedValueOnce({ rowCount: 1, rows: [{ active: true }] })             // technician lookup
         .mockResolvedValueOnce({ rows: [{ status: "completed" }] });                  // job lookup

      const completedJob: Job = {
         id: 4,
         customer_id: 1,
         status: "completed",
         description: "Test job",
         created_at: "2026-01-01T00:00:00Z",
         updated_at: "2026-01-01T00:00:00Z"
      };

      await expect(assignTechnician(completedJob, 5, "2026-01-04 03:00:00-05", "2026-01-04 07:00:00-05"))
         .rejects.toThrow(AppError);
   });
})