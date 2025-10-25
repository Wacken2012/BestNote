# 🚀 Release Guide für BestNote

Dieses Dokument beschreibt die Schritte zur Veröffentlichung eines neuen Releases.

## 🧪 Vorbereitungen

- [ ] Alle Tests laufen (`npm run test`)
- [ ] `CHANGELOG.md` aktualisiert
- [ ] `package.json` Version angepasst (z. B. `"version": "1.1.0"`)
- [ ] Commit mit `chore(release): bump version to x.y.z`

## 🏷️ Git-Tag erstellen

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

## 📦 GitHub Release anlegen

```bash
gh release create v1.1.0 \
  --title "BestNote v1.1.0 – [Titel]" \
  --notes-file CHANGELOG.md \
  --latest
```

## 📁 Optional: Release-Assets hochladen

```bash
gh release upload v1.1.0 dist.zip
```

## 📝 Nachbereitung

- [ ] `docs/CHANGELOG.md` verlinken
- [ ] Release auf GitHub als „latest“ markieren (falls gewünscht)
- [ ] `contributing.md` ggf. aktualisieren

---

### 💾 Commit-Vorschlag

```bash
git add RELEASE.md
git commit -m "docs: add release guide (RELEASE.md)"
git push
```
