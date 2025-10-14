# BestNote

BestNote ist ein modulares, mandantenfähiges System zur Verwaltung von Notenarchiven, Vereinsdaten und Aufführungen. Es bietet eine moderne PWA-Oberfläche, KI-gestützte Klassifikation, Import/Export, Kalender, Hardware-Integration (Scan/Print), API-Logging und Offline-Workflows.

## Features
- Mandantenfähige Verwaltung von Noten, Aufführungen, Mitgliedern
- Import (SoftNote), Export (ZIP mit Layout), Backup/Restore
- Kalender mit Zusagefunktion
- KI-gestützte Klassifikation und OCR (Scan/Kamera)
- Hardware-Integration: Scanner & Drucker (Windows & Linux)
- API-Logging, Audit-Log, Rechte/Rollen
- Offline- und Mobile-First (PWA, IndexedDB)
- REST-API für alle Workflows

## Projektstruktur
- `backend/` – FastAPI Backend, modular, API-First, Hardware-Integration
- `frontend/` – Vue 3 PWA, modulare Komponenten, Responsive, API-Integration
- `docs/` – Architektur, Module, Quickstart, Roadmap

## Quickstart
1. **Backend:**
   ```bash
   cd bestnote
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   PYTHONPATH=$(pwd) uvicorn backend.main:app --reload
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Tests:**
   ```bash
   ./run_backend_tests.sh
   ```

## Hinweise
- Siehe `docs/` für Architektur, Module und Roadmap
- `.github/copilot-instructions.md` für Copilot-Kontext und Entwicklungsleitplanken
- `.gitignore` schützt sensible und Build-Dateien

## Lizenz
MIT
