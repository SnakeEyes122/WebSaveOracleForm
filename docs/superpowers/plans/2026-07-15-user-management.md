# User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Admin-only user-management screen backed by the existing user API.

**Architecture:** A single React page uses React Query to read users and roles, and uses modal forms for create/edit mutations. The existing backend API remains unchanged and enforces Admin access.

**Tech Stack:** React, TypeScript, TanStack React Query, Axios, Tailwind CSS.

## Global Constraints

- No database schema or API contract changes.
- `/api/users` remains the authorization boundary.

---

### Task 1: Build the User Management page

**Files:**
- Create: `frontend/src/pages/Users.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:** Consumes `GET/POST/PUT/DELETE /api/users` and `GET /api/users/roles`.

- [ ] Query users with key `['users']` and roles with key `['roles']`.
- [ ] Render username, full name, role, active status, and creation date.
- [ ] Add a modal create form requiring username, password, full name, and role ID; submit `POST /users`.
- [ ] Add an edit modal with full name, role ID, active status, and optional password; submit `PUT /users/:id`.
- [ ] Confirm deletion and call `DELETE /users/:id`; invalidate `['users']` after every successful mutation.
- [ ] Replace the Users placeholder in `frontend/src/App.tsx` and run `npm.cmd run build --prefix frontend`.
- [ ] Commit with `feat: add user management page`.
