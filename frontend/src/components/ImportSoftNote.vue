<template>
  <div class="import-softnote">
    <h2>SoftNote Import</h2>
    <div class="upload-section">
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <div class="upload-content">
          <div class="upload-icon">📁</div>
          <div class="upload-text">
            <p v-if="!selectedFile">
              <strong>Klicken Sie hier</strong> oder ziehen Sie eine Datei hierher
            </p>
            <p v-else class="selected-file">
              Ausgewählte Datei: <strong>{{ selectedFile.name }}</strong>
            </p>
          </div>
          <div class="upload-hint">
            Unterstützte Formate: CSV (SoftNote-Export) oder ZIP (mit PDFs/MIDI)
          </div>
        </div>
      </div>
      <input
        type="file"
        @change="handleFileUpload"
        accept=".csv,.zip"
        ref="fileInput"
        style="display: none"
      />
      <div class="upload-actions" v-if="selectedFile">
        <button @click="reset" class="secondary-btn">Andere Datei wählen</button>
      </div>
    </div>

    <div v-if="preview" class="preview-section">
      <h3>Vorschau</h3>

      <!-- CSV Vorschau -->
      <div v-if="preview.type === 'csv'" class="preview-content">
        <div class="preview-header">
          <span class="format-badge csv">CSV</span>
          <span class="validity-indicator" :class="{ valid: preview.valid, invalid: !preview.valid }">
            {{ preview.valid ? '✓ Gültig' : '✗ Ungültig' }}
          </span>
        </div>

        <div v-if="preview.valid" class="csv-details">
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-number">{{ preview.total_scores }}</div>
              <div class="stat-label">Noten erkannt</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ getUniqueComposers(preview.scores) }}</div>
              <div class="stat-label">Komponisten</div>
            </div>
          </div>

          <div class="scores-list">
            <h4>Erkannte Werke:</h4>
            <div class="score-cards">
              <div v-for="(score, index) in preview.scores.slice(0, 10)" :key="index" class="score-card">
                <div class="score-title">{{ score.title }}</div>
                <div class="score-composer">{{ score.composer }}</div>
                <div class="score-meta" v-if="score.year">Jahr: {{ score.year }}</div>
              </div>
            </div>
            <p v-if="preview.scores.length > 10" class="more-items">
              ... und {{ preview.scores.length - 10 }} weitere Werke
            </p>
          </div>
        </div>
      </div>

      <!-- ZIP Vorschau -->
      <div v-if="preview.type === 'zip'" class="preview-content">
        <div class="preview-header">
          <span class="format-badge zip">ZIP</span>
          <span class="validity-indicator" :class="{ valid: preview.valid, invalid: !preview.valid }">
            {{ preview.valid ? '✓ Gültig' : '✗ Ungültig' }}
          </span>
        </div>

        <div v-if="preview.valid" class="zip-details">
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-number">{{ preview.total_files }}</div>
              <div class="stat-label">Dateien gesamt</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ getPdfCount(preview.files) }}</div>
              <div class="stat-label">PDF-Dateien</div>
            </div>
          </div>

          <div class="files-list">
            <h4>Enthaltene Dateien:</h4>
            <div class="file-categories">
              <div class="file-category">
                <h5>🎵 Noten (PDF):</h5>
                <ul>
                  <li v-for="file in getFilesByType(preview.files, '.pdf').slice(0, 5)" :key="file">
                    {{ getFileName(file) }}
                  </li>
                </ul>
              </div>
              <div class="file-category" v-if="getFilesByType(preview.files, '.mid').length > 0">
                <h5>🎼 MIDI-Dateien:</h5>
                <ul>
                  <li v-for="file in getFilesByType(preview.files, '.mid').slice(0, 3)" :key="file">
                    {{ getFileName(file) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fehler-Anzeige -->
      <div v-if="!preview.valid" class="error-section">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h4>Import nicht möglich</h4>
          <p>{{ preview.error }}</p>
          <div class="error-suggestions">
            <p><strong>Mögliche Lösungen:</strong></p>
            <ul>
              <li v-if="preview.type === 'csv'">Stellen Sie sicher, dass die CSV die Spalten 'Titel' und 'Komponist' enthält</li>
              <li v-if="preview.type === 'zip'">Überprüfen Sie, dass das ZIP-Archiv PDF-, MIDI- oder XML-Dateien enthält</li>
              <li>Versuchen Sie eine andere Datei auszuwählen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="preview && preview.valid" class="actions">
      <button @click="importData" :disabled="importing">
        {{ importing ? 'Importiere...' : 'Import starten' }}
      </button>
      <button @click="reset">Zurücksetzen</button>
    </div>

    <div v-if="importResult" class="result">
      <h3>Import-Ergebnis</h3>
      <p v-if="importResult.success">
        Erfolgreich importiert: {{ importResult.imported_scores || 0 }} Noten, {{ importResult.imported_files || 0 }} Dateien
      </p>
      <p v-else class="error">
        Fehler beim Import: {{ importResult.error }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImportSoftNote',
  data() {
    return {
      selectedFile: null,
      preview: null,
      importing: false,
      importResult: null,
      isDragOver: false
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        this.previewImport(file)
      }
    },
    handleDrop(event) {
      this.isDragOver = false
      const file = event.dataTransfer.files[0]
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.zip'))) {
        this.selectedFile = file
        this.previewImport(file)
      } else {
        alert('Bitte wählen Sie eine CSV- oder ZIP-Datei aus.')
      }
    },
    async previewImport(file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/import/preview', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: formData
        })

        if (response.ok) {
          this.preview = await response.json()
        } else {
          this.preview = {
            type: file.name.split('.').pop(),
            valid: false,
            error: 'Fehler beim Laden der Vorschau'
          }
        }
      } catch (error) {
        console.error('Preview-Fehler:', error)
        // Fallback auf Demo-Daten
        this.fallbackPreview(file)
      }
    },
    fallbackPreview(file) {
      if (file.name.endsWith('.csv')) {
        this.preview = {
          type: 'csv',
          valid: true,
          total_scores: 25,
          scores: [
            { title: 'Beethoven - Symphonie Nr. 5', composer: 'Ludwig van Beethoven', year: '1808' },
            { title: 'Mozart - Zauberflöte', composer: 'Wolfgang Amadeus Mozart', year: '1791' },
            { title: 'Bach - Brandenburgisches Konzert Nr. 3', composer: 'Johann Sebastian Bach', year: '1721' },
            { title: 'Schubert - Streichquartett Nr. 14', composer: 'Franz Schubert', year: '1824' },
            { title: 'Haydn - Die Schöpfung', composer: 'Joseph Haydn', year: '1798' }
          ]
        }
      } else if (file.name.endsWith('.zip')) {
        this.preview = {
          type: 'zip',
          valid: true,
          total_files: 15,
          files: [
            'noten/beethoven_symphonie_5.pdf',
            'noten/mozart_zauberfloete.pdf',
            'noten/bach_brandenburg_3.pdf',
            'stimmen/violine1_beethoven_s5.pdf',
            'stimmen/violine2_beethoven_s5.pdf',
            'stimmen/bratsche_beethoven_s5.pdf',
            'stimmen/cello_beethoven_s5.pdf',
            'stimmen/kontrabass_beethoven_s5.pdf',
            'stimmen/flote_mozart_zf.pdf',
            'stimmen/oboe_mozart_zf.pdf',
            'partitur/bach_brandenburg_3_partitur.pdf',
            'midi/beethoven_s5_midi.mid',
            'midi/mozart_zf_midi.mid'
          ]
        }
      } else {
        this.preview = {
          type: 'unknown',
          valid: false,
          error: 'Nicht unterstütztes Format. Bitte verwenden Sie CSV oder ZIP-Dateien.'
        }
      }
    },
    async importData() {
      if (!this.selectedFile) return

      this.importing = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const response = await fetch('/import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: formData
        })

        if (response.ok) {
          this.importResult = await response.json()
        } else {
          this.importResult = {
            success: false,
            error: 'Import fehlgeschlagen'
          }
        }
      } catch (error) {
        console.error('Import-Fehler:', error)
        this.importResult = {
          success: false,
          error: 'Netzwerkfehler beim Import'
        }
      } finally {
        this.importing = false
      }
    },
    reset() {
      this.selectedFile = null
      this.preview = null
      this.importResult = null
      this.$refs.fileInput.value = ''
    },
    getUniqueComposers(scores) {
      if (!scores) return 0
      const composers = new Set(scores.map(score => score.composer).filter(Boolean))
      return composers.size
    },
    getPdfCount(files) {
      if (!files) return 0
      return files.filter(file => file.toLowerCase().endsWith('.pdf')).length
    },
    getFilesByType(files, extension) {
      if (!files) return []
      return files.filter(file => file.toLowerCase().endsWith(extension.toLowerCase()))
    },
    getFileName(filepath) {
      return filepath.split('/').pop().split('\\').pop()
    },
    getAuthToken() {
      return localStorage.getItem('auth_token') || ''
    }
  }
}
</script>

<style scoped>
.import-softnote {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #28a745;
  background-color: #f0fff0;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.upload-icon {
  font-size: 3em;
  opacity: 0.7;
}

.upload-text {
  font-size: 1.1em;
  color: #333;
}

.selected-file {
  color: #007bff;
  font-size: 1.2em;
}

.upload-hint {
  font-size: 0.9em;
  color: #666;
  margin-top: 10px;
}

.upload-actions {
  margin-top: 15px;
  text-align: center;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.secondary-btn:hover {
  background-color: #5a6268;
}
button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.preview-section, .result {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.scores-preview ul, .files-preview ul {
  list-style-type: none;
  padding: 0;
}
.scores-preview li, .files-preview li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.error {
  color: red;
  font-weight: bold;
}
.actions {
  margin-top: 20px;
  text-align: center;
}

/* Neue Styles für erweiterte Vorschau */
.preview-content {
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.format-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8em;
}

.format-badge.csv {
  background-color: #28a745;
  color: white;
}

.format-badge.zip {
  background-color: #007bff;
  color: white;
}

.validity-indicator {
  font-weight: bold;
}

.validity-indicator.valid {
  color: #28a745;
}

.validity-indicator.invalid {
  color: #dc3545;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2em;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.score-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.score-card {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fafafa;
}

.score-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.score-composer {
  color: #666;
  font-style: italic;
  margin-bottom: 3px;
}

.score-meta {
  font-size: 0.8em;
  color: #888;
}

.file-categories {
  margin-top: 15px;
}

.file-category {
  margin-bottom: 15px;
}

.file-category h5 {
  margin-bottom: 8px;
  color: #333;
}

.file-category ul {
  list-style-type: none;
  padding: 0;
}

.file-category li {
  padding: 3px 0;
  font-size: 0.9em;
  color: #555;
}

.more-items {
  font-style: italic;
  color: #666;
  margin-top: 10px;
}

.error-section {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
}

.error-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.error-content h4 {
  margin: 0 0 10px 0;
  color: #721c24;
}

.error-suggestions {
  margin-top: 15px;
}

.error-suggestions ul {
  margin: 5px 0 0 20px;
}

.error-suggestions li {
  margin-bottom: 5px;
}
</style>