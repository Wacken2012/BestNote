# OpenMusikVerein — Server README

This file documents server-specific commands, environment variables and the backend API.

## Quick commands

Install dependencies:
```bash
cd server
npm install
```

Start in development (auto-restart):
```bash
npm run dev
```

Build TypeScript for production:
```bash
npm run build
npm start
```

## Environment (`.env`)
Create `/server/.env` with these variables:
```env
NEXTCLOUD_URL=https://deine-nextcloud.de
NEXTCLOUD_USER=admin
NEXTCLOUD_PASS=app-passwort
SERVER_API=http://localhost:3001
PORT=3001
```

## API Endpoints

All endpoints are prefixed with `/api`.

### POST /api/upload
Uploads a single file (multipart/form-data) to Nextcloud (WebDAV) via the server.

- Request (curl example):
```bash
curl -v -X POST 'http://localhost:3001/api/upload' \
  -F "file=@/path/to/score.pdf" \
  -F "folder=Noten"
```

- Response (success):
```json
{ "ok": true }
```

### GET /api/list
Lists files in the configured folder using WebDAV PROPFIND and returns parsed items.

- Query params:
  - `folder` (optional) — folder to list (default: root of configured path)

- Request (curl):
```bash
curl 'http://localhost:3001/api/list'
```

- Response example:
```json
{
  "ok": true,
  "items": [
    { "name": "Ode an die Freude.pdf", "href": "/remote.php/...", "size": 123456, "modified": "2025-10-24T18:00:00Z" }
  ]
}
```

### GET /api/calendar
Fetches calendar (CalDAV) data from Nextcloud. Returns raw iCalendar text.

- Query params:
  - `path` (optional) — full CalDAV path to specific calendar

- Request (curl):
```bash
curl 'http://localhost:3001/api/calendar?path=/remote.php/caldav/calendars/user/calendar'
```

- Response: `text/calendar` (the .ics contents)

## Notes & troubleshooting
- Ensure `NEXTCLOUD_*` values are correct. Use an App Password for `NEXTCLOUD_PASS`.
- If PROPFIND returns unexpected XML, the server attempts namespace-agnostic parsing but may need adjustments for unusual servers.

## Testing helper
- `scripts/testList.ts` — small helper that calls `/api/list`, supports `--mock` and `--out` options.
