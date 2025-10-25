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

## 📸 Screenshots (optional)
_Füge hier GIFs oder Screenshots der Notenansicht, Kalenderintegration oder Rollenumschaltung ein._

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
