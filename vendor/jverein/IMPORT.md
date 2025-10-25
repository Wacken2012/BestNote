Import / Vendor workflow
========================

Dieses Verzeichnis ist als lokaler Fork von jVerein gedacht. Das Projekt enthält ein kleines Hilfs-Skript `scripts/clone_jverein.sh`, das beim Einpflegen des Upstreams hilft.

Flags im `scripts/clone_jverein.sh`

- `--force`  : löscht das Zielverzeichnis und klont neu (destruktiv).
- `--update` : wenn `vendor/jverein` bereits ein Git-Checkout ist, führt `git fetch` und `git reset --hard origin/<branch>` aus.
- `--merge`  : klont in ein temporäres Verzeichnis und kopiert anschließend nur Dateien, die im Ziel noch nicht existieren (überschreibt nichts). Nutzt `rsync --ignore-existing` falls vorhanden, sonst `cp -rn`.
- `--dry-run`: zeigt an, was passieren würde, ohne Änderungen vorzunehmen.

Manueller ZIP-Import
-------------------

Wenn du das Upstream-Repository als ZIP heruntergeladen und manuell in `vendor/jverein` entpackt hast (z. B. weil kein Git-/Netzwerkzugriff zur Verfügung steht), führe bitte die folgenden Schritte aus:

1. Prüfe die Dateien in `vendor/jverein` auf große Demo-/CI-Dateien (`.github/`, `demo/`, `tests/`) und entferne sie, wenn sie nicht benötigt werden, um das Repo klein zu halten.
2. Füge eine `vendor/jverein/LICENSE` mit dem vollständigen Lizenztext (GPLv3) hinzu, damit die Lizenzbedingungen lokal sichtbar sind.
3. Ergänze in dieser README oder in `vendor/jverein/IMPORT.md` einen Hinweis auf die Upstream-Quelle, z. B.:

```
Forked from https://github.com/openjverein/jverein at <commit-or-zip-hash>
```

Aktueller Upstream / Releases
-----------------------------

Die offizielle Upstream-Quelle ist jetzt unter https://github.com/openjverein/jverein erreichbar. Es gibt dort veröffentlichte Releases (z. B. 3.2):

https://github.com/openjverein/jverein/releases

Offizielle Webseite
-------------------

Die offizielle Projektseite mit Dokumentation und Links lautet:

https://openjverein.github.io/

4. Wenn du später Änderungen vom Upstream nachziehen möchtest, benutze für eine saubere Integration idealerweise das `scripts/clone_jverein.sh` auf einem Rechner mit Git-Zugriff oder richte ein CI/Runner-Job ein, der das Clonen automatisch ausführt.

Support
-------

Wenn du Hilfe beim Aufräumen der importierten Dateien oder beim Erstellen der `LICENSE` brauchst, sag kurz Bescheid — ich kann automatische Cleanup-Vorschläge liefern (z. B. eine Liste der größten Dateien/Ordner).
