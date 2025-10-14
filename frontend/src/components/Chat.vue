<template>
  <div class="chat-module">
    <h2>Chat</h2>

    <div class="chat-container">
      <!-- Kanäle-Sidebar -->
      <div class="channels-sidebar">
        <h3>Kanäle</h3>
        <div class="channel-list">
          <div
            v-for="channel in channels"
            :key="channel"
            :class="['channel-item', { active: selectedChannel === channel }]"
            @click="selectChannel(channel)"
          >
            <span class="channel-name">#{{ channel }}</span>
            <span v-if="channelStats[channel]" class="channel-users">
              {{ channelStats[channel].active_users }}
            </span>
          </div>
        </div>

        <!-- Kanal-Statistiken -->
        <div class="channel-stats">
          <h4>Statistiken</h4>
          <div v-if="selectedChannel && channelStats[selectedChannel]">
            <p>Nachrichten: {{ channelStats[selectedChannel].messages }}</p>
            <p>Aktive User: {{ channelStats[selectedChannel].active_users }}</p>
            <p v-if="channelStats[selectedChannel].last_activity">
              Letzte Aktivität: {{ formatTime(channelStats[selectedChannel].last_activity) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Chat-Bereich -->
      <div class="chat-main">
        <!-- Chat-Header -->
        <div class="chat-header">
          <h3>#{{ selectedChannel }}</h3>
          <div class="connection-status" :class="connectionStatus">
            {{ connectionStatusText }}
          </div>
        </div>

        <!-- Nachrichten-Bereich -->
        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="message in messages"
            :key="message.timestamp"
            :class="['message-item', message.type]"
          >
            <div class="message-header">
              <span class="message-user">{{ message.user }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>

          <!-- Lade-Indikator -->
          <div v-if="loadingMessages" class="loading-messages">
            Lade Nachrichten...
          </div>
        </div>

        <!-- Nachrichten-Eingabe -->
        <div class="message-input">
          <form @submit.prevent="sendMessage">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Nachricht eingeben..."
              :disabled="!isConnected"
              maxlength="500"
            />
            <button type="submit" :disabled="!isConnected || !newMessage.trim()">
              Senden
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Benutzerliste (optional) -->
    <div class="users-sidebar">
      <h3>Online ({{ onlineUsers.length }})</h3>
      <div class="users-list">
        <div v-for="user in onlineUsers" :key="user.id" class="user-item">
          <span class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</span>
          <span class="user-name">{{ user.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      selectedChannel: 'allgemein',
      messages: [],
      newMessage: '',
      isConnected: false,
      connectionStatus: 'disconnected',
      connectionStatusText: 'Nicht verbunden',
      channels: ['allgemein', 'proben', 'auftritte', 'technik', 'verwaltung'],
      channelStats: {},
      onlineUsers: [],
      loadingMessages: false,
      websocket: null
    }
  },
  mounted() {
    this.connectToChat()
  },
  beforeUnmount() {
    this.disconnectFromChat()
  },
  methods: {
    async connectToChat() {
      try {
        // WebSocket-Verbindung (Platzhalter-URL)
        const wsUrl = `ws://localhost:8000/ws/chat/1/${this.selectedChannel}` // mandant_id = 1
        this.websocket = new WebSocket(wsUrl)

        this.websocket.onopen = () => {
          this.isConnected = true
          this.connectionStatus = 'connected'
          this.connectionStatusText = 'Verbunden'
          this.loadChannelStats()
        }

        this.websocket.onmessage = (event) => {
          const message = JSON.parse(event.data)
          this.messages.push(message)
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }

        this.websocket.onclose = () => {
          this.isConnected = false
          this.connectionStatus = 'disconnected'
          this.connectionStatusText = 'Verbindung verloren'
        }

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.connectionStatus = 'error'
          this.connectionStatusText = 'Verbindungsfehler'
        }

        // Demo-Nachrichten laden
        this.loadDemoMessages()

      } catch (error) {
        console.error('Failed to connect to chat:', error)
        this.connectionStatus = 'error'
        this.connectionStatusText = 'Verbindungsfehler'
      }
    },

    disconnectFromChat() {
      if (this.websocket) {
        this.websocket.close()
      }
    },

    selectChannel(channel) {
      if (this.selectedChannel !== channel) {
        this.selectedChannel = channel
        this.messages = []
        this.disconnectFromChat()
        this.connectToChat()
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.isConnected) return

      const message = {
        type: 'user',
        content: this.newMessage.trim(),
        user: 'Du', // In Realität aus Authentifizierung
        timestamp: new Date().toISOString()
      }

      // Nachricht lokal hinzufügen
      this.messages.push(message)
      this.newMessage = ''

      this.$nextTick(() => {
        this.scrollToBottom()
      })

      // An WebSocket senden (falls verbunden)
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'message',
          content: message.content,
          channel: this.selectedChannel
        }))
      }
    },

    loadDemoMessages() {
      // Demo-Nachrichten für verschiedene Kanäle
      const demoMessages = {
        allgemein: [
          {
            type: 'user',
            content: 'Hallo zusammen! Wie war die Probe gestern?',
            user: 'Anna',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            type: 'user',
            content: 'Super! Die neuen Stücke klingen schon gut.',
            user: 'Thomas',
            timestamp: new Date(Date.now() - 3000000).toISOString()
          },
          {
            type: 'system',
            content: 'Lisa ist dem Chat beigetreten',
            user: 'System',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ],
        proben: [
          {
            type: 'user',
            content: 'Nächste Probe ist am Freitag um 19:00',
            user: 'Vorstand',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            type: 'user',
            content: 'Ich kann leider nicht kommen, habe einen Arzttermin',
            user: 'Maria',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        auftritte: [
          {
            type: 'user',
            content: 'Das Weihnachtskonzert ist ausverkauft!',
            user: 'Konzertmeister',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ]
      }

      this.messages = demoMessages[this.selectedChannel] || []
    },

    loadChannelStats() {
      // Demo-Statistiken
      this.channelStats = {
        allgemein: { messages: 45, active_users: 8, last_activity: new Date().toISOString() },
        proben: { messages: 23, active_users: 5, last_activity: new Date(Date.now() - 3600000).toISOString() },
        auftritte: { messages: 12, active_users: 3, last_activity: new Date(Date.now() - 7200000).toISOString() },
        technik: { messages: 8, active_users: 2, last_activity: new Date(Date.now() - 86400000).toISOString() },
        verwaltung: { messages: 15, active_users: 4, last_activity: new Date(Date.now() - 1800000).toISOString() }
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'Gerade eben'
      if (minutes < 60) return `vor ${minutes}m`
      if (hours < 24) return `vor ${hours}h`
      if (days < 7) return `vor ${days}d`
      return date.toLocaleDateString('de-DE')
    }
  }
}
</script>

<style scoped>
.chat-module {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}
.chat-container {
  display: flex;
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.channels-sidebar {
  width: 200px;
  background: #f8f9fa;
  padding: 15px;
  border-right: 1px solid #ddd;
}
.channel-list {
  margin-bottom: 20px;
}
.channel-item {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.channel-item:hover {
  background: #e9ecef;
}
.channel-item.active {
  background: #007bff;
  color: white;
}
.channel-users {
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}
.channel-stats {
  font-size: 14px;
}
.channel-stats p {
  margin: 5px 0;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chat-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.connection-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.connection-status.connected {
  background: #d4edda;
  color: #155724;
}
.connection-status.disconnected {
  background: #f8d7da;
  color: #721c24;
}
.connection-status.error {
  background: #fff3cd;
  color: #856404;
}
.messages-container {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #ffffff;
}
.message-item {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
}
.message-item.user {
  background: #f8f9fa;
  margin-left: 0;
  margin-right: 20%;
}
.message-item.system {
  background: #e9ecef;
  text-align: center;
  font-style: italic;
  margin-left: 20%;
  margin-right: 20%;
}
.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}
.message-user {
  font-weight: bold;
}
.message-time {
  font-style: italic;
}
.message-content {
  word-wrap: break-word;
}
.loading-messages {
  text-align: center;
  color: #666;
  font-style: italic;
}
.message-input {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
}
.message-input form {
  display: flex;
  gap: 10px;
}
.message-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.message-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.message-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.users-sidebar {
  width: 200px;
  background: #f8f9fa;
  padding: 15px;
  border-left: 1px solid #ddd;
}
.users-list {
  margin-top: 10px;
}
.user-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.user-avatar {
  width: 30px;
  height: 30px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}
.user-name {
  font-size: 14px;
}
</style>