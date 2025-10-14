<template>
  <div class="mandanten-dashboard">
    <h2>Mandanten-Dashboard</h2>

    <div class="dashboard-grid">
      <!-- Übersichtskacheln -->
      <div class="metric-card">
        <h3>Gesamtnoten</h3>
        <div class="metric-value">{{ dashboardData.total_scores }}</div>
        <div class="metric-change">+5 diese Woche</div>
      </div>

      <div class="metric-card">
        <h3>Gesamtstimmen</h3>
        <div class="metric-value">{{ dashboardData.total_parts }}</div>
        <div class="metric-change">+12 diese Woche</div>
      </div>

      <div class="metric-card">
        <h3>Fehlende Stimmen</h3>
        <div class="metric-value warning">{{ dashboardData.missing_parts }}</div>
        <div class="metric-change">2 hoch priorisiert</div>
      </div>

      <div class="metric-card">
        <h3>Aktive Benutzer</h3>
        <div class="metric-value">{{ dashboardData.active_users }}</div>
        <div class="metric-change">Online jetzt</div>
      </div>

      <div class="metric-card">
        <h3>Bevorstehende Termine</h3>
        <div class="metric-value">{{ dashboardData.upcoming_events }}</div>
        <div class="metric-change">Diese Woche</div>
      </div>

      <div class="metric-card">
        <h3>Speichernutzung</h3>
        <div class="metric-value">{{ dashboardData.storage_used }}</div>
        <div class="metric-change">24% belegt</div>
      </div>
    </div>

    <!-- Fortschrittsbalken -->
    <div class="progress-section">
      <h3>Notenvollständigkeit</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: completionRate + '%' }"></div>
      </div>
      <div class="progress-text">{{ completionRate.toFixed(1) }}% vollständig</div>
    </div>

    <!-- Fehlende Stimmen -->
    <div class="missing-parts-section">
      <h3>Fehlende Stimmen</h3>
      <div v-if="missingParts.length > 0" class="missing-parts-list">
        <div v-for="item in missingParts" :key="item.score_id" class="missing-part-item" :class="item.priority">
          <div class="score-title">{{ item.score_title }}</div>
          <div class="missing-list">
            Fehlt: {{ item.missing_parts.join(', ') }}
          </div>
          <div class="priority-badge" :class="item.priority">{{ item.priority }}</div>
        </div>
      </div>
      <p v-else>Alle Stimmen vorhanden! 🎉</p>
    </div>

    <!-- Letzte Aktivitäten -->
    <div class="activity-section">
      <h3>Letzte Aktivitäten</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivity" :key="activity.timestamp" class="activity-item">
          <div class="activity-icon" :class="activity.type">{{ getActivityIcon(activity.type) }}</div>
          <div class="activity-content">
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-meta">
              {{ activity.user }} • {{ formatTime(activity.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schnellaktionen -->
    <div class="quick-actions">
      <h3>Schnellaktionen</h3>
      <div class="action-buttons">
        <button @click="quickImport" class="action-btn">📤 Import starten</button>
        <button @click="quickExport" class="action-btn">📦 Export erstellen</button>
        <button @click="scheduleBackup" class="action-btn">💾 Backup planen</button>
        <button @click="viewCalendar" class="action-btn">📅 Kalender öffnen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MandantenDashboard',
  data() {
    return {
      dashboardData: {
        total_scores: 0,
        total_parts: 0,
        missing_parts: 0,
        active_users: 0,
        upcoming_events: 0,
        storage_used: '0 GB'
      },
      completionRate: 0,
      missingParts: [],
      recentActivity: []
    }
  },
  mounted() {
    this.loadDashboardData()
    this.loadMissingParts()
    this.loadRecentActivity()
  },
  methods: {
    async loadDashboardData() {
      try {
        // API-Aufruf für aggregierte Dashboard-Daten
        const response = await fetch('/mandant/dashboard', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          this.dashboardData = data
          this.completionRate = ((data.total_parts - data.missing_parts) / data.total_parts) * 100
        } else {
          console.error('Fehler beim Laden der Dashboard-Daten')
          // Fallback auf Demo-Daten
          this.loadDemoData()
        }
      } catch (error) {
        console.error('API-Fehler:', error)
        this.loadDemoData()
      }
    },
    loadDemoData() {
      this.dashboardData = {
        total_scores: 147,
        total_parts: 441,
        missing_parts: 23,
        active_users: 8,
        upcoming_events: 5,
        storage_used: '2.4 GB'
      }
      this.completionRate = ((this.dashboardData.total_parts - this.dashboardData.missing_parts) / this.dashboardData.total_parts) * 100
    },
    async loadMissingParts() {
      // Hier würde eine API-Anfrage erfolgen
      this.missingParts = [
        {
          score_id: 1,
          score_title: 'Beethoven - Symphonie Nr. 5',
          missing_parts: ['Violine 1', 'Violine 2'],
          priority: 'high'
        },
        {
          score_id: 2,
          score_title: 'Mozart - Zauberflöte',
          missing_parts: ['Klarinette'],
          priority: 'medium'
        },
        {
          score_id: 3,
          score_title: 'Bach - Brandenburgisches Konzert Nr. 3',
          missing_parts: ['Trompete', 'Pauke'],
          priority: 'low'
        }
      ]
    },
    async loadRecentActivity() {
      // Hier würde eine API-Anfrage erfolgen
      this.recentActivity = [
        {
          type: 'upload',
          description: 'Neue Note hochgeladen: Beethoven - Mondscheinsonate',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Anna Müller'
        },
        {
          type: 'event',
          description: 'Probe am 20.01.2024 bestätigt',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Thomas Schmidt'
        },
        {
          type: 'export',
          description: 'ZIP-Export erstellt (Standard-Layout)',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: 'Lisa Wagner'
        }
      ]
    },
    getActivityIcon(type) {
      const icons = {
        upload: '📤',
        event: '📅',
        export: '📦',
        backup: '💾'
      }
      return icons[type] || '📝'
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffHours < 1) return 'Gerade eben'
      if (diffHours < 24) return `vor ${diffHours}h`
      return date.toLocaleDateString('de-DE')
    },
    getAuthToken() {
      // Token aus localStorage oder Session holen
      return localStorage.getItem('auth_token') || ''
    },
      // Navigation zum Import
      this.$emit('navigate', 'import')
    },
    quickExport() {
      // Navigation zum Export
      this.$emit('navigate', 'export')
    },
    scheduleBackup() {
      alert('Backup-Planung würde geöffnet werden...')
    },
    viewCalendar() {
      // Navigation zum Kalender
      this.$emit('navigate', 'calendar')
    }
  }
}
</script>

<style scoped>
.mandanten-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}
.metric-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  text-transform: uppercase;
}
.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.metric-value.warning {
  color: #dc3545;
}
.metric-change {
  font-size: 12px;
  color: #28a745;
}
.progress-section {
  margin-bottom: 40px;
}
.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}
.progress-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}
.progress-text {
  text-align: center;
  font-weight: bold;
}
.missing-parts-section, .activity-section {
  margin-bottom: 40px;
}
.missing-parts-list {
  display: grid;
  gap: 15px;
}
.missing-part-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.missing-part-item.high {
  border-left: 4px solid #dc3545;
}
.missing-part-item.medium {
  border-left: 4px solid #ffc107;
}
.missing-part-item.low {
  border-left: 4px solid #28a745;
}
.score-title {
  font-weight: bold;
}
.missing-list {
  color: #666;
}
.priority-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  text-transform: uppercase;
}
.priority-badge.high {
  background-color: #f8d7da;
  color: #721c24;
}
.priority-badge.medium {
  background-color: #fff3cd;
  color: #856404;
}
.priority-badge.low {
  background-color: #d1edff;
  color: #0c5460;
}
.activity-list {
  display: grid;
  gap: 15px;
}
.activity-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.activity-icon {
  font-size: 24px;
  margin-right: 15px;
}
.activity-description {
  font-weight: 500;
}
.activity-meta {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}
.quick-actions {
  margin-bottom: 40px;
}
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}
.action-btn {
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.action-btn:hover {
  background: #0056b3;
}
</style>