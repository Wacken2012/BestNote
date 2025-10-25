# 📦 Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in diesem Dokument festgehalten.

## [1.0.0] – 2025-10-25

### ✨ Features

- Globale Berechtigungs-Directives: `v-can-upload`, `v-can-piece`, `v-can-calendar`
- Modularer `PermissionService` mit rollenbasierter Zugriffskontrolle
- Kalenderansicht mit Zugriffsschutz via `canAccessCalendar()`
- Zweisprachige Dokumentation (`README.de.md`, `README.en.md`)
- GitHub Actions CI mit Node-Matrix, Coverage und Artefakt-Upload
- Globale Testinitialisierung mit `createTestingPinia()`
- Beispieltests für Directives und Services
- Contributor-Onboarding: `contributing.md`, `CONTRIBUTING.md`, PR-Template

### 🛠 Verbesserungen

- Strukturierte Projektorganisation (src/, tests/, docs/)
- Alias-Importe vereinheitlicht, Typechecking optimiert
- PR-Checkliste und Branch-Konventionen eingeführt

### 📜 Lizenz

- Projekt unter GPLv3 veröffentlicht

---

## [2.0.0] – 2025-10-25

### 📦 BestNote v2.0.0 — DSGVO-konform, modular, mehrsprachig

### 🇩🇪 Highlights (Deutsch)
- 🔐 JWT-Authentifizierung mit Middleware und Token-Generator
- 📁 Fork-Integration von OpenJVerein und Nextcloud unter vendor/
- 🧾 DSGVO-konforme API-Endpunkte (GET/DELETE für Mitglieder)
- 🧠 Mehrfachrollen für Mitglieder (z. B. Musiker + Notenwart + Vorstand)
- 🧪 CLI-Tools für Export und Löschung von Mitgliedsdaten
- 🔄 Backup-Rotation für db.json
- 🧰 Logging-Middleware mit Datenschutzfilter
- 🧪 Unit-Tests für API und CLI
- 📚 Alle Dokumente jetzt zweisprachig (Deutsch & Englisch)

### 🇬🇧 Highlights (English)
- 🔐 JWT authentication with middleware and token generator
- 📁 Fork integration of OpenJVerein and Nextcloud under vendor/
- 🧾 GDPR-compliant API endpoints (GET/DELETE for members)
- 🧠 Multi-role support for members (e.g. musician + librarian + board)
- 🧪 CLI tools for member data export and deletion
- 🔄 Backup rotation for db.json
- 🧰 Logging middleware with data redaction
- 🧪 Unit tests for API and CLI
- 📚 All documentation now bilingual (German & English)

---

## [2.1.0] – 2025-10-25

### 🚀 BestNote v2.1.0 — Import Preview, Backup & Retention

### ✨ Highlights
- Added import preview modal with dry-run support
- Added backup-before-import option
- Implemented retention policy (MAX_BACKUPS)
- Added server-side tests for import and backup
- Updated documentation and release notes

### 🔒 Breaking Changes
- Import endpoint changed to `/api/members/import` (replace custom import routes)
- Router guards now use the auth store store; ensure frontend auth integration

### 🛠 Migration
- Update any custom import flows to use the dry-run preview
- Ensure `server/data/backups/` exists and is writable for retention to work

