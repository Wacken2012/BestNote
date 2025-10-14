<template>
  <div class="backup-restore">
    <h2>Backup & Restore</h2>

    <div class="backup-section">
      <h3>Backup erstellen</h3>
      <div class="backup-options">
        <label>
          <input type="checkbox" v-model="backupOptions.includeDatabase" />
          Datenbank einschließen
        </label>
        <label>
          <input type="checkbox" v-model="backupOptions.includeFiles" />
          Dateien einschließen
        </label>
      </div>
      <button @click="createBackup" :disabled="creatingBackup" class="backup-btn">
        {{ creatingBackup ? 'Backup wird erstellt...' : 'Backup erstellen' }}
      </button>

      <div v-if="backupResult" class="backup-result">
        <h4>Backup-Ergebnis</h4>
        <p v-if="backupResult.success">
          ✅ Backup erfolgreich erstellt: {{ backupResult.filename }} ({{ formatFileSize(backupResult.size) }})
          <br>
          <a :href="getDownloadUrl(backupResult.filename)" target="_blank">Download</a>
        </p>
        <p v-else class="error">
          ❌ Backup fehlgeschlagen: {{ backupResult.error }}
        </p>
      </div>
    </div>

    <div class="restore-section">
      <h3>Backup wiederherstellen</h3>
      <div class="restore-options">
        <input type="file" @change="handleBackupFile" accept=".zip" ref="backupFileInput" />
        <button @click="$refs.backupFileInput.click()">Backup-Datei auswählen</button>
        <p v-if="selectedBackupFile">{{ selectedBackupFile.name }}</p>
      </div>

      <div v-if="selectedBackupFile" class="restore-options">
        <h4>Wiederherstellungsoptionen</h4>
        <label>
          <input type="checkbox" v-model="restoreOptions.database" />
          Datenbank wiederherstellen
        </label>
        <label>
          <input type="checkbox" v-model="restoreOptions.files" />
          Dateien wiederherstellen
        </label>
        <div class="warning">
          ⚠️ Vorsicht: Dies überschreibt vorhandene Daten!
        </div>
        <button @click="restoreBackup" :disabled="restoringBackup" class="restore-btn">
          {{ restoringBackup ? 'Wiederherstellung läuft...' : 'Backup wiederherstellen' }}
        </button>
      </div>

      <div v-if="restoreResult" class="restore-result">
        <h4>Wiederherstellungs-Ergebnis</h4>
        <div v-if="restoreResult.success">
          <p>✅ Backup erfolgreich wiederhergestellt!</p>
          <ul>
            <li v-if="restoreResult.restore_results.database_restored">Datenbank: Wiederhergestellt</li>
            <li v-if="restoreResult.restore_results.files_restored">Dateien: Wiederhergestellt</li>
          </ul>
          <div v-if="restoreResult.restore_results.errors.length > 0" class="warning">
            Warnungen:
            <ul>
              <li v-for="error in restoreResult.restore_results.errors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
        <p v-else class="error">
          ❌ Wiederherstellung fehlgeschlagen: {{ restoreResult.error }}
        </p>
      </div>
    </div>

    <div class="softnote-import-section">
      <h3>SoftNote Import</h3>
      <p>Importieren Sie Daten aus SoftNote-Backups (ZIP oder CSV).</p>
      <div class="import-options">
        <input type="file" @change="handleSoftNoteFile" accept=".zip,.csv" ref="softnoteFileInput" />
        <button @click="$refs.softnoteFileInput.click()">SoftNote-Datei auswählen</button>
        <p v-if="selectedSoftNoteFile">{{ selectedSoftNoteFile.name }}</p>
      </div>

      <button @click="importSoftNote" :disabled="importingSoftNote" class="import-btn">
        {{ importingSoftNote ? 'Import läuft...' : 'SoftNote Import starten' }}
      </button>

      <div v-if="softnoteImportResult" class="import-result">
        <h4>Import-Ergebnis</h4>
        <div v-if="softnoteImportResult.success">
          <p>✅ SoftNote-Import erfolgreich!</p>
          <ul>
            <li>Noten importiert: {{ softnoteImportResult.import_results.scores_imported }}</li>
            <li>Dateien importiert: {{ softnoteImportResult.import_results.files_imported }}</li>
          </ul>
          <div v-if="softnoteImportResult.import_results.errors.length > 0" class="warning">
            Warnungen:
            <ul>
              <li v-for="error in softnoteImportResult.import_results.errors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
        <p v-else class="error">
          ❌ Import fehlgeschlagen: {{ softnoteImportResult.error }}
        </p>
      </div>
    </div>

    <div class="backup-history">
      <h3>Backup-Historie</h3>
      <div v-if="backupHistory.length > 0" class="backup-list">
        <div v-for="backup in backupHistory" :key="backup.filename" class="backup-item">
          <div class="backup-info">
            <div class="backup-name">{{ backup.filename }}</div>
            <div class="backup-details">
              Größe: {{ formatFileSize(backup.size) }} |
              Erstellt: {{ formatDate(backup.created_at) }} |
              Inhalt: {{ getBackupContent(backup) }}
            </div>
          </div>
          <div class="backup-actions">
            <button @click="downloadBackup(backup)" class="action-btn">Download</button>
            <button @click="deleteBackup(backup)" class="action-btn delete">Löschen</button>
          </div>
        </div>
      </div>
      <p v-else>Keine Backups vorhanden.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BackupRestore',
  data() {
    return {
      backupOptions: {
        includeDatabase: true,
        includeFiles: true
      },
      restoreOptions: {
        database: true,
        files: true
      },
      creatingBackup: false,
      restoringBackup: false,
      importingSoftNote: false,
      backupResult: null,
      restoreResult: null,
      softnoteImportResult: null,
      selectedBackupFile: null,
      selectedSoftNoteFile: null,
      backupHistory: []
    }
  },
  mounted() {
    this.loadBackupHistory()
  },
  methods: {
    async createBackup() {
      this.creatingBackup = true
      this.backupResult = null

      try {
        // Hier würde eine API-Anfrage erfolgen
        // Für Demo simulieren wir ein erfolgreiches Backup
        await new Promise(resolve => setTimeout(resolve, 3000))

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '')
        const filename = `backup_mandant_1_${timestamp}.zip`

        this.backupResult = {
          success: true,
          filename: filename,
          size: 2560000, // 2.5 MB
          timestamp: timestamp
        }

        // Historie aktualisieren
        this.loadBackupHistory()

      } catch (error) {
        this.backupResult = {
          success: false,
          error: 'Backup-Fehler: ' + error.message
        }
      } finally {
        this.creatingBackup = false
      }
    },

    handleBackupFile(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedBackupFile = file
      }
    },

    async restoreBackup() {
      if (!this.selectedBackupFile) return

      this.restoringBackup = true
      this.restoreResult = null

      try {
        // Hier würde die echte Restore-API-Anfrage erfolgen
        // Für Demo simulieren wir eine erfolgreiche Wiederherstellung
        await new Promise(resolve => setTimeout(resolve, 5000))

        this.restoreResult = {
          success: true,
          restore_results: {
            database_restored: this.restoreOptions.database,
            files_restored: this.restoreOptions.files,
            errors: []
          }
        }

      } catch (error) {
        this.restoreResult = {
          success: false,
          error: 'Restore-Fehler: ' + error.message
        }
      } finally {
        this.restoringBackup = false
      }
    },

    handleSoftNoteFile(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedSoftNoteFile = file
      }
    },

    async importSoftNote() {
      if (!this.selectedSoftNoteFile) return

      this.importingSoftNote = true
      this.softnoteImportResult = null

      try {
        // Hier würde die SoftNote-Import-API-Anfrage erfolgen
        // Für Demo simulieren wir einen erfolgreichen Import
        await new Promise(resolve => setTimeout(resolve, 4000))

        this.softnoteImportResult = {
          success: true,
          import_results: {
            scores_imported: 25,
            files_imported: 15,
            errors: []
          }
        }

      } catch (error) {
        this.softnoteImportResult = {
          success: false,
          error: 'SoftNote-Import fehlgeschlagen: ' + error.message
        }
      } finally {
        this.importingSoftNote = false
      }
    },

    async loadBackupHistory() {
      // Hier würde eine API-Anfrage erfolgen
      // Für Demo laden wir Beispiel-Historie
      this.backupHistory = [
        {
          filename: 'backup_mandant_1_20240115_143000.zip',
          size: 2560000,
          created_at: '2024-01-15T14:30:00',
          includes_files: true,
          includes_database: true
        },
        {
          filename: 'backup_mandant_1_20240110_090000.zip',
          size: 1890000,
          created_at: '2024-01-10T09:00:00',
          includes_files: false,
          includes_database: true
        },
        {
          filename: 'backup_mandant_1_20240105_160000.zip',
          size: 3200000,
          created_at: '2024-01-05T16:00:00',
          includes_files: true,
          includes_database: true
        }
      ]
    },

    downloadBackup(backup) {
      // Hier würde der Download gestartet werden
      alert(`Download von ${backup.filename} würde starten...`)
    },

    deleteBackup(backup) {
      if (confirm(`Backup "${backup.filename}" wirklich löschen?`)) {
        // Hier würde eine API-Anfrage erfolgen
        const index = this.backupHistory.indexOf(backup)
        if (index > -1) {
          this.backupHistory.splice(index, 1)
        }
      }
    },

    getDownloadUrl(filename) {
      // Platzhalter für Download-URL
      return '#'
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE')
    },

    getBackupContent(backup) {
      const content = []
      if (backup.includes_database) content.push('Datenbank')
      if (backup.includes_files) content.push('Dateien')
      return content.join(', ') || 'Unbekannt'
    }
  }
}
</script>

<style scoped>
.backup-restore {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.backup-section, .restore-section, .softnote-import-section, .backup-history {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.backup-options, .restore-options, .import-options {
  margin: 15px 0;
}
.backup-options label, .restore-options label, .import-options label {
  display: block;
  margin-bottom: 10px;
}
input[type="file"] {
  display: none;
}
button {
  margin: 10px 10px 10px 0;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.backup-btn {
  background: #28a745;
}
.backup-btn:hover {
  background: #218838;
}
.restore-btn {
  background: #ffc107;
  color: #212529;
}
.restore-btn:hover {
  background: #e0a800;
}
.import-btn {
  background: #17a2b8;
}
.import-btn:hover {
  background: #138496;
}
.warning {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
.error {
  color: #dc3545;
  font-weight: bold;
}
.backup-result, .restore-result, .import-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}
.backup-result p, .restore-result p, .import-result p {
  margin: 5px 0;
}
.backup-list {
  display: grid;
  gap: 15px;
}
.backup-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.backup-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.backup-details {
  font-size: 12px;
  color: #666;
}
.backup-actions {
  display: flex;
  gap: 10px;
}
.action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
.action-btn.delete {
  color: #dc3545;
}
</style>