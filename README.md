# FieldForge Backend Simulator

FieldForge is a fictional field-service operations company. The platform helps dispatchers book work, assign technicians, keep everyone’s calendar in sync, and issue invoices once a job is done. This repository contains a small Express + PostgreSQL API that simulates that workflow end to end.

## What the company does
- Coordinates home/commercial service visits (repairs, installs, maintenance).
- Gives dispatchers tools to book jobs for customers and slot them onto technician schedules.
- Tracks technician availability, assignments, and job progress in one place.
- Generates invoices automatically when work is completed and records payments.
- Provides basic authentication and role-based access so admins/dispatchers control the system while technicians see only their work.

## What the API covers
- **Auth & Users** (`/auth/register`, `/auth/login`, `/users`): JWT-based login/registration for admins, dispatchers, and technicians.
- **Customers** (`/customers`): CRUD-lite for customer profiles (name, email, phone, address).
- **Technicians** (`/technicians`): Create/list/update technicians, including skill level, hourly rate, and active status.
- **Jobs** (`/jobs`): Create jobs for customers, assign technicians with scheduled windows, start/complete jobs, and view by role (technicians only see their own).
- **Schedules** (`/schedules`): Store availability/blocks and optional links to jobs for calendar-style views.
- **Billing** (`/invoices`, `/invoices/:id/pay`): Auto-create invoices when jobs are marked completed, and record payments that move invoices to `paid`.
- **Observability**: Writes log rows for major events (job creation, invoice creation, payments).

## Data model highlights
- PostgreSQL schema with tables for users, technicians, customers, jobs, job_assignments, schedules, invoices, payments, and logs.
- Enforces job status lifecycle (`pending → scheduled → in_progress → completed → invoiced`).
- Prevents overlapping technician assignments via a `gist` exclusion constraint.
- Views (`technician_upcoming_jobs`, `job_financials`) provide quick operational snapshots.

## Typical flow
1) Admin/dispatcher registers/logs in → gets JWT.
2) Create customer → create job for that customer.
3) Assign technician with a scheduled start/end window (respects overlap rules).
4) Technician starts and completes the job.
5) API auto-creates an invoice; dispatcher records a payment to mark it paid.

This API is meant for simulation/demo purposes but mirrors the core shapes of a real field-service backend.
