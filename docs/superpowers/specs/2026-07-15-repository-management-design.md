# Repository Management Feature Set

## Goal

Complete the current Oracle Forms repository workflow by adding working management screens for projects and modules, file version history, and searchable audit logs.

## Scope

### Projects and modules

- Replace the existing placeholder pages with data tables and create/edit dialogs.
- Projects contain a name and optional description.
- Modules contain a project, name, and optional description.
- Admins can create, edit, and delete projects and modules.
- Developers can create and edit projects and modules, but cannot delete them.
- Existing backend routes remain the source of truth and keep enforcing roles.

### Repository version history and filters

- The Repository page exposes functional filters for module, file extension, and status in addition to its existing name search.
- Each file row opens a version-history dialog.
- The dialog lists version number, upload time, uploader, size, and version remark.
- Every version can be downloaded through the existing authenticated download route.

### Audit logs

- Add an authenticated Admin-only endpoint to list audit logs.
- The endpoint supports a text/action filter and an optional date range, returning a bounded page of rows plus total count.
- Add an Admin-only Audit Logs page with filters and pagination.
- Record audit entries for create, update, and delete user actions, matching the existing project/module/file audit convention.

## Data and API Design

No database schema changes are required. The existing `projects`, `modules`, `file_versions`, `audit_logs`, and `users` tables supply the required data.

- `GET /api/audit-logs` will be added with `search`, `action`, `from`, `to`, `page`, and `limit` query parameters.
- The response contains `{ data, total, page, limit }`.
- Project, module, version, and download operations use the existing routes.

## Frontend Design

- React Query owns server data, invalidates the relevant collection after mutations, and presents loading/empty/error states.
- Reusable modal and table patterns will keep each page focused while avoiding a new component library.
- Navigation visibility stays role-aware, and the API remains the authorization boundary.

## Error Handling and Verification

- Forms validate required fields before sending requests and display returned API errors.
- Destructive actions require confirmation in the UI.
- Backend build and frontend type/build checks will be run; API behavior will be checked against the existing Supabase configuration where available.
