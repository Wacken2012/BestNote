Import / Vendor workflow for Nextcloud
=====================================

Dieses Verzeichnis ist als lokaler Fork von Nextcloud gedacht. Verwende `../scripts/clone_nextcloud.sh` um das Upstream-Repository (https://github.com/nextcloud/server) zu klonen oder Dateien per ZIP zu importieren.

Flags im `scripts/clone_nextcloud.sh`

- `--force`  : löscht das Zielverzeichnis und klont neu (destruktiv).
- `--update` : wenn `vendor/nextcloud` bereits ein Git-Checkout ist, führt `git fetch` und `git reset --hard origin/<branch>` aus.
- `--merge`  : klont in ein temporäres Verzeichnis und kopiert anschließend nur Dateien, die im Ziel noch nicht existieren (überschreibt nichts). Nutzt `rsync --ignore-existing` falls vorhanden, sonst `cp -rn`.
- `--dry-run`: zeigt an, was passieren würde, ohne Änderungen vorzunehmen.

Offizielle Links
----------------

- Website: https://nextcloud.com/de/
- Upstream-Repo: https://github.com/nextcloud/server
- Releases: https://github.com/nextcloud/server/releases

Manueller ZIP-Import
-------------------

Wie bei jVerein: ZIP entpacken, `LICENSE` ergänzen und Hinweis auf Upstream-Quelle hinzufügen.
Import / Vendor workflow for Nextcloud
=====================================

Dieses Verzeichnis ist als lokaler Fork von Nextcloud gedacht. Verwende `../scripts/clone_nextcloud.sh` um das Upstream-Repository (https://github.com/nextcloud/server) zu klonen oder Dateien per ZIP zu importieren.

Flags im `scripts/clone_nextcloud.sh`

- `--force`  : löscht das Zielverzeichnis und klont neu (destruktiv).
- `--update` : wenn `vendor/nextcloud` bereits ein Git-Checkout ist, führt `git fetch` und `git reset --hard origin/<branch>` aus.
- `--merge`  : klont in ein temporäres Verzeichnis und kopiert anschließend nur Dateien, die im Ziel noch nicht existieren (überschreibt nichts). Nutzt `rsync --ignore-existing` falls vorhanden, sonst `cp -rn`.
- `--dry-run`: zeigt an, was passieren würde, ohne Änderungen vorzunehmen.

Offizielle Links
----------------

- Website: https://nextcloud.com/de/
- Upstream-Repo: https://github.com/nextcloud/server
- Releases: https://github.com/nextcloud/server/releases

Manueller ZIP-Import
-------------------

Wie bei jVerein: ZIP entpacken, `LICENSE` ergänzen und Hinweis auf Upstream-Quelle hinzufügen.
