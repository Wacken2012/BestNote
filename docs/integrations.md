# Integrations: jVerein & Nextcloud

🇩🇪 Deutsch | 🇬🇧 English below

---

## 🇩🇪 Deutsch

Dieses Dokument erklärt, wie BestNote mit jVerein (Mitgliederdaten) und Nextcloud (Speicher / WebDAV) integriert werden kann.

### jVerein

- Zweck: Exporte (CSV/XML) aus jVerein werden von `scripts/import_jverein.js` eingelesen.
- Lokaler Fork: `vendor/jverein/` — lege hier einen Fork ab, wenn du eigene Exporter oder Anpassungen brauchst.
- Lizenz: jVerein ist GPLv3; füge die upstream `LICENSE` in den Vendor-Ordner ein und dokumentiere lokale Patches.
- Pflege: Rebase oder cherry-pick relevante Upstream-Commits in `vendor/jverein/` und aktualisiere `vendor/jverein/README.md`.

### Nextcloud

- Nutzung: BestNote erwartet einen WebDAV-Endpunkt (Nextcloud empfohlen).
- Lokale Tests: Starte Nextcloud per Docker Compose und konfiguriere die WebDAV-URL in `server/.env.local`.
- Lizenz: Nextcloud ist AGPL oder ähnlich; füge passende Lizenztexte in `vendor/nextcloud/` ein, wenn du forkt.

### Fork-Strategie & Hinweise für Mitwirkende

- Halte Vendor-Forks minimal. Bevorzuge kleine, dokumentierte Patch-Sets anstatt des kompletten Upstream-Trees.
- Dokumentiere Änderungen sorgfältig und lege `README` + `LICENSE` im Vendor-Ordner ab.
- Für CI/Tests: Nutze lieber ephemeral Docker-Instanzen statt eines kompletten Vendor-Servers.

---

## 🇬🇧 English

This document explains how BestNote integrates with jVerein (membership data) and Nextcloud (storage / WebDAV).

### jVerein

- Intended usage: export membership lists (CSV or XML) which are ingested by `scripts/import_jverein.js`.
- Local fork: `vendor/jverein/` — place a forked copy here if you need custom exporters.
- License: upstream jVerein is GPLv3; include the upstream `LICENSE` in the vendor folder and keep a changelog of local patches.
- Maintenance: when upstream changes, rebase or cherry-pick relevant commits into `vendor/jverein/` and update `vendor/jverein/README.md` with the upstream commit.

### Nextcloud

- Usage: BestNote expects a WebDAV endpoint for file storage (Nextcloud recommended).
- Local testing: use Docker Compose to run a Nextcloud instance and configure the WebDAV URL in `server/.env.local` (setup script helps with this).
- Licensing: Nextcloud server is under AGPL (or upstream license); include appropriate license text in `vendor/nextcloud/` when forking.

### Fork strategy & contributor notes

- Keep vendor forks minimal. Prefer a small, documented patchset rather than committing the whole upstream tree.
- When in doubt, document changes and keep forks under `vendor/` with README + LICENSE.
- For CI or automated testing, prefer ephemeral Docker instances to running a full vendor server.

***
