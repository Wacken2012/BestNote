# 🧪 CI-Workflow mit GitHub Actions

Dieses Projekt verwendet GitHub Actions zur automatisierten Prüfung bei jedem Push und Pull Request.

## 🔄 Was wird geprüft?

- Node-Versionen: 18.x und 20.x
- Installation mit `npm ci`
- Tests mit `Vitest` (inkl. DOM-Umgebung)
- Coverage-Bericht wird erzeugt und als Artefakt hochgeladen

## 📦 Coverage

- Coverage wird nur bei Pushs hochgeladen (nicht bei PRs)
- Artefakt: `coverage-report` (HTML + Text)
- Lokal kannst du Coverage so erzeugen:

```bash
npm run test -- --coverage
```

Dann öffne `coverage/index.html` im Browser.

## 🛠 Erweiterungsmöglichkeiten

- Linting (npm run lint)
- Build-Checks (npm run build)
- Upload zu Codecov (Token erforderlich)

## 📁 Workflow-Datei

Pfad: `.github/workflows/test.yml` — diese Datei führt die Tests und lädt das Coverage-Artefakt hoch. Passe sie an, um weitere Checks oder Matrixen hinzuzufügen.
