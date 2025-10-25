# BestNote

**KI-gestütztes Noten- und Kalenderverwaltungssystem für Musikvereine**

## Inhaltsverzeichnis
- [Projektübersicht](#projektübersicht)
- [Projektziel](#projektziel)
- [Features](#features)
- [Rollenmatrix](#rollenmatrix)
- [Teststrategie für Custom Directives](#teststrategie-für-custom-directives)
- [KI-Herkunft](#ki-herkunft)
- [Quickstart](#quickstart)
- [Lizenz](#lizenz)
- [Mitwirken](#mitwirken)

## 🧩 Projektübersicht

BestNote vereinfacht die Organisation von Musikgruppen durch rollenbasierten Zugriff auf Noten, Kalender und Uploads. Es kombiniert moderne Webtechnologien mit KI-gestützter Entwicklung für maximale Wartbarkeit und Erweiterbarkeit.

## 🎯 Projektziel

BestNote vereinfacht die Organisation von Musikgruppen durch rollenbasierten Zugriff auf Noten, Kalender und Uploads. Es kombiniert moderne Webtechnologien mit KI-gestützter Entwicklung für Wartbarkeit und Erweiterbarkeit.

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
|-------------|----------------------------|--------|----------|-------|
| Mitglied    | Eigene Stimme              | ❌     | ✅       | ❌    |
| Dirigent    | Alle Stimmen               | ❌     | ✅       | ❌    |
| Notenwart   | Alle Stimmen               | ✅     | ✅       | ❌    |
| Vorstand    | Alle Stimmen               | ❌     | ✅       | ❌    |
| Kassierer   | Eigene Stimme (wenn Musiker) | ❌   | ✅       | ❌    |
| Admin       | Alle                       | ✅     | ✅       | ✅    |

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

## 🤖 KI-Herkunft

Dieses Projekt wurde mit Unterstützung von Microsoft Copilot entwickelt. Die KI half bei:
- Modularer Architektur
- Prompt-Design für Berechtigungslogik
- Teststrategie und CI-Setup
- Zweisprachiger Dokumentation

## Quickstart (kurz)

Voraussetzungen:
- Node.js (LTS empfohlen)
- npm

Install & Start (Kurzform):

1. Abhängigkeiten installieren

```bash
npm install
```

2. Backend starten (falls verwendet)

```bash
cd server
npm run dev
```

3. Frontend starten

```bash
npm run dev
```

## 📄 Lizenz

GPLv3 – siehe [LICENSE](./LICENSE)

## 🤝 Mitwirken

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md)

<!-- Ende der deutschen README -->
