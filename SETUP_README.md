# Local setup and forks

This document explains how to use the local forks placed under `vendor/` and how to run a local Nextcloud for integration testing.

## Forks
- `vendor/jverein/` — keep a fork of jVerein here if you need custom export/parsing behavior. Avoid committing large binaries; prefer a minimal fork or submodule.
- `vendor/nextcloud/` — optional fork of Nextcloud server. Running Nextcloud in Docker is recommended for local testing.

## Jameica + jVerein
1. Install Jameica from upstream and the jVerein plugin.
2. If you need to patch exports for BestNote, fork jVerein and place the repo under `vendor/jverein/`.
3. Document any upstream differences in `vendor/jverein/README.md`.

## Running Nextcloud locally (Docker)
A quick example using Docker Compose (recommended):

```yaml
version: '3'
services:
  db:
    image: mariadb
    environment:
      - MYSQL_ROOT_PASSWORD=example
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nc
      - MYSQL_PASSWORD=nc
  nextcloud:
    image: nextcloud
    ports:
      - "8080:80"
    depends_on:
      - db
```

Start with:

```bash
docker compose up -d
```

Then configure an admin user and use the WebDAV endpoint `http://localhost:8080/remote.php/dav/files/<username>/`.

***

## This file is bilingual / Diese Datei ist zweisprachig

🇩🇪 Deutsch | 🇬🇧 English

See also `docs/local-jwt.md` for local JWT testing instructions. / Siehe `docs/local-jwt.md` für lokale JWT-Testanweisungen.

## DSGVO / Data storage note

- BestNote stores member data locally by default in `server/data/db.json`.
- There is no automatic cloud synchronization out of the box — you keep full control over the data location and backups.
- If you decide to store backups or a database in a cloud service, ensure you have a Data Processing Agreement (DPA) with the provider and that the provider meets required data protection standards.
- Use the CLI tools in `scripts/` for deletion and export to provide deletion/export capabilities for members (see `docs/privacy.md`).

***
