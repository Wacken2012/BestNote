<template>
  <div class="export-center">
    <h2>Export</h2>
    <h3>Export-Center</h3>

    <div class="export-form">
      <div class="form-group">
        <label for="layout">Layout wählen:</label>
        <select v-model="selectedLayout" id="layout" @change="updatePreview">
          <option v-for="(layout, key) in layouts" :key="key" :value="key">
            {{ layout.name }} - {{ layout.description }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="includePdfs" />
          PDFs einschließen
        </label>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="includeMetadata" />
          Metadaten einschließen
        </label>
      </div>

      <button @click="startExport" :disabled="exporting" class="export-button">
        {{ exporting ? 'Exportiere...' : 'Export starten' }}
      </button>
    </div>

    <!-- Layout-Vorschau -->
    <div class="layout-preview" v-if="selectedLayout && layouts && layouts[selectedLayout]">
      <h3>Layout-Vorschau: {{ layouts[selectedLayout].name }}</h3>
      <div class="preview-container">
        <div class="preview-mockup" :class="selectedLayout">
          <!-- Standard Layout -->
          <div v-if="selectedLayout === 'standard'" class="standard-preview">
            <div class="preview-header">
              <h4>📄 BestNote Export - Mandant 1</h4>
              <p>Standard-Layout mit Titelseite</p>
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="icon">📖</span>
                <span>README.txt - Export-Informationen</span>
              </div>
              <div class="preview-item">
                <span class="icon">🌐</span>
                <span>index.html - Übersichtsseite</span>
              </div>
              <div class="preview-item" v-if="includePdfs">
                <span class="icon">📄</span>
                <span>pdfs/ - Alle Noten-PDFs</span>
              </div>
              <div class="preview-item" v-if="includeMetadata">
                <span class="icon">📋</span>
                <span>metadata.json - Export-Details</span>
              </div>
            </div>
          </div>

          <!-- Kompakt Layout -->
          <div v-if="selectedLayout === 'compact'" class="compact-preview">
            <div class="preview-header">
              <h4>📦 Kompakter Export</h4>
              <p>Platzsparendes Layout ohne Titelseite</p>
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="icon">📝</span>
                <span>README.txt - Minimale Info</span>
              </div>
              <div class="preview-item" v-if="includePdfs">
                <span class="icon">📄</span>
                <span>pdfs/ - Noten-Dateien</span>
              </div>
              <div class="preview-item" v-if="includeMetadata">
                <span class="icon">📋</span>
                <span>metadata.json</span>
              </div>
            </div>
          </div>

          <!-- Digital Layout -->
          <div v-if="selectedLayout === 'digital'" class="digital-preview">
            <div class="preview-header">
              <h4>💻 Digital-optimiertes Archiv</h4>
              <p>Für Bildschirmdarstellung optimiert</p>
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="icon">🌐</span>
                <span>index.html - Web-Optimierte Übersicht</span>
              </div>
              <div class="preview-item" v-if="includePdfs">
                <span class="icon">📱</span>
                <span>pdfs/ - Bildschirm-optimierte PDFs</span>
              </div>
              <div class="preview-item" v-if="includeMetadata">
                <span class="icon">📊</span>
                <span>metadata.json - Digitale Metadaten</span>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-info">
          <h4>Layout-Details</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Größe:</strong> {{ getLayoutSize(selectedLayout) }}
            </div>
            <div class="info-item">
              <strong>PDFs:</strong> {{ includePdfs ? 'Eingeschlossen' : 'Ausgeschlossen' }}
            </div>
            <div class="info-item">
              <strong>Metadaten:</strong> {{ includeMetadata ? 'Eingeschlossen' : 'Ausgeschlossen' }}
            </div>
            <div class="info-item">
              <strong>Verwendung:</strong> {{ layouts[selectedLayout].description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="exportResult" class="export-result">
      <h3>Export-Ergebnis</h3>
      <p v-if="exportResult.success">
        Export erfolgreich erstellt: <a :href="exportResult.downloadUrl" target="_blank">{{ exportResult.filename }}</a>
      </p>
      <p v-else class="error">
        Fehler beim Export: {{ exportResult.error }}
      </p>
    </div>

    <div class="export-history">
      <h3>Export-Historie</h3>
      <table v-if="history.length > 0">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Layout</th>
            <th>Größe</th>
            <th>Status</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>{{ formatDate(item.date) }}</td>
            <td>{{ layouts[item.layout]?.name || item.layout }}</td>
            <td>{{ item.file_size }}</td>
            <td :class="item.status">{{ item.status }}</td>
            <td>
              <button v-if="item.status === 'completed'" @click="downloadExport(item)">Download</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Keine Export-Historie vorhanden.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportCenter',
  data() {
    return {
      selectedLayout: 'standard',
      includePdfs: true,
      includeMetadata: true,
      exporting: false,
      exportResult: null,
      layouts: {},
      history: []
    }
  },
  mounted() {
    this.loadLayouts()
    this.loadExportHistory()
  },
  methods: {
    updatePreview() {
      // Vorschau wird automatisch durch reactive selectedLayout aktualisiert
    },
    getLayoutSize(layout) {
      const sizes = {
        standard: '~2-5 MB',
        compact: '~1-3 MB',
        digital: '~2-4 MB'
      }
      return sizes[layout] || 'Unbekannt'
    },
    async loadLayouts() {
      try {
        const response = await fetch('/export/layouts', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          this.layouts = await response.json();
        } else {
          // Fallback auf statische Layouts
          console.error('Layout-Fehler: Kein JSON vom Server, Fallback auf Demo-Layouts');
          this.loadDemoLayouts();
        }
      } catch (error) {
        console.error('Layout-Fehler:', error);
        this.loadDemoLayouts();
      }
    },
    loadDemoLayouts() {
      this.layouts = {
        standard: {
          name: 'Standard-Layout',
          description: 'Klassisches Notenlayout mit Titelseite'
        },
        compact: {
          name: 'Kompakt-Layout',
          description: 'Platzsparendes Layout ohne Titelseite'
        },
        digital: {
          name: 'Digital-Optimiert',
          description: 'Für Bildschirmdarstellung optimiert'
        }
      }
    },
    async loadExportHistory() {
      try {
        const response = await fetch('/export/history', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          this.history = await response.json();
        } else {
          // Fallback auf Demo-Daten
          console.error('History-Fehler: Kein JSON vom Server, Fallback auf Demo-History');
          this.loadDemoHistory();
        }
      } catch (error) {
        console.error('History-Fehler:', error);
        this.loadDemoHistory();
      }
    },
    loadDemoHistory() {
      this.history = [
        {
          id: 1,
          date: '2024-01-15T10:30:00',
          layout: 'standard',
          file_size: '2.5 MB',
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-10T14:20:00',
          layout: 'compact',
          file_size: '1.8 MB',
          status: 'completed'
        }
      ]
    },
    async startExport() {
      this.exporting = true
      this.exportResult = null

      try {
        const response = await fetch('/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            layout: this.selectedLayout,
            include_pdfs: this.includePdfs,
            include_metadata: this.includeMetadata
          })
        })

        if (response.ok) {
          const result = await response.json()
          this.exportResult = {
            success: true,
            filename: result.filename,
            downloadUrl: result.download_url
          }
        } else {
          const error = await response.json()
          this.exportResult = {
            success: false,
            error: error.detail || 'Export fehlgeschlagen'
          }
        }
      } catch (error) {
        console.error('Export-Fehler:', error)
        this.exportResult = {
          success: false,
          error: 'Netzwerkfehler beim Export'
        }
      } finally {
        this.exporting = false
      }
    },
    downloadExport(item) {
      // Hier würde der Download der historischen Export-Datei erfolgen
      alert(`Download von ${item.file_size} Export würde starten...`)
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE')
    },
    getAuthToken() {
      return localStorage.getItem('auth_token') || ''
    }
  }
}
</script>

<style scoped>
.export-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.export-form {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
select, input[type="checkbox"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.export-button {
  padding: 12px 24px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.export-button:hover {
  background-color: #218838;
}
.export-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.export-result {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.export-result a {
  color: #007bff;
  text-decoration: none;
}
.export-result a:hover {
  text-decoration: underline;
}
.export-history table {
  width: 100%;
  border-collapse: collapse;
}
.export-history th, .export-history td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}
.export-history th {
  background-color: #f8f9fa;
}
.completed {
  color: #28a745;
}
.error {
  color: red;
}
</style>