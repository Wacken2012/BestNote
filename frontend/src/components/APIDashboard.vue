<template>
  <div class="api-dashboard">
    <h2>API-Dashboard</h2>

    <div class="dashboard-overview">
      <!-- API-Statistiken -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Gesamt-API-Aufrufe</h3>
          <div class="stat-value">{{ totalRequests }}</div>
          <div class="stat-change">+12% diese Woche</div>
        </div>

        <div class="stat-card">
          <h3>Aktive Tokens</h3>
          <div class="stat-value">{{ activeTokens }}</div>
          <div class="stat-change">von {{ totalTokens }}</div>
        </div>

        <div class="stat-card">
          <h3>Durchschnittliche Antwortzeit</h3>
          <div class="stat-value">{{ avgResponseTime }}ms</div>
          <div class="stat-change">-5ms diese Woche</div>
        </div>

        <div class="stat-card">
          <h3>Fehlerrate</h3>
          <div class="stat-value error">{{ errorRate }}%</div>
          <div class="stat-change">-0.2% diese Woche</div>
        </div>
      </div>
    </div>

    <!-- Tabs für verschiedene Bereiche -->
    <div class="dashboard-tabs">
      <button
        :class="['tab-button', { active: activeTab === 'tokens' }]"
        @click="activeTab = 'tokens'"
      >
        API-Tokens
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'logs' }]"
        @click="activeTab = 'logs'"
      >
        Zugriffslogs
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'analytics' }]"
        @click="activeTab = 'analytics'"
      >
        Analytik
      </button>
    </div>

    <!-- API-Tokens Tab -->
    <div v-if="activeTab === 'tokens'" class="tab-content">
      <div class="section-header">
        <h3>API-Tokens</h3>
        <button @click="showCreateToken = true" class="create-btn">+ Neuer Token</button>
      </div>

      <div class="tokens-list">
        <div v-for="token in tokens" :key="token.id" class="token-item">
          <div class="token-info">
            <div class="token-name">{{ token.name }}</div>
            <div class="token-details">
              <span class="token-permissions">{{ token.permissions.join(', ') }}</span>
              <span class="token-created">Erstellt: {{ formatDate(token.created_at) }}</span>
              <span class="token-usage">Verwendet: {{ token.usage_count }}x</span>
              <span v-if="token.last_used" class="token-last-used">Zuletzt: {{ formatDate(token.last_used) }}</span>
            </div>
          </div>
          <div class="token-actions">
            <span :class="['token-status', { active: token.is_active }]">
              {{ token.is_active ? 'Aktiv' : 'Inaktiv' }}
            </span>
            <button @click="toggleToken(token)" class="action-btn">
              {{ token.is_active ? 'Deaktivieren' : 'Aktivieren' }}
            </button>
            <button @click="deleteToken(token)" class="action-btn delete">Löschen</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Zugriffslogs Tab -->
    <div v-if="activeTab === 'logs'" class="tab-content">
      <div class="section-header">
        <h3>API-Zugriffslogs</h3>
        <div class="filters">
          <select v-model="logFilter.method">
            <option value="">Alle Methoden</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select v-model="logFilter.status">
            <option value="">Alle Status</option>
            <option value="200">200 OK</option>
            <option value="400">400 Bad Request</option>
            <option value="401">401 Unauthorized</option>
            <option value="500">500 Server Error</option>
          </select>
          <input v-model="logFilter.search" type="text" placeholder="Suche..." />
        </div>
      </div>

      <div class="logs-list">
        <div v-for="log in filteredLogs" :key="log.id" :class="['log-item', getLogClass(log)]">
          <div class="log-info">
            <div class="log-method">{{ log.method }}</div>
            <div class="log-endpoint">{{ log.endpoint }}</div>
            <div class="log-details">
              <span class="log-status">{{ log.status_code }}</span>
              <span class="log-time">{{ log.response_time }}ms</span>
              <span class="log-ip">{{ log.ip_address }}</span>
              <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
            </div>
          </div>
          <div v-if="log.error_message" class="log-error">
            {{ log.error_message }}
          </div>
        </div>
      </div>
    </div>

    <!-- Analytik Tab -->
    <div v-if="activeTab === 'analytics'" class="tab-content">
      <h3>API-Analytik</h3>

      <div class="analytics-grid">
        <div class="analytics-card">
          <h4>API-Aufrufe pro Stunde</h4>
          <div class="chart-placeholder">
            <div class="chart-bar" v-for="hour in hourlyStats" :key="hour.hour" :style="{ height: hour.calls * 5 + 'px' }">
              <span class="bar-value">{{ hour.calls }}</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h4>Beliebteste Endpunkte</h4>
          <ul class="endpoint-list">
            <li v-for="endpoint in popularEndpoints" :key="endpoint.path">
              {{ endpoint.path }} ({{ endpoint.calls }} Aufrufe)
            </li>
          </ul>
        </div>

        <div class="analytics-card">
          <h4>Geografische Verteilung</h4>
          <div class="geo-stats">
            <div v-for="country in geoStats" :key="country.code">
              {{ country.name }}: {{ country.requests }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Token erstellen Modal -->
    <div v-if="showCreateToken" class="modal" @click="closeCreateToken">
      <div class="modal-content" @click.stop>
        <h3>Neuer API-Token</h3>
        <form @submit.prevent="createToken">
          <div class="form-group">
            <label for="tokenName">Token-Name:</label>
            <input v-model="newToken.name" id="tokenName" required />
          </div>
          <div class="form-group">
            <label>Berechtigungen:</label>
            <div class="permissions">
              <label v-for="perm in availablePermissions" :key="perm">
                <input type="checkbox" v-model="newToken.permissions" :value="perm" />
                {{ perm }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="expiresAt">Ablaufdatum (optional):</label>
            <input v-model="newToken.expires_at" type="datetime-local" id="expiresAt" />
          </div>
          <div class="form-actions">
            <button type="submit">Erstellen</button>
            <button type="button" @click="closeCreateToken">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'APIDashboard',
  data() {
    return {
      activeTab: 'tokens',
      totalRequests: 15420,
      activeTokens: 5,
      totalTokens: 8,
      avgResponseTime: 245,
      errorRate: 0.8,
      tokens: [],
      logs: [],
      showCreateToken: false,
      newToken: {
        name: '',
        permissions: [],
        expires_at: ''
      },
      availablePermissions: ['read', 'write', 'admin'],
      logFilter: {
        method: '',
        status: '',
        search: ''
      },
      hourlyStats: [],
      popularEndpoints: [],
      geoStats: []
    }
  },
  computed: {
    filteredLogs() {
      return this.logs.filter(log => {
        if (this.logFilter.method && log.method !== this.logFilter.method) return false
        if (this.logFilter.status && log.status_code.toString() !== this.logFilter.status) return false
        if (this.logFilter.search &&
            !log.endpoint.toLowerCase().includes(this.logFilter.search.toLowerCase())) return false
        return true
      })
    }
  },
  mounted() {
    this.loadTokens()
    this.loadLogs()
    this.loadAnalytics()
  },
  methods: {
    loadTokens() {
      // Demo-Daten
      this.tokens = [
        {
          id: 1,
          name: 'Mobile App',
          permissions: ['read', 'write'],
          created_at: '2024-01-01T10:00:00',
          is_active: true,
          usage_count: 1250,
          last_used: '2024-01-15T14:30:00'
        },
        {
          id: 2,
          name: 'Web Interface',
          permissions: ['read'],
          created_at: '2024-01-05T09:15:00',
          is_active: true,
          usage_count: 890,
          last_used: '2024-01-15T16:45:00'
        },
        {
          id: 3,
          name: 'Admin Tool',
          permissions: ['read', 'write', 'admin'],
          created_at: '2024-01-10T11:20:00',
          is_active: false,
          usage_count: 45,
          last_used: '2024-01-12T08:10:00'
        }
      ]
    },

    loadLogs() {
      // Demo-Logs
      this.logs = [
        {
          id: 1,
          endpoint: '/api/scores',
          method: 'GET',
          status_code: 200,
          response_time: 145,
          ip_address: '192.168.1.100',
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 2,
          endpoint: '/api/scores/123',
          method: 'PUT',
          status_code: 200,
          response_time: 234,
          ip_address: '192.168.1.101',
          timestamp: new Date(Date.now() - 600000).toISOString()
        },
        {
          id: 3,
          endpoint: '/api/auth/login',
          method: 'POST',
          status_code: 401,
          response_time: 89,
          ip_address: '192.168.1.102',
          error_message: 'Invalid credentials',
          timestamp: new Date(Date.now() - 900000).toISOString()
        },
        {
          id: 4,
          endpoint: '/api/dashboard',
          method: 'GET',
          status_code: 200,
          response_time: 312,
          ip_address: '192.168.1.100',
          timestamp: new Date(Date.now() - 1200000).toISOString()
        }
      ]
    },

    loadAnalytics() {
      // Demo-Analytik
      this.hourlyStats = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        calls: Math.floor(Math.random() * 100) + 10
      }))

      this.popularEndpoints = [
        { path: '/api/scores', calls: 4520 },
        { path: '/api/dashboard', calls: 3210 },
        { path: '/api/auth/login', calls: 2890 },
        { path: '/api/calendar', calls: 1850 }
      ]

      this.geoStats = [
        { code: 'DE', name: 'Deutschland', requests: 65 },
        { code: 'AT', name: 'Österreich', requests: 20 },
        { code: 'CH', name: 'Schweiz', requests: 15 }
      ]
    },

    toggleToken(token) {
      token.is_active = !token.is_active
      // Hier würde eine API-Anfrage erfolgen
      alert(`Token "${token.name}" ${token.is_active ? 'aktiviert' : 'deaktiviert'}`)
    },

    deleteToken(token) {
      if (confirm(`Token "${token.name}" wirklich löschen?`)) {
        const index = this.tokens.indexOf(token)
        if (index > -1) {
          this.tokens.splice(index, 1)
        }
      }
    },

    createToken() {
      const token = {
        id: Date.now(),
        name: this.newToken.name,
        permissions: [...this.newToken.permissions],
        created_at: new Date().toISOString(),
        is_active: true,
        usage_count: 0,
        last_used: null
      }

      this.tokens.push(token)
      this.closeCreateToken()
      alert('Token erstellt! (Token-Wert würde hier angezeigt werden)')
    },

    closeCreateToken() {
      this.showCreateToken = false
      this.newToken = {
        name: '',
        permissions: [],
        expires_at: ''
      }
    },

    getLogClass(log) {
      if (log.status_code >= 500) return 'error'
      if (log.status_code >= 400) return 'warning'
      return 'success'
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE')
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)

      if (minutes < 1) return 'Gerade eben'
      if (minutes < 60) return `vor ${minutes}m`
      return date.toLocaleDateString('de-DE')
    }
  }
}
</script>

<style scoped>
.api-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}
.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.stat-value.error {
  color: #dc3545;
}
.stat-change {
  font-size: 12px;
  color: #28a745;
}
.dashboard-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}
.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 16px;
}
.tab-button.active {
  border-bottom-color: #007bff;
  color: #007bff;
}
.tab-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.create-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.tokens-list, .logs-list {
  display: grid;
  gap: 15px;
}
.token-item, .log-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.token-info {
  flex: 1;
}
.token-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.token-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}
.token-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.token-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.token-status.active {
  background: #d4edda;
  color: #155724;
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
.log-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.log-method {
  font-weight: bold;
  padding: 4px 8px;
  background: #007bff;
  color: white;
  border-radius: 4px;
}
.log-endpoint {
  flex: 1;
  font-family: monospace;
}
.log-details {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #666;
}
.log-error {
  margin-top: 10px;
  color: #dc3545;
  font-size: 14px;
}
.log-item.success {
  border-left: 4px solid #28a745;
}
.log-item.warning {
  border-left: 4px solid #ffc107;
}
.log-item.error {
  border-left: 4px solid #dc3545;
}
.filters {
  display: flex;
  gap: 10px;
}
.filters select, .filters input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.analytics-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
}
.chart-placeholder {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 150px;
  margin-top: 15px;
}
.chart-bar {
  flex: 1;
  background: #007bff;
  margin: 0 2px;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
}
.bar-value {
  color: white;
  font-size: 10px;
  font-weight: bold;
}
.endpoint-list, .geo-stats {
  list-style: none;
  padding: 0;
}
.endpoint-list li, .geo-stats div {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.permissions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.permissions label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.form-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}
.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}
</style>