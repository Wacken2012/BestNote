# BestNote

## Vision

BestNote ist ein mandantenfähiges, KI-gestütztes, mobiloptimiertes Vereins- und Notenmanagementsystem mit PWA-Funktionalität. Inspiriert von SoftNote bietet es eine moderne, webbasierte Alternative für Musikvereine zur Verwaltung ihrer Notenbibliothek, Mitglieder und Veranstaltungen.

### Ziele

- **Vereinsübergreifende Plattform**: Mehrere Mandanten (Vereine) auf einer Instanz
- **Mobile-First**: Progressive Web App (PWA) für Offline-Nutzung
- **KI-gestützt**: Automatische Klassifikation und Besetzungsprüfung
- **SoftNote-Kompatibilität**: Nahtloser Import bestehender Daten
- **Modular**: Erweiterbar durch Plugins und APIs

## Architektur

### Tech-Stack

**Backend:**
- Python 3.11+ mit FastAPI
- Pydantic für Datenmodelle
- Uvicorn als ASGI-Server
- Modular routing in `api/`
- Business-Logik in `services/`

**Frontend:**
- Vue.js 3 mit Composition API
- Vite als Build-Tool
- PWA mit Vite PWA Plugin
- Responsive Design mit CSS Grid/Flexbox

**Datenbank:**
- PostgreSQL (empfohlen) oder SQLite (Entwicklung)
- SQLAlchemy mit Alembic für Migrationen

**Deployment:**
- Docker-Containerisierung
- Nginx als Reverse Proxy
- Let's Encrypt für SSL

### Modulstruktur

Ausführliche Informationen zu allen Modulen finden Sie in [`docs/modules.md`](modules.md).

### API-Design

- RESTful Endpoints mit OpenAPI/Swagger-Dokumentation
- WebSocket-Support für Echtzeitfunktionen (Chat, Live-Updates)
- Token-basierte Authentifizierung
- Rate Limiting und API-Monitoring

## Installation & Setup

### Voraussetzungen

- Python 3.11 oder höher
- Node.js 16+ mit npm
- Git
- VS Code mit GitHub Copilot (empfohlen)

### Schnellstart

```bash
# Repository klonen
git clone <repository-url>
cd bestnote

# Backend-Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend-Setup
cd ../frontend
npm install

# Entwicklungsserver starten
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Produktionssetup

```bash
# Docker-Compose für vollständige Umgebung
docker-compose up -d

# Oder manuell
# Backend mit Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Frontend builden
npm run build
# Statische Dateien mit Nginx servieren
```

## Entwicklung

### Code-Style

- **Python**: Black für Formatierung, Flake8 für Linting
- **JavaScript/Vue**: ESLint mit Vue-spezifischen Regeln
- **Commits**: Konventionelle Commits (`feat:`, `fix:`, `docs:`)

### Testing

```bash
# Backend-Tests
cd backend
pytest

# Frontend-Tests
cd frontend
npm test

# E2E-Tests
npm run test:e2e
```

### API-Dokumentation

Nach dem Start des Backends: http://localhost:8000/docs

## Deployment

### Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

### Cloud-Deployment

- **Vercel/Netlify**: Frontend
- **Railway/Render**: Backend + Datenbank
- **AWS/GCP**: Vollständige Infrastruktur

## Mitwirken

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Commits mit konventionellen Nachrichten
4. Push zum Branch
5. Pull Request erstellen

### Coding Standards

- Type Hints in Python
- Composition API in Vue 3
- Comprehensive Documentation
- Automated Testing

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## Kontakt

- **Projekt-Lead**: [Ihr Name]
- **Issues**: [GitHub Issues](issues)
- **Diskussionen**: [GitHub Discussions](discussions)

---

*BestNote - Die Zukunft des digitalen Notenmanagements für Musikvereine*