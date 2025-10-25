# BestNote

**AI-assisted sheet-music and calendar management for music clubs**

## Table of contents
- [Project overview](#project-overview)
- [Project goal](#project-goal)
- [Features](#features)
- [Role matrix](#role-matrix)
- [Test strategy for custom directives](#test-strategy-for-custom-directives)
- [AI provenance](#ai-provenance)
- [Quickstart](#quickstart)
- [License](#license)
- [Contributing](#contributing)

## Project overview

BestNote simplifies organizing music groups by providing role-based access to sheet music, calendars and uploads. It combines modern web technologies with AI-assisted development for maintainability and extensibility.

## 🎯 Project goal

Provide role-based access to sheet music, calendars and uploads to simplify music club administration.

## ✨ Features

- Role matrix with granular permissions (Member, Conductor, Board, Treasurer, Librarian, Admin)
- Access to sheet music by voice and role
- Calendar integration (CalDAV-compatible)
- Upload logic via `v-can-upload` directive
- Reactive permission checks using Pinia
- Full test coverage with Vitest
- CI workflow with GitHub Actions
- Bilingual documentation (DE/EN)

## 🧩 Role matrix
| Role        | Sheet access               | Upload | Calendar | Admin |
|-------------|----------------------------|--------|----------|-------|
| Member      | Own voice                  | ❌     | ✅       | ❌    |
| Conductor   | All voices                 | ❌     | ✅       | ❌    |
| Librarian   | All voices                 | ✅     | ✅       | ❌    |
| Board       | All voices                 | ❌     | ✅       | ❌    |
| Treasurer   | Own voice (if musician)    | ❌     | ✅       | ❌    |
| Admin       | All                        | ✅     | ✅       | ✅    |

## Test strategy for custom directives

This project uses custom Vue directives such as `v-can-upload` that react to Pinia store data.

### Example: Testing `v-can-upload`

- Use `Vue Test Utils` + `Vitest` with `jsdom`
- Ensure the directive and the test share the same Pinia instance
- Change roles in tests with `userStore.$patch(...)`
- Use `nextTick()` and, if necessary, `setTimeout(0)` to allow reactive DOM updates to settle
- Check visibility via `el.style.display` ('' or 'none') rather than relying on `isVisible()`

### Test file: `tests/directives/canUpload.test.ts`

The tests cover:
- Visibility for allowed roles (e.g. Admin)
- Hidden state for disallowed roles (e.g. Treasurer without musician role)

## AI provenance

This project was developed with help from Microsoft Copilot. The AI assisted with:
- Modular architecture
- Permission logic prompt design
- Test strategy and CI setup
- Bilingual documentation

## Quickstart

### Requirements

- Node.js (LTS recommended)
- npm
- A `.env` file in the `/server` folder with Nextcloud credentials (if using Nextcloud integration)

### Install

Install dependencies for backend and frontend (if separate):

```bash
cd server
npm install

# then in the frontend root
cd ../
npm install
```

### Start (dev)

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
npm run dev
```

### Test script (examples)

Run the server test script (mock mode):

```bash
npx ts-node scripts/testList.ts --mock
```

### Developer docs (short)

#### Store shape (Pinia)

- `store/library.ts` (pieces array) — interface Example included in repository
- `store/user.ts` (current user + roles)

#### Permission matrix (example)

- `PermissionService.ts` exports permission helpers used across the app

#### Component map (important files)

- `src/views/LibraryView.vue` — role-aware library view
- `src/components/AddPieceModal.vue` — add new piece UI
- `src/components/LibraryItem.vue` — list item
- `src/lib/nextcloud/webdav.ts` — frontend helper that calls backend `/api/*`
- `src/directives/v-can.ts` — template directive for permissions

## 📄 License

GPLv3 – see [LICENSE](./LICENSE)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

<!-- End of English README -->
