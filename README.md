# OpenMusikVerein

<!-- ======= DEUTSCHER TEIL ======= -->

## 🧩 Projektübersicht
# BestNote

**KI-gestütztes Noten- und Kalenderverwaltungssystem für Musikvereine**

## 🎯 Projektziel
BestNote vereinfacht die Organisation von Musikgruppen durch rollenbasierten Zugriff auf Noten, Kalender und Uploads. Es kombiniert moderne Webtechnologien mit KI-gestützter Entwicklung für maximale Wartbarkeit und Erweiterbarkeit.

## ✨ Features
- Rollenmatrix mit granularer Berechtigung (Mitglied, Dirigent, Vorstand, Kassierer, Notenwart, Admin)
- Zugriff auf Noten nach Stimme und Rolle
- Kalenderintegration (CalDAV-kompatibel)
- Upload-Logik mit `v-can-upload` Directive
- Reaktive Berechtigungsprüfung via Pinia
- Vollständige Testabdeckung mit Vitest
- CI-Workflow mit GitHub Actions
- Zweisprachige Dokumentation (DE/EN)

## 🧩 Rollenmatrix
| Rolle       | Notenzugriff               | Upload | Kalender | Admin |
|-------------|----------------------------|--------|----------|--------|
| Mitglied    | Eigene Stimme              | ❌     | ✅       | ❌     |
| Dirigent    | Alle Stimmen               | ❌     | ✅       | ❌     |
| Notenwart   | Alle Stimmen               | ✅     | ✅       | ❌     |
| Vorstand    | Alle Stimmen               | ❌     | ✅       | ❌     |
| Kassierer   | Eigene Stimme (wenn Musiker) | ❌   | ✅       | ❌     |
| Admin       | Alle                       | ✅     | ✅       | ✅     |

## 🧪 Teststrategie
Siehe Abschnitt [Teststrategie für Custom Directives](#teststrategie-für-custom-directives)

## 🤖 KI-Herkunft
Dieses Projekt wurde mit Unterstützung von Microsoft Copilot entwickelt. Die KI half bei:
- Modularer Architektur
- Prompt-Design für Berechtigungslogik
- Teststrategie und CI-Setup
- Zweisprachiger Dokumentation

## 📸 Screenshots (folgt)
Screenshots folgen sobald das Frontend fertig ist

## 📄 Lizenz
GPLv3 – siehe [LICENSE](./LICENSE)

## 🤝 Mitwirken
Siehe [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🧪 Teststrategie für Custom Directives
Dieses Projekt verwendet eigene Vue-Directives wie `v-can-upload`, die auf Pinia-Store-Daten reagieren.

### Beispiel: Test für `v-can-upload`
- Nutze `Vue Test Utils` + `Vitest` mit `jsdom`
- Stelle sicher, dass Directive und Test dieselbe Pinia-Instanz verwenden
- Ändere Rollen im Test mit `userStore.$patch(...)`
- Verwende `nextTick()` und ggf. `setTimeout(0)` für reaktive DOM-Updates
- Prüfe Sichtbarkeit über `el.style.display` statt `isVisible()`

### Testdatei: `tests/directives/canUpload.test.ts`
Die Tests prüfen:
- Sichtbarkeit bei erlaubten Rollen (z. B. Admin)
- Verstecken bei nicht erlaubten Rollen (z. B. Kassierer ohne Musikerrolle)

---

<!-- ======= ENGLISH PART ======= -->

# BestNote

**AI-assisted sheet-music and calendar management for music clubs**

## 🎯 Project goal
BestNote simplifies organizing music groups by providing role-based access to sheet music, calendars and uploads. It combines modern web technologies with AI-assisted development for maintainability and extensibility.

## ✨ Features
- Role matrix with granular permissions (Member, Conductor, Board, Treasurer, Librarian, Admin)
- Access to sheet music by voice and role
- Calendar integration (CalDAV-compatible)
- Upload logic via `v-can-upload` directive
# OpenMusikVerein / BestNote

This repository contains BestNote — an AI-assisted sheet-music and calendar management app for music clubs.

This project includes full documentation in German and English. Please choose a language:

- German documentation: [README.de.md](README.de.md)
- English documentation: [README.en.md](README.en.md)

If you'd like, I can also commit these changes and push them to the configured remote. Tell me if you want me to:

1. Create a git commit with the README split
2. Rename the local branch to `main` and push to `origin` (the remote is configured but not pushed yet)

<!-- End of landing README -->
## 🧪 Test strategy

See section [Test strategy for custom directives](#test-strategy-for-custom-directives)

## CLI: Importer & Migration scripts

This project includes small Node.js helper scripts in `scripts/` to import and migrate member data.

## 🚀 Deployment / Demo

We publish a demo build of the frontend. Two common options:

- GitHub Pages (simple static hosting): configured for this repo using `gh-pages`.
  - Build: `npm run build`
  - Deploy: `npm run deploy` (pushes `dist/` to `gh-pages` branch)
  - Vite base is set to `/BestNote/` so GitHub Pages serves assets correctly.

- Vercel / Netlify (recommended for automatic CI/CD): import the repo on vercel.com or netlify and point to the `main` branch. Vercel auto-detects Vite projects and serves the built `dist/` including the service worker.

Demo URL (once deployed): https://<your-user-or-org>.github.io/BestNote/

CI: A `deploy.yml` GitHub Actions workflow is provided to build and deploy on pushes to `main`.

````markdown
# OpenMusikVerein / BestNote

Diese Datei ist zweisprachig. | This file is bilingual.

🇩🇪 Deutsch | 🇬🇧 English below

---

## 🇩🇪 Deutsch

### 🧩 Projektübersicht
BestNote — KI-gestütztes Noten- und Kalenderverwaltungssystem für Musikvereine.

### 🎯 Projektziel
BestNote vereinfacht die Organisation von Musikgruppen durch rollenbasierten Zugriff auf Noten, Kalender und Uploads. Es kombiniert moderne Webtechnologien mit KI-gestützter Entwicklung für Wartbarkeit und Erweiterbarkeit.

### ✨ Features
- Rollenmatrix mit granularer Berechtigung (Mitglied, Dirigent, Vorstand, Kassierer, Notenwart, Admin)
- Zugriff auf Noten nach Stimme und Rolle
- Kalenderintegration (CalDAV-kompatibel)
- Upload-Logik mit `v-can-upload` Directive
- Reaktive Berechtigungsprüfung via Pinia
- Testabdeckung mit Vitest
- CI-Workflow mit GitHub Actions

### 🧩 Rollenmatrix
| Rolle       | Notenzugriff               | Upload | Kalender | Admin |
|-------------|----------------------------|--------|----------|--------|
| Mitglied    | Eigene Stimme              | ❌     | ✅       | ❌     |
| Dirigent    | Alle Stimmen               | ❌     | ✅       | ❌     |
| Notenwart   | Alle Stimmen               | ✅     | ✅       | ❌     |
| Vorstand    | Alle Stimmen               | ❌     | ✅       | ❌     |
| Kassierer   | Eigene Stimme (wenn Musiker) | ❌   | ✅       | ❌     |
| Admin       | Alle                       | ✅     | ✅       | ✅     |

### 🧪 Teststrategie
Siehe Abschnitt [Teststrategie für Custom Directives](#teststrategie-für-custom-directives)

### 🤖 KI-Herkunft
Das Projekt wurde mit Unterstützung von KI-gestützten Tools entwickelt (z. B. GitHub Copilot). Alle automatisch generierten Inhalte wurden geprüft.

### 📄 Lizenz
GPLv3 – siehe [LICENSE](./LICENSE)

### 🤝 Mitwirken
Siehe [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🇬🇧 English

### 🧩 Project overview
BestNote — AI-assisted sheet-music and calendar management for music clubs.

### 🎯 Project goal
BestNote simplifies organizing music groups by providing role-based access to sheet music, calendars, and uploads. It combines modern web technologies with AI-assisted development for maintainability and extensibility.

### ✨ Features
- Role matrix with granular permissions (Member, Conductor, Board, Treasurer, Librarian, Admin)
- Access to sheet music by voice and role
- Calendar integration (CalDAV-compatible)
- Upload logic via `v-can-upload` directive
- Reactive permission checks using Pinia
- Tests with Vitest
- CI workflow with GitHub Actions

### 🧩 Role matrix
| Role        | Sheet access               | Upload | Calendar | Admin |
|-------------|----------------------------|--------|----------|-------|
| Member      | Own voice                  | ❌     | ✅       | ❌    |
| Conductor   | All voices                 | ❌     | ✅       | ❌    |
| Librarian   | All voices                 | ✅     | ✅       | ❌    |
| Board       | All voices                 | ❌     | ✅       | ❌    |
| Treasurer   | Own voice (if musician)    | ❌     | ✅       | ❌    |
| Admin       | All                        | ✅     | ✅       | ✅    |

### 🧪 Test strategy
See section [Test strategy for custom directives](#test-strategy-for-custom-directives)

### 📄 License
GPLv3 – see [LICENSE](./LICENSE)

### 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🧪 Teststrategy for Custom Directives
This project uses Vue directives like `v-can-upload` that react to Pinia store data.

### Example: test for `v-can-upload`
- Use `Vue Test Utils` + `Vitest` with `jsdom`

---

## Update strategy (PWA / Service Worker)

This project ships a simple Service Worker to provide an App Shell caching strategy and a lightweight update flow.

- The Service Worker caches essential assets (index.html, favicon) on install and serves the cached App Shell during navigation.
- When a new deployment is published, the browser will download a new service worker; once installed it will dispatch an event so the app can notify users that an update is available.
- Users can opt to reload the page to activate the new version. The SW will skip waiting when commanded via the `SKIP_WAITING` message.

Developer notes:

- The SW file is located at `src/service-worker.js` and is registered from `src/main.ts`.
- Deployments should update the built assets and optionally bump the `CACHE_NAME` value to force a full cache refresh.
- CI/CD: Build and publish to your static host (GitHub Pages, Netlify, Vercel, S3 + CloudFront) on merges to `main`.

Suggested CI step (GitHub Actions): build and deploy on `push` to `main`; invalidate CDN cache if necessary.

- Ensure directive and test use the same Pinia instance
- Change roles in tests with `userStore.$patch(...)`
- Use `nextTick()` and, if necessary, `setTimeout(0)` for reactive DOM updates
- Check visibility via `el.style.display` instead of `isVisible()`

---

## CLI: Importer & Migration scripts

This project includes small Node.js helper scripts in `scripts/` to import and migrate member data.

### 1) Importer: `scripts/import_jverein.js`

- Purpose: Parse CSV or XML exports (jVerein) and validate using JSON Schema (`schemas/member.schema.json`).
- Usage:

```bash
# basic import from CSV to JSON
node scripts/import_jverein.js path/to/input.csv server/data/imported_members.json

# dry-run (validate only, no output members file)
node scripts/import_jverein.js path/to/input.csv server/data/imported_members.json --dry-run
```

- Outputs:
  - `server/data/import_report.json` and `import_report.md` with skipped/invalid records.
  - `server/data/imported_members.json` when run without `--dry-run`.

### 2) Migration: `scripts/migrate_imported_members.js`

- Purpose: Merge `server/data/imported_members.json` into the persistent `server/data/db.json`.
- CLI flags:
  - `--dry-run` – validate and write reports but do not modify `db.json`.
  - `--strategy=skip|overwrite` – how to handle duplicates (default: skip).
  - `--key=id|name` – which field to treat as unique key (default: id).
  - `--confirm` – skip interactive confirmation and proceed.

- Example usage:

```bash
# dry-run with skip strategy (default)
node scripts/migrate_imported_members.js --dry-run

# apply migration and overwrite duplicates by id
node scripts/migrate_imported_members.js --strategy=overwrite --key=id --confirm
```

- Outputs:
  - `server/data/migration_report.json` with added/skipped entries and errors.
  - Backup of original `server/data/db.json` at `server/data/db.json.backup.<timestamp>`.

### Migration & Backup
- Backups are stored in `server/data/backups/` and named `db.backup.<timestamp>.json`.
- The migration script keeps up to 5 backups; older backups are deleted automatically.
- Use `--dry-run` to test migration without modifying `db.json`.

### Environment
- To control whether the dashboard is embedded by default, set `VITE_SHOW_DASHBOARD=true` in your `.env` or `.env.local`. See `.env.example` for reference.

````

