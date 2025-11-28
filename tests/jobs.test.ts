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

import { assignTechnician, completeJob } from "../src/modules/jobs/service";
import { AppError } from "../src/utils/errors";
import { Job } from "../src/modules/jobs/types";

describe("jobs service module", () => {
   beforeEach(() => {
      mockQuery.mockReset()
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

   it("checks completion logic on completeJob function", async () => {
      // 1. SELECT job lookup — MUST NOT be completed
      mockQuery.mockResolvedValueOnce({
         rows: [{ id: 10, status: "scheduled" }],
         rowCount: 1
      });

      // 2. BEGIN
      mockQuery.mockResolvedValueOnce({}); // BEGIN returns nothing meaningful

      // 3. UPDATE job → completed
      mockQuery.mockResolvedValueOnce({
         rows: [{ id: 10, status: "completed" }],
         rowCount: 1
      });

      // 4. INSERT invoice
      mockQuery.mockResolvedValueOnce({
         rows: [{ id: 123, job_id: 10, amount: 0 }],
         rowCount: 1
      });

      // 5. UPDATE job → invoiced
      mockQuery.mockResolvedValueOnce({
         rows: [{ id: 10, status: "invoiced" }],
         rowCount: 1
      });

      // 6. INSERT log
      mockQuery.mockResolvedValueOnce({
         rowCount: 1,
         rows: []
      });

      // 7. COMMIT
      mockQuery.mockResolvedValueOnce({});

      const result = await completeJob(10);

      expect(result.status).toBe("completed");
      expect(mockQuery).toHaveBeenCalledTimes(7);
   });

})
