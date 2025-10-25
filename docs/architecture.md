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

## Testing
- Unit tests: `tests/` using Vitest and @vue/test-utils
- E2E samples: `tests/e2e/` with basic end-to-end scenarios and mocked services
