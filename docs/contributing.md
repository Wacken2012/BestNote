# 🤝 Mitwirken an BestNote

Willkommen bei BestNote – einem KI-gestützten Noten- und Kalenderverwaltungssystem für Musikvereine. Dieses Projekt freut sich über Beiträge von Musiker:innen, Entwickler:innen und Open-Source-Enthusiast:innen.

## 🧭 Projektüberblick

- Modularer Aufbau (Directives, Services, Stores)
- Rollenbasierte Berechtigungen
- Mehrsprachige Dokumentation
- Vollständig testbar mit Vitest

## 🛠 Mitwirkungsregeln

- Bitte respektiere die Branch-Konventionen
- Schreibe klare Commits (`type(scope): message`)
- Dokumentiere neue Features in `README` oder `docs/`
- Teste neue Funktionen mit Vitest

## 🌿 Branch-Konventionen

- `main`: stabile Produktionsbasis
- `feature/xyz`: neue Features
- `fix/xyz`: Bugfixes
- `docs/xyz`: Dokumentation

## 🧪 Tests

- Teststruktur: `tests/`
- Globale Initialisierung: `tests/setup.ts`
- Direktiven: `tests/directives/`
- Services: `tests/services/`
- Testausführung:

```bash
npm run test
npm run test -- --coverage
```

## ✅ PR-Checkliste

- [ ] Tests laufen lokal
- [ ] Neue Funktionen sind getestet
- [ ] Dokumentation aktualisiert
- [ ] Commit-Nachricht ist klar
- [ ] Branch-Konvention eingehalten

## � Release-Hinweise

Bitte beachte `RELEASE.md` für alle Schritte zur Veröffentlichung.

## 📜 Lizenz

Dieses Projekt steht unter der GPLv3.

---

### 💾 Commit-Vorschlag

```bash
git add docs/contributing.md
git commit -m "docs: finalize contributing guide with onboarding and PR checklist"
git push
```
