# FieldForge Backend Simulator — Junior Dev Task Pool

~~1. Add pagination parameters to `GET /jobs` (page, limit) with validation and default sorting by `created_at`.~~
~~2. Implement filtering for `GET /technicians?active=true` and `skill_level`.~~
3. Add soft delete support for customers (e.g., `deleted_at` column) and hide deleted records from queries.
4. Prevent assigning technicians to completed or invoiced jobs at the API validation layer.
5. Add rate limiting middleware using `express-rate-limit` with sensible defaults.
6. Create a `/health` route that checks database connectivity using a lightweight query.
7. Add unit tests for job completion logic, including invoice creation and status transitions.
8. Implement a weekly-hours report endpoint for technicians summarizing scheduled hours.
9. Add ability to upload customer documents with mocked storage and metadata table.
10. Add per-user API keys with creation, revocation, and middleware authentication support.
11. Implement refresh tokens for authentication to reduce JWT exposure.
12. Add `PATCH /jobs/:id` to allow status transitions with validation rules.
13. Implement optimistic locking on job updates using a `version` column.
14. Add audit logging middleware that records user id, route, and payload into the `logs` table.
15. Build a background job mock that recalculates technician utilization nightly and stores results.
16. Add search on customers by name/email with indexed queries.
17. Provide CSV export of invoices with streaming response.
18. Add notification hooks when jobs change status (mocked via logs table entries).
19. Create onboarding script to seed demo data for technicians, customers, jobs, and assignments.
20. Add Swagger/OpenAPI docs for all endpoints using `swagger-ui-express`.
