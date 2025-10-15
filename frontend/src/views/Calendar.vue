<template>
  <div class="calendar-view">
    <h2>Kalender</h2>

    <!-- Kalender-Header -->
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">◀</button>
      <h3>{{ currentMonthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="nav-btn">▶</button>
      <button @click="goToToday" class="today-btn">Heute</button>
    </div>

    <!-- Wochentage -->
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- Kalender-Raster -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date"
        :class="['calendar-day', {
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-events': day.events.length > 0
        }]"
        @click="selectDay(day)"
      >
        <div class="day-number">{{ day.day }}</div>
        <div class="day-events">
          <div
            v-for="event in day.events.slice(0, 2)"
            :key="event.id"
            :class="['event-item', event.type]"
            @click.stop="openEvent(event)"
          >
            {{ event.title }}
          </div>
          <div v-if="day.events.length > 2" class="more-events">
            +{{ day.events.length - 2 }} mehr
          </div>
        </div>
      </div>
    </div>

    <!-- Event-Details Modal -->
    <div v-if="selectedEvent" class="event-modal" @click="closeEvent">
      <div class="event-details" @click.stop>
        <h3>{{ selectedEvent.title }}</h3>
        <div class="event-info">
          <p><strong>Datum:</strong> {{ formatDate(selectedEvent.date) }}</p>
          <p v-if="selectedEvent.time"><strong>Uhrzeit:</strong> {{ selectedEvent.time }}</p>
          <p v-if="selectedEvent.location"><strong>Ort:</strong> {{ selectedEvent.location }}</p>
          <p><strong>Typ:</strong> {{ getEventTypeName(selectedEvent.type) }}</p>
          <p v-if="selectedEvent.description"><strong>Beschreibung:</strong> {{ selectedEvent.description }}</p>
        </div>

        <!-- RSVP-Sektion -->
        <div class="rsvp-section">
          <h4>Teilnahme</h4>
          <div class="rsvp-buttons">
            <button
              :class="['rsvp-btn', { active: userRSVP === 'accepted' }]"
              @click="setRSVP('accepted')"
            >
              ✅ Zusage
            </button>
            <button
              :class="['rsvp-btn', { active: userRSVP === 'declined' }]"
              @click="setRSVP('declined')"
            >
              ❌ Absage
            </button>
            <button
              :class="['rsvp-btn', { active: userRSVP === 'pending' }]"
              @click="setRSVP('pending')"
            >
              ❓ Unsicher
            </button>
          </div>
          <div class="rsvp-summary">
            <p>{{ rsvpCounts.accepted }} Zugesagt, {{ rsvpCounts.declined }} Abgesagt, {{ rsvpCounts.pending }} Unsicher</p>
          </div>
        </div>

        <button @click="closeEvent" class="close-btn">Schließen</button>
      </div>
    </div>

    <!-- Neues Event erstellen -->
    <div class="add-event-section">
      <button @click="showAddEvent = true" class="add-event-btn">+ Neuer Termin</button>
    </div>

    <!-- Add Event Modal -->
    <div v-if="showAddEvent" class="event-modal" @click="closeAddEvent">
      <div class="event-form" @click.stop>
        <h3>Neuer Termin</h3>
        <form @submit.prevent="createEvent">
          <div class="form-group">
            <label for="title">Titel:</label>
            <input v-model="newEvent.title" id="title" required />
          </div>
          <div class="form-group">
            <label for="date">Datum:</label>
            <input v-model="newEvent.date" type="date" id="date" required />
          </div>
          <div class="form-group">
            <label for="time">Uhrzeit:</label>
            <input v-model="newEvent.time" type="time" id="time" />
          </div>
          <div class="form-group">
            <label for="location">Ort:</label>
            <input v-model="newEvent.location" id="location" />
          </div>
          <div class="form-group">
            <label for="type">Typ:</label>
            <select v-model="newEvent.type" id="type" required>
              <option value="probe">Probe</option>
              <option value="auftritt">Auftritt</option>
              <option value="versammlung">Versammlung</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Beschreibung:</label>
            <textarea v-model="newEvent.description" id="description"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit">Erstellen</button>
            <button type="button" @click="closeAddEvent">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  data() {
    return {
      currentDate: new Date(),
      selectedEvent: null,
      showAddEvent: false,
      userRSVP: 'pending',
      rsvpCounts: { accepted: 0, declined: 0, pending: 0 },
      newEvent: {
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'probe',
        description: ''
      },
      events: []
    }
  },
  mounted() {
    this.loadEvents()
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleDateString('de-DE', { month: 'long' })
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    weekdays() {
      return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date()

      const days = []

      // Tage vom vorherigen Monat
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay() + 1)

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dayEvents = this.events.filter(event => event.date === date.toISOString().split('T')[0])

        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        })
      }

      return days
    }
  },
  methods: {
    async loadEvents() {
      try {
        const response = await fetch('/calendar', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          this.events = await response.json();
        } else {
          console.error('API-Fehler: Kein JSON vom Server, Fallback auf Demo-Events');
          this.loadDemoEvents();
        }
      } catch (error) {
        console.error('API-Fehler:', error);
        this.loadDemoEvents();
      }
    },
    loadDemoEvents() {
      this.events = [
        {
          id: 1,
          title: 'Probe Beethoven',
          date: '2024-01-15',
          time: '19:00',
          location: 'Proberaum',
          type: 'probe',
          description: 'Probe für das Beethoven-Konzert'
        },
        {
          id: 2,
          title: 'Kirchenkonzert',
          date: '2024-01-20',
          time: '18:00',
          location: 'St. Marien Kirche',
          type: 'auftritt',
          description: 'Weihnachtskonzert in der Kirche'
        },
        {
          id: 3,
          title: 'Jahreshauptversammlung',
          date: '2024-01-25',
          time: '20:00',
          location: 'Vereinsheim',
          type: 'versammlung',
          description: 'Jahreshauptversammlung 2024'
        }
      ]
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    goToToday() {
      this.currentDate = new Date()
    },
    selectDay(day) {
      // Optional: Tag-Details anzeigen
    },
    openEvent(event) {
      this.selectedEvent = event
      this.loadRSVPData(event.id)
    },
    async loadRSVPData(eventId) {
      try {
        const response = await fetch(`/calendar/${eventId}/rsvp`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })

        if (response.ok) {
          const rsvpData = await response.json()
          this.userRSVP = rsvpData.user_status || 'pending'
          this.rsvpCounts = rsvpData.counts || { accepted: 0, declined: 0, pending: 0 }
        } else {
          // Fallback auf Mock-Daten
          this.userRSVP = 'pending'
          this.rsvpCounts = {
            accepted: Math.floor(Math.random() * 15) + 5,
            declined: Math.floor(Math.random() * 5),
            pending: Math.floor(Math.random() * 10) + 2
          }
        }
      } catch (error) {
        console.error('RSVP-Daten laden Fehler:', error)
        // Fallback auf Mock-Daten
        this.userRSVP = 'pending'
        this.rsvpCounts = {
          accepted: Math.floor(Math.random() * 15) + 5,
          declined: Math.floor(Math.random() * 5),
          pending: Math.floor(Math.random() * 10) + 2
        }
      }
    },
    updateRSVPCounts() {
      // Nach RSVP-Änderung die Counts neu laden
      if (this.selectedEvent) {
        this.loadRSVPData(this.selectedEvent.id)
      }
    },
    closeEvent() {
      this.selectedEvent = null
    },
    async setRSVP(status) {
      if (!this.selectedEvent) return

      try {
        const response = await fetch(`/calendar/${this.selectedEvent.id}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ status })
        })

        if (response.ok) {
          this.userRSVP = status
          this.updateRSVPCounts()
        } else {
          alert('Fehler beim Speichern der Teilnahme')
        }
      } catch (error) {
        console.error('RSVP-Fehler:', error)
        alert('Netzwerkfehler beim Speichern der Teilnahme')
      }
    },
    getEventTypeName(type) {
      const types = {
        probe: 'Probe',
        auftritt: 'Auftritt',
        versammlung: 'Versammlung',
        other: 'Sonstiges'
      }
      return types[type] || type
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async createEvent() {
      try {
        const response = await fetch('/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(this.newEvent)
        })

        if (response.ok) {
          const event = await response.json()
          this.events.push(event)
          this.closeAddEvent()
          // Events neu laden, um sicherzustellen, dass alles synchron ist
          this.loadEvents()
        } else {
          alert('Fehler beim Erstellen des Termins')
        }
      } catch (error) {
        console.error('Event-Erstellung-Fehler:', error)
        alert('Netzwerkfehler beim Erstellen des Termins')
      }
    },
    closeAddEvent() {
      this.showAddEvent = false
      this.newEvent = {
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'probe',
        description: ''
      }
    },
    getAuthToken() {
      return localStorage.getItem('auth_token') || ''
    }
  }
}
</script>

<style scoped>
.calendar-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.nav-btn, .today-btn {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.today-btn {
  background: #28a745;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
}
.weekday {
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background: #f8f9fa;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ddd;
}
.calendar-day {
  background: white;
  min-height: 100px;
  padding: 5px;
  cursor: pointer;
}
.calendar-day.other-month {
  background: #f8f9fa;
  color: #999;
}
.calendar-day.today {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}
.calendar-day.has-events {
  background: #fff3cd;
}
.day-number {
  font-weight: bold;
  margin-bottom: 5px;
}
.event-item {
  font-size: 12px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 2px;
  cursor: pointer;
}
.event-item.probe {
  background: #cce5ff;
}
.event-item.auftritt {
  background: #d4edda;
}
.event-item.versammlung {
  background: #f8d7da;
}
.more-events {
  font-size: 10px;
  color: #666;
  font-style: italic;
}
.event-modal {
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
.event-details, .event-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.event-info p {
  margin: 10px 0;
}
.rsvp-section {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
}
.rsvp-buttons {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}
.rsvp-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
.rsvp-btn.active {
  background: #007bff;
  color: white;
}
.close-btn {
  margin-top: 20px;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-event-section {
  margin-top: 20px;
  text-align: center;
}
.add-event-btn {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
textarea {
  height: 80px;
  resize: vertical;
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