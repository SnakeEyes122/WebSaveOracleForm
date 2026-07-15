# User Management Design

## Goal

Provide an Admin-only web page for managing user accounts through the existing protected user API.

## Scope

- Show username, full name, role, active status, and creation date.
- Create users with username, password, full name, and role.
- Edit full name, role, active status, and optionally replace password.
- Confirm before deleting a user.
- Fetch selectable roles from `GET /api/users/roles`.
- Use React Query and refresh the user list after every successful mutation.

## Constraints

- Only the existing Admin navigation route exposes this page.
- Backend authorization at `/api/users` remains the enforcement boundary.
- No database schema or API contract changes are required.
