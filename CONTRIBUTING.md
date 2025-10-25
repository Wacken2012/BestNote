# 🤝 Mitwirken an OpenMusikVerein

Kurzinfo: ausführliche Beitragsrichtlinien und die PR-Checkliste findest du in `docs/contributing.md`.

Vielen Dank für dein Interesse, dieses Projekt mitzugestalten! Wir freuen uns über Beiträge jeder Art – ob Code, Dokumentation, Tests oder Ideen.

## 🛠️ So startest du

1. Forke das Repository
2. Erstelle einen Branch: `feature/dein-thema`
3. Implementiere deine Änderungen
4. Öffne einen Pull Request mit:
   - Beschreibung der Änderung
   - Verweis auf relevante Issues (falls vorhanden)
   - Screenshots oder Tests (wenn sinnvoll)

# 🤝 Mitwirken an OpenMusikVerein / Contributing

Diese Datei ist zweisprachig. | This file is bilingual.

🇩🇪 Deutsch | 🇬🇧 English below

---

## 🇩🇪 Deutsch

Kurzinfo: Ausführliche Beitragsrichtlinien und die PR-Checkliste findest du in `docs/contributing.md`.

Vielen Dank für dein Interesse! Wir freuen uns über Beiträge jeder Art – Code, Dokumentation, Tests oder Ideen.

### 🛠️ So startest du

1. Forke das Repository
2. Erstelle einen Branch: `feature/dein-thema`
3. Implementiere Änderungen
4. Öffne einen Pull Request mit:
   - Beschreibung der Änderung
   - Verweis auf relevante Issues (falls vorhanden)
   - Screenshots oder Tests (wenn sinnvoll)

### ✅ Review-Checkliste

Bitte prüfe vor dem PR:

- [ ] Tests laufen lokal (`npm run test`)
- [ ] Neue Funktionen sind getestet
- [ ] Dokumentation (`README` oder `docs/`) aktualisiert
- [ ] Commit-Nachricht ist klar und prägnant

### 📘 Weitere Hinweise

Lizenz: GPLv3

Sprache: Deutsch & Englisch

Doku: siehe `README.de.md` und `README.en.md`

### KI / AI-Provenance

Ein Teil dieses Repositories wurde mit Hilfe von KI-gestützten Tools erstellt (z. B. GitHub Copilot). Generierte Inhalte wurden geprüft und ggf. angepasst. Bitte kennzeichne automatisierte Beiträge beim Einreichen.

### 📘 Stil & Struktur

- Frontend: Vue 3 + TypeScript + Composition API
- Backend: Express + TypeScript
- Store: Pinia
- Tests: Vitest + Vue Test Utils

### 💬 Kommunikation

- Nutze GitHub Issues für Vorschläge oder Fehlerberichte.
- Diskutiere größere Änderungen vorab per Issue oder PR-Kommentar.

### Integration prüfen

Wenn du Änderungen an den jVerein- oder Nextcloud-Integrationen vornimmst, prüfe bitte:

- Lege lokal einen Fork unter `vendor/jverein/` oder `vendor/nextcloud/` an und dokumentiere Änderungen in `vendor/*/README.md`.
- Nutze `scripts/setup_local_env.sh` um lokale Pfade und WebDAV-Zugang zu konfigurieren.
- Führe `node scripts/import_jverein.js path/to/sample.csv server/data/imported_members.json --dry-run` aus und überprüfe `server/data/import_report.json`.
- Führe `node scripts/migrate_imported_members.js --dry-run` und prüfe `server/data/migration_report.json`.

Wenn CI-spezifische Tests notwendig sind, dokumentiere die Schritte in `docs/integrations.md`.

---

## 🇬🇧 English

Short note: Full contributing guidelines and the PR checklist are in `docs/contributing.md`.

Thanks for your interest! We welcome contributions of all kinds — code, docs, tests, and ideas.

### 🛠️ Getting started

1. Fork the repository
2. Create a branch: `feature/your-topic`
3. Implement your changes
4. Open a Pull Request including:
   - A description of the change
   - References to relevant issues (if any)
   - Screenshots or tests (when appropriate)

### ✅ Review checklist

Please verify before opening a PR:

- [ ] Tests run locally (`npm run test`)
- [ ] New features are covered by tests
- [ ] Documentation (`README` or `docs/`) updated
- [ ] Commit message is clear and concise

### 📘 Notes

License: GPLv3

Language: German & English

Docs: see `README.de.md` and `README.en.md`

### AI provenance

Parts of this repository were created with the help of AI tools (e.g. GitHub Copilot). Generated content was reviewed and adjusted when necessary. Please mark automated content when submitting contributions.

### 📘 Style & structure

- Frontend: Vue 3 + TypeScript + Composition API
- Backend: Express + TypeScript
- Store: Pinia
- Tests: Vitest + Vue Test Utils

### 💬 Communication

- Use GitHub Issues for suggestions or bug reports.
- Discuss larger changes in an Issue or PR comment first.

### Integration checks

If you modify the jVerein or Nextcloud integrations:

- Place a local fork under `vendor/jverein/` or `vendor/nextcloud/` and document changes in `vendor/*/README.md`.
- Use `scripts/setup_local_env.sh` to configure local paths and WebDAV access.
- Run `node scripts/import_jverein.js path/to/sample.csv server/data/imported_members.json --dry-run` and check `server/data/import_report.json`.
- Run `node scripts/migrate_imported_members.js --dry-run` and inspect `server/data/migration_report.json`.

If CI-specific tests are needed, document the steps in `docs/integrations.md`.
