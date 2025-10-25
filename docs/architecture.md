# Architecture Overview

This document outlines the main modules and data flow of the BestNote project.

## Modules
- Directives: template-level permission enforcement (`src/directives/*`)
- Services: business logic, API wrappers and permission utilities (`src/services/*`)
- Stores: Pinia stores that hold user and application state (`src/store/*`)
- Components: UI components (`src/components/*`)

## Data flow
- Frontend components read state from Pinia stores.
- Directives and components call `PermissionService` helpers to determine allowed actions.
- Server API (server/) serves calendar and file upload endpoints; frontend calls via fetch/axios.

## PermissionService
- Central source of truth for role checks and permission rules.
- Exposes `canAccessPiece`, `canUploadPiece`, `canAccessCalendar` and `can(permission, roles)`.

## Importer → persistence → UI dataflow

- The importer (`scripts/import_jverein.js`) parses CSV/XML input and validates records using the JSON Schema in `schemas/member.schema.json`.
- Valid members are written to `server/data/imported_members.json` (or the configured out file). The importer also writes `server/data/import_report.json` and `import_report.md` describing skipped/invalid records.
- A migration script (`scripts/migrate_imported_members.js`) merges `imported_members.json` into the persistent `server/data/db.json` and produces a `migration_report.json` listing added and skipped entries.
- The frontend reads `server/data/db.json` (via the mock server or a small static server during local development) and hydrates the Pinia store (e.g., `useLibraryStore` or a dedicated `members` store).
- Components such as `MainDashboard.vue` and `ShowcaseDashboard.vue` consume the store data and call `PermissionService.can()` to determine which UI actions (edit, delete, upload) should be shown.

### PermissionService role responsibilities

- The `Role` enum defines application roles such as `Mitglied`, `Dirigent`, `Notenwart`, `Vorstand`, `Kassierer`, `Admin`.
- Role checks are intentionally centralized in `src/services/PermissionService.ts` so tests and UI directives rely on a single, testable implementation.
- Example rule: `canUploadPiece(user)` returns true for `Notenwart` and `Admin`, false otherwise. The UI directive `v-can-upload` uses this function to hide/show upload controls.

### Example: how the dashboard uses the data and permissions

1. On app start the frontend (or mock server) serves `server/data/db.json`.
2. A component `MainDashboard.vue` loads members into a Pinia store (e.g., `members` store).
3. The component loops members and renders permitted actions. For each member the component calls `PermissionService.can('edit-member', currentUser.roles)` (or a specific helper) to decide whether to show an Edit button.
4. `ShowcaseDashboard.vue` demonstrates the same pattern and is a good reference implementation.

These pieces together make the importer→persistence→UI flow explicit and testable.

## Testing
- Unit tests: `tests/` using Vitest and @vue/test-utils
- E2E samples: `tests/e2e/` with basic end-to-end scenarios and mocked services
