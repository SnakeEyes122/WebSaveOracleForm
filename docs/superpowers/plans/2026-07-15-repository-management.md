# Repository Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver project/module management, repository version browsing and filtering, and an Admin audit-log console.

**Architecture:** Supabase remains the persistence layer. Express gains one Admin-only audit endpoint; React Query owns page data, and a shared modal component is used for forms and version history.

**Tech Stack:** Express 5, TypeScript, Supabase JS, React 19, React Router, TanStack React Query, Tailwind CSS.

## Global Constraints

- No database schema changes.
- Existing API authorization is the source of truth.
- Admin may create, edit, delete projects/modules; Developer may create/edit only.
- Audit-log reads are Admin-only; repository filters use existing API parameters.

---

### Task 1: Audit API and user audit records

**Files:**
- Create: `backend/src/controllers/auditLogController.ts`
- Create: `backend/src/routes/auditLogRoutes.ts`
- Modify: `backend/src/app.ts`, `backend/src/controllers/userController.ts`

**Interfaces:** Produces `GET /api/audit-logs?search=&action=&from=&to=&page=1&limit=20` with `{ data, total, page, limit }`.

- [ ] Add `parseAuditFilters(query)` that trims strings, defaults `page` to 1 and `limit` to 20, caps limit at 100.
- [ ] Implement `getAuditLogs`: select `audit_logs` joined to `users(full_name, username)`, sort descending by `created_at`, apply exact action, date `gte/lte`, optional `action/entity_type` ilike search, exact count, and range `(page - 1) * limit` through `page * limit - 1`.
- [ ] Add an authenticated Admin-only router with `router.get('/', getAuditLogs)` and mount it at `/api/audit-logs`.
- [ ] After successful `createUser`, `updateUser`, and `deleteUser`, call `createAuditLog` with actions `Create User`, `Update User`, or `Delete User`, entity type `User`, target ID, and requester IP.
- [ ] Run `npm.cmd run build --prefix backend`; commit with `feat: add audit log API`.

### Task 2: Modal, Projects, and Modules pages

**Files:**
- Create: `frontend/src/components/Modal.tsx`, `frontend/src/pages/Projects.tsx`, `frontend/src/pages/Modules.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:** Uses existing `/projects` and `/modules`; produces working `/projects` and `/modules` routes.

- [ ] Implement `Modal({ title, open, onClose, children })`; closed state returns null, open state has a backdrop plus `role="dialog" aria-modal="true"` panel and close control.
- [ ] Implement Projects: React Query key `['projects']`; table of name/description/actions; create and edit dialog with required name; POST or PUT as appropriate; confirmation before DELETE; invalidate `['projects']` and `['modules']` on success; render delete only for Admin.
- [ ] Implement Modules: query `['modules']` and `['projects']`; form requires `project_id` and name; POST/PUT payload is `{ project_id, name, description }`; Admin-only confirmed deletion; invalidate `['modules']` after mutation.
- [ ] Replace the Projects and Modules placeholder components in `App.tsx` with imports and existing route elements.
- [ ] Run `npm.cmd run build --prefix frontend`; if Vite reports sandbox `spawn EPERM` after TypeScript succeeds, record it separately. Commit `feat: add project and module management`.

### Task 3: Repository filters and version history

**Files:**
- Create: `frontend/src/pages/VersionHistoryModal.tsx`
- Modify: `frontend/src/pages/Repository.tsx`

**Interfaces:** Uses `GET /files`, `GET /files/:id/versions`, `GET /files/download/:versionId`.

- [ ] In Repository, add `moduleId`, `extension`, `status`, `filtersOpen`, and `historyFile` state. File query key is `['files', searchTerm, moduleId, extension, status]`; API params omit blank filters.
- [ ] Toggle the existing Filter button to expose Module, Extension (`.fmb`, `.fmx`, `.rdf`), and Status (`Active`, `Archived`) selects plus a Clear control.
- [ ] Implement VersionHistoryModal with enabled-only-when-open query key `['file-versions', fileId]`; display version, uploader, upload time, size, remark, and a per-version download action.
- [ ] Download as a blob, trigger temporary anchor click, and revoke its object URL. History button stores the selected file and opens the dialog.
- [ ] Run frontend build/type check and commit `feat: add repository filters and version history`.

### Task 4: Audit Logs page

**Files:**
- Create: `frontend/src/pages/AuditLogs.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:** Consumes `{ data, total, page, limit }` from `/audit-logs`; produces `/audit-logs`.

- [ ] Define row fields for action, entity type, details, timestamp, and joined user. Query with key `['audit-logs', search, action, from, to, page]` and `{ limit: 20 }`.
- [ ] Render text search, action select, date range, table, empty/loading/error states, and Previous/Next controls. Reset to page 1 whenever a filter changes. Use `Math.max(1, Math.ceil(total / limit))` for final-page logic.
- [ ] Replace the Audit Logs placeholder in `App.tsx`; retain the existing role-aware Sidebar navigation.
- [ ] Run backend and frontend builds; commit `feat: add audit log console`.

### Task 5: Verification

**Files:** No source change expected.

- [ ] Run `git diff --check`, `npm.cmd run build --prefix backend`, and `npm.cmd run build --prefix frontend`.
- [ ] With configured Supabase, validate Admin create/edit/delete for projects/modules; Developer create/edit with deletion refused; Viewer lacks management links; version history downloads selected versions; audit filters and page controls return correct rows.
- [ ] Inspect `git status --short` and commit only any focused verification correction.
