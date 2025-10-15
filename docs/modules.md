# BestNote – Modulübersicht & Vision (Stand Oktober 2025)

## Ziel
Ein mandantenfähiges, KI-gestütztes, mobiloptimiertes Vereins- und Notenmanagementsystem mit PWA, API, Exportcenter, Kalender, Kommunikation und vollständiger Vereinsverwaltung.

## Module
- Mandantenportal mit Branding & Subdomain
- Loginseite mit Begrüßung & Sprache
- Mandanten-Onboarding
- Rechteverwaltung für Vorstand
- Mandanten-Dashboard mit Live-Status
- Archiv & Historie
- Statistik & Exportfunktion
- Exportcenter mit Layoutwahl
- API-Dashboard & Zugriffskontrolle
- Backup & Restore (SoftNote-kompatibel)
- Notenarchiv & Stimmenverwaltung
- Import aus SoftNote/CSV
- Export als ZIP mit Layout
- QR/NFC + Offline-Modus
- Kalender mit Zusagefunktion
- Mobile PWA mit Kamera, Scan, OCR
- KI-Module: Klassifikation, Besetzungsprüfung, GEMA-Vorschläge
- Kommunikation: Chat pro Mandant, E-Mail, Push
- Vereinsverwaltung: Mitglieder, Kasse, Vorstand

## Backend

- `main.py`: FastAPI application entry point
- `models.py`: Pydantic models for data structures
- `api/`: API endpoints (Mandanten, Benutzer/Rollen/Rechte, Kalender, Import/Export, Hardware, Health, Dashboard, Workflows)
- `services/`: Business logic services (Import/Export, KI, Backup, Chat, Kalender)
- `auth.py`: Mandantenfähige Authentifizierung, DEV-Bypass
- `tests/`: Pytest-Tests für alle Kernmodule, Demo- und Fallbackdaten

## Frontend

- `App.vue`: Main Vue component
- `main.js`: Vue application entry point
- `components/`: Modulare Vue-Komponenten (Dashboard, Kalender, Import, Export, Login, Onboarding, Mandantenverwaltung, Rechteverwaltung, SettingsView, Scan/OCR, Backup)
- `router.js`: Navigation zwischen Modulen
- `public/`: Manifest, Icons, PWA-Assets
- `tests/`: Playwright/Cypress-Tests für Kern-Workflows

## Documentation

- `README.md`: Project overview
- `modules.md`: Module descriptions
- `quickstart.md`: Setup guide

# BestNote Module

## Übersicht
BestNote ist ein modulares, mandantenfähiges Musik- und Vereinsmanagementsystem mit KI-Unterstützung. Die Architektur trennt Backend, Frontend und Services klar und ermöglicht flexible Erweiterungen.

## Module

### Backend
- **auth**: Mandantenfähige Authentifizierung (JWT), Mandant-Isolation, User-Management, DEV-Bypass
- **api**: REST-API für Mandanten, Benutzer/Rollen/Rechte, Workflows, Import/Export, Dashboard, Kalender, Hardware, Health, API-Log
- **models**: Datenmodelle für Noten, Stimmen, Mandanten, Nutzer, Events
- **services**: Geschäftslogik für Import/Export, KI-Klassifikation, Backup, Chat, Kalender

### Frontend
- **Vue-Komponenten**: Mandanten-Dashboard, Kalender mit RSVP, Import/Export, Onboarding, Login, SettingsView, Mandantenverwaltung, Rechteverwaltung, Scan/OCR, Backup
- **PWA-Features**: Offline-Workflow (IndexedDB), Kamera-Scan mit OCR, Responsive UI
- **API-Integration**: Authentifizierung, Datenabruf, Fehlerbehandlung, Fallbacks

### KI & Automatisierung
- **ai_classification**: Automatische Zuordnung und Verschlagwortung von Noten
- **chat**: KI-gestützte Unterstützung und FAQ

## Ziele
- Mandantenfähigkeit: Strikte Daten- und Rechte-Trennung
- Modularität: Erweiterbar durch neue Module und Services
- Benutzerfreundlichkeit: Moderne, reaktive UI, mobile Nutzung
- KI-Integration: Automatisierung und intelligente Vorschläge
- Datensicherheit: Backups, Rechte, Audit-Log

## Test- und Entwicklungsstand (Oktober 2025)
- Alle Kernmodule (Backend/Frontend) und Hardware-Integration (Scan/Print) sind implementiert
- API- und End-to-End-Tests für Health, Scan, Print laufen erfolgreich
- Mandantenfähigkeit, KI-Features, Offline- und PWA-Workflows produktiv
- Rechteverwaltung (Benutzer/Rollen/Rechte) als API und Frontend-Modul integriert
- Dokumentation und Copilot-Kontext aktuell

## Technische Entscheidungen
- **FastAPI** für schnelles, typisiertes Backend
- **Vue 3 + Vite** für moderne, modulare Frontend-Entwicklung
- **JWT** für sichere Authentifizierung
- **IndexedDB** für Offline-Fähigkeit
- **Tesseract.js** für OCR-Scan
- **PWA**-Support für mobile Nutzung
- **Klar getrennte Module** für Wartbarkeit und Erweiterbarkeit