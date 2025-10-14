# BestNote – Quickstart für Entwickler

## Voraussetzungen
- Python 3.11+
- Node.js + npm
- VS Code mit GitHub Copilot
- Modell: GPT-4.1

## Setup
```bash
# Backend
pip install -r requirements.txt
uvicorn backend.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Copilot-Kontext
Alle Module und Vision sind in `docs/modules.md` dokumentiert.

## Code

### SoftNote Import starten
```bash
# Backend-Service testen
python -c "from backend.services.import_softnote import SoftNoteImportService; print('Import-Service verfügbar')"
```

### Frontend-Komponenten entwickeln
```bash
# Vue-Komponenten im Browser testen
cd frontend
npm run dev
# Öffne http://localhost:5173 und navigiere zu /import
```

---

## 🧠 Bonus: Copilot-Tipps für BestNote

- **Kommentare verwenden**: Schreibe `# Modul: KI-gestützte GEMA-Vorschläge` über Funktionen, damit Copilot weiß, worum es geht.
- **Dateien modular halten**: Trenne API, Services und Models sauber → Copilot erkennt Muster.
- **Markdown als Kontext nutzen**: `modules.md` ist dein semantischer Kompass für Copilot.

---

Wenn du willst, kann ich dir jetzt ein GitHub-Template mit diesen Commits vorbereiten oder dir helfen, die ersten Funktionen zu implementieren (z. B. SoftNote-Import oder Workflow-Engine). Sag einfach, wie du starten willst.