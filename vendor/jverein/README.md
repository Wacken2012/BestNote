OpenJVerein
===========

OpenJVerein ist eine Open-Source-Vereinsverwaltung. Weitere Informationen, Releases und die offizielle Webseite sind unten verlinkt.

Mitmachen? siehe https://openjverein.github.io/

Import / Vendor workflow
------------------------

Dieses Verzeichnis dient als lokaler Fork von jVerein. Verwende `../scripts/clone_jverein.sh` um das Upstream-Repository (https://github.com/openjverein/jverein) zu klonen oder Dateien per ZIP zu importieren.

Siehe auch: `IMPORT.md` für detaillierte Hinweise zum Merge/Import-Workflow.

Upstream & Releases
-------------------

- Upstream-Repo: https://github.com/openjverein/jverein
- Releases: https://github.com/openjverein/jverein/releases (z. B. 3.2)
- Website: https://openjverein.github.io/

Manual ZIP imports
------------------

Wenn du das Upstream-Repo als ZIP heruntergeladen und hier entpackt hast, ergänze bitte eine `LICENSE` mit dem vollständigen GPLv3-Text und füge einen Hinweis auf die Upstream-Quelle (URL + Hash/Release) hinzu.

Cleanup
-------

Wenn du Platz sparen willst, entferne große Demo- oder CI-Ordner wie `.github/`, `demo/`, `tests/`.
Alternativ kannst du das Hilfs-Skript `../scripts/cleanup_vendor.sh` verwenden (siehe Root `scripts/`).
```markdown
OpenJVerein
-----------

OpenJVerein ist eine Open-Source-Vereinsverwaltung mit einer Anbindung an die ebenfalls unter Open-Source-Lizenz stehende Homebankingsoftware Hibiscus.
Die Implementierung erfolgt mit Java. Der Ablauf auf vielen Plattformen ist damit gewährleistet. Als GUI-Framework kommt Jameica zum Einsatz.

Mitmachen?
----------

Perfekt! Das [Forum](https://jverein-forum.de) und die [GitHub-Organisation](https://github.com/openjverein) sind dazu die ersten Anlaufstellen.
Um in die OpenJVerein-Organisation aufgenommen zu werden, erstellt bitte ein [Issue](https://github.com/openjverein/jverein/issues).

[Hier](CONTRIBUTING.md) wird die Einrichtung der Entwicklungsumgebung beschrieben.

Lizenz
------

OpenJVerein steht unter der [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).

Kontakt
-------

- Web: https://openjverein.github.io
- eMail:
    - Heiner Jostkleigrewe heiner(at)jost-net.de
    - Philipp Schönberger mail(at)phschoen.de


Import / Vendor workflow
------------------------

Dieses Verzeichnis ist als lokaler Fork von jVerein gedacht. Das Projekt enthält ein kleines Hilfs-Skript `scripts/clone_jverein.sh`, das beim Einpflegen des Upstreams hilft.

Flags im `scripts/clone_jverein.sh`
- `--force`  : löscht das Zielverzeichnis und klont neu (destruktiv).
- `--update` : wenn `vendor/jverein` bereits ein Git-Checkout ist, führt `git fetch` und `git reset --hard origin/<branch>` aus.
- `--merge`  : klont in ein temporäres Verzeichnis und kopiert anschließend nur Dateien, die im Ziel noch nicht existieren (überschreibt nichts). Nutzt `rsync --ignore-existing` falls vorhanden, sonst `cp -rn`.
- `--dry-run`: zeigt an, was passieren würde, ohne Änderungen vorzunehmen.

Manueller ZIP-Import
---------------------
Wenn du das Upstream-Repository als ZIP heruntergeladen und manuell in `vendor/jverein` entpackt hast (z. B. weil kein Git-/Netzwerkzugriff zur Verfügung steht), führe bitte die folgenden Schritte aus:

1. Prüfe die Dateien in `vendor/jverein` auf große Demo-/CI-Dateien (`.github/`, `demo/`, `tests/`) und entferne sie, wenn sie nicht benötigt werden, um das Repo klein zu halten.
2. Füge eine `vendor/jverein/LICENSE` mit dem vollständigen Lizenztext (GPLv3) hinzu, damit die Lizenzbedingungen lokal sichtbar sind.
3. Ergänze in dieser README einen Hinweis auf die Upstream-Quelle, z. B.:

```
Forked from https://github.com/willuhn/jverein at <commit-or-zip-hash>
```

4. Wenn du später Änderungen vom Upstream nachziehen möchtest, benutze für eine saubere Integration idealerweise das `scripts/clone_jverein.sh` auf einem Rechner mit Git-Zugriff oder richte ein CI/Runner-Job ein, der das Clonen automatisch ausführt.

Support
-------
Wenn du Hilfe beim Aufräumen der importierten Dateien oder beim Erstellen der `LICENSE` brauchst, sag kurz Bescheid — ich kann automatische Cleanup-Vorschläge liefern (z. B. eine Liste der größten Dateien/Ordner).

```
OpenJVerein
-----------

OpenJVerein ist eine Open-Source-Vereinsverwaltung mit einer Anbindung an die ebenfalls unter Open-Source-Lizenz stehende Homebankingsoftware Hibiscus.
Die Implementierung erfolgt mit Java. Der Ablauf auf vielen Plattformen ist damit gewährleistet. Als GUI-Framework kommt Jameica zum Einsatz.

Mitmachen?
----------

Perfekt! Das [Forum](https://jverein-forum.de) und die [GitHub-Organisation](https://github.com/openjverein) sind dazu die ersten Anlaufstellen.
Um in die OpenJVerein-Organisation aufgenommen zu werden, erstellt bitte ein [Issue](https://github.com/openjverein/jverein/issues).

[Hier](CONTRIBUTING.md) wird die Einrichtung der Entwicklungsumgebung beschrieben.

Lizenz
------

OpenJVerein steht unter der [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).

Kontakt
-------

- Web: https://openjverein.github.io
- eMail:
    - Heiner Jostkleigrewe heiner(at)jost-net.de
    - Philipp Schönberger mail(at)phschoen.de
