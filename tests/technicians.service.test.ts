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

import { listTechnicians } from "../src/modules/technicians/service";

describe("technicians service module", () => {
   beforeEach(() => {
      mockQuery.mockClear();
   });

   it("returns all technicians when no filters are provided", async () => {
      await listTechnicians({});
      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("SELECT * FROM technicians"),
         []
      );
   });

   it("filters by active when provided", async () => {
      await listTechnicians({ isActive: true });
      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("WHERE active = $1"),
         [true]
      );
   });

   it("filters by skill level when provided", async () => {
      await listTechnicians({ skillLevel: "field" });
      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("WHERE skill_level = $1"),
         ["field"]
      );
   });

   it("applies both active and skill level filters", async () => {
      await listTechnicians({ isActive: false, skillLevel: "junior" });
      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("WHERE active = $1 AND skill_level = $2"),
         [false, "junior"]
      );
   });
});
