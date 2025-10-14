# BestNote – Modulübersicht & Vision

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
- `api/`: API endpoints
- `services/`: Business logic services

## Frontend

- `App.vue`: Main Vue component
- `main.js`: Vue application entry point
- `components/`: Reusable Vue components

## Documentation

- `README.md`: Project overview
- `modules.md`: Module descriptions
- `quickstart.md`: Setup guide

# BestNote Module

## Übersicht
BestNote ist ein modulares, mandantenfähiges Musik- und Vereinsmanagementsystem mit KI-Unterstützung. Die Architektur trennt Backend, Frontend und Services klar und ermöglicht flexible Erweiterungen.

## Module

### Backend
- **auth**: Mandantenfähige Authentifizierung (JWT), Mandant-Isolation, User-Management
- **api**: REST-API für Mandanten, Workflows, Import/Export, Dashboard, Kalender, u.a.
- **models**: Datenmodelle für Noten, Stimmen, Mandanten, Nutzer, Events
- **services**: Geschäftslogik für Import/Export, KI-Klassifikation, Backup, Chat, Kalender

### Frontend
- **Vue-Komponenten**: Mandanten-Dashboard, Kalender mit RSVP, Import/Export, Onboarding, Login
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

## Technische Entscheidungen
- **FastAPI** für schnelles, typisiertes Backend
- **Vue 3 + Vite** für moderne, modulare Frontend-Entwicklung
- **JWT** für sichere Authentifizierung
- **IndexedDB** für Offline-Fähigkeit
- **Tesseract.js** für OCR-Scan
- **PWA**-Support für mobile Nutzung
- **Klar getrennte Module** für Wartbarkeit und Erweiterbarkeit