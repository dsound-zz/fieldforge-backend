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

import { softDeleteCustomer } from "../src/modules/customers/service";

describe("customers service module", () => {
   beforeEach(() => {
      mockQuery.mockClear()
   })

   it("updates timestamp on customer when soft delete", async () => {
      const mockCustomer = {
         id: 5,
         name: "Test Customer",
         email: "test@example.com",
         phone: "123-456-7890",
         address: "123 Test St",
         deleted_at: "2025-01-01T12:00:00Z",
         created_at: "2025-01-01T10:00:00Z"
      };

      mockQuery.mockResolvedValueOnce({
         rowCount: 1,
         rows: [mockCustomer]
      });

      // Act
      const result = await softDeleteCustomer(5);

      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("UPDATE customers SET deleted_at"),
         [5]
      );
      expect(result).toEqual(mockCustomer);

   })

   it("returns an error if customer does not exist on soft delete", async () => {
      mockQuery.mockResolvedValueOnce({
         rowCount: 0,
         rows: []
      })

      // Act & Assert
      await expect(softDeleteCustomer(1)).rejects.toThrow("Customer with id 1 not found");

      expect(mockQuery).toHaveBeenCalledWith(
         expect.stringContaining("UPDATE customers SET deleted_at"),
         [1]
      );
   })
})