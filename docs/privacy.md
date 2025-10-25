# Datenschutz / Privacy

🇩🇪 Deutsch | 🇬🇧 English below

---

## 🇩🇪 Deutsch

Diese Datei beschreibt, welche personenbezogenen Daten BestNote verarbeitet, wo sie gespeichert werden und wie Löschung/Export funktioniert. Ziel ist eine einfache DSGVO-Konformität für lokale Deployments.

### 1. Übersicht der verarbeiteten Daten

Typische Mitgliederdaten (Beispiele):

- id, membershipNumber
- Vorname, Nachname
- E-Mail-Adresse
- Telefonnummer
- Adresse (Straße, PLZ, Ort)
- Geburtsdatum
- Zahlungs-/Mitgliedschaftsinformationen (Status, Beitragsstufe)
- Rollen / Berechtigungen innerhalb der App

Zusätzlich können Logs oder temporäre Dateien (z. B. Import-Reports) entstehen. Standardmäßig speichert die App keine Cloud-Credentials oder automatische Cloud-Backups.

### 2. Speicherorte und Zugriffskontrolle

- Lokaler Speicher: `server/data/db.json` (lokale JSON-Datei).
- Repo-Zugriff: Nur Personen mit Zugriff auf den Host können die Datei lesen/ändern.
- Anwendungsebene: `PermissionService` sorgt dafür, dass sensible Felder nur für autorisierte Rollen sichtbar sind (z. B. `admin`).

Empfehlungen:

- Beschränke Dateisystemberechtigungen auf das Minimum (Service-User, Admins).
- Lege regelmäßige Backups an und verschlüssele sie, wenn sie extern gespeichert werden.

### 3. Löschung und Export

- Manuelle Löschung per CLI:
  - `node scripts/delete_member.js <id|membershipNumber>` entfernt einen Eintrag aus `server/data/db.json`.
- Export per CLI:
  - `node scripts/export_member_data.js --id=<id>` gibt Mitgliedsdaten als JSON auf stdout aus.
  - `node scripts/export_member_data.js --all --format=csv --out=members.csv` exportiert alle Mitglieder als CSV.
- API: Implementiere Endpunkte, die `filterMemberForViewer` nutzen, um nur autorisierte Felder auszuliefern.

### 4. Protokollierung

- Protokolle sollten keine sensiblen Daten in Klartext speichern. Maskiere oder vermeide Logeinträge mit personenbezogenen Daten.

### 5. Hinweise

- Diese Hinweise gelten für lokale/standalone Installationen. Bei Cloud-Nutzung prüfe zusätzlich DPA, Datenstandort und Zugriffskontrolle.

---

## 🇬🇧 English

This document describes which personal data BestNote processes, where it is stored and how deletion/export works. The goal is simple GDPR compliance for local/standalone deployments.

### 1. Processed data (overview)

Typical member data (examples):

- id, membershipNumber
- First name, Last name
- Email address
- Phone number
- Address (street, postal code, city)
- Date of birth
- Payment/membership details (status, contribution tier)
- Roles / permissions within the app

Additionally, logs or temporary files (import reports) may exist. By default the app does not store external cloud credentials or automatic cloud backups.

### 2. Storage and access control

- Local storage: `server/data/db.json` (local JSON file).
- Repo access: Only users with filesystem access to the server host can read/modify the file.
- Application layer: `PermissionService` ensures sensitive fields are shown only to authorized roles (e.g. `admin`).

Recommendations:

- Restrict filesystem permissions to the minimum (service user, admins).
- Schedule regular backups and encrypt them if you store them externally.

### 3. Deletion and export

- Manual deletion via CLI:
  - `node scripts/delete_member.js <id|membershipNumber>` removes an entry from `server/data/db.json`.
- Export via CLI:
  - `node scripts/export_member_data.js --id=<id>` outputs the member data as JSON to stdout.
  - `node scripts/export_member_data.js --all --format=csv --out=members.csv` exports all members as CSV.
- API: Provide endpoints that call `filterMemberForViewer` to return only authorized data fields.

### 4. Logging

- Logs should not contain sensitive data (e.g. full email addresses or postal addresses) in clear text. Mask or avoid logging personal data.

### 5. Further notes

- These notes apply to local/standalone installs. If you move data to the cloud, verify additional GDPR requirements (DPA, data location, access controls).