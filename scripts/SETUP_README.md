# Local setup for BestNote

This helper provides a quick way to configure a local development environment for BestNote, including optional Jameica path configuration, Nextcloud WebDAV settings, CSV/XML import for jVerein/OpenVerein data, and seeding an example database.

Files added:
- scripts/setup_local_env.sh — interactive bash helper
- scripts/import_jverein.js — minimal Node.js CSV/XML importer
- server/data/seed.json — example roles and members

Prerequisites:
- bash (Linux/macOS)
- Node.js (for the importer)

Quick start:
1. Make the setup script executable:

```bash
chmod +x scripts/setup_local_env.sh
```

2. Run the script:

```bash
./scripts/setup_local_env.sh
```

The script will ask for optional inputs like Jameica path and Nextcloud WebDAV credentials and will copy the example seed DB to `server/data/db.json`.

Importer usage (optional):

```bash
node scripts/import_jverein.js path/to/members.csv server/data/imported_members.json
```

Notes:
- The importer is intentionally minimal and uses a simple CSV parser. For production imports use a robust parser and validate fields carefully.
- Jameica integration is a local path configuration only — the script does not install or manage Jameica itself.
