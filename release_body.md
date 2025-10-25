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

### Additions since v2.0.0

- Import preview UI: vendor import now supports a dry-run preview modal and a confirm flow (VendorImport.vue).
- Server endpoint: POST `/api/members/import` supports `?dry=true` and writes to `server/data/imported_members.json` when committed.
- Tests: `tests/api.import.test.ts` adds dry-run and commit tests validating counts and file persistence.
- UX: toast notifications and modal confirmation to prevent accidental imports.

Commit reference: `63c5e0c`
