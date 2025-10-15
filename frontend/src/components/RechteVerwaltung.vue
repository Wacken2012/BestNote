<template>
  <div class="rechte-verwaltung">
    <h3>Benutzer- & Rechteverwaltung</h3>
    <p>Hier können Benutzer und deren Rechte verwaltet werden.</p>
    <button @click="showCreate = true">Neuen Benutzer anlegen</button>
    <table v-if="benutzer.length" class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Benutzername</th>
          <th>Rolle</th>
          <th>Berechtigungen</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in benutzer" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.permissions.join(', ') }}</td>
          <td>
            <button @click="editUser(user)">Bearbeiten</button>
            <button @click="deleteUser(user.id)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal für Benutzer anlegen/bearbeiten -->
    <div v-if="showCreate || editItem" class="modal">
      <div class="modal-content">
        <h4>{{ editItem ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen' }}</h4>
        <form @submit.prevent="saveUser">
          <label>Benutzername:
            <input v-model="form.username" required />
          </label>
          <label>Rolle:
            <select v-model="form.role">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <label>Berechtigungen:
            <select v-model="form.permissions" multiple>
              <option value="read">Lesen</option>
              <option value="write">Schreiben</option>
              <option value="delete">Löschen</option>
              <option value="export">Exportieren</option>
              <option value="import">Importieren</option>
            </select>
          </label>
          <div class="modal-actions">
            <button type="submit">Speichern</button>
            <button type="button" @click="closeModal">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RechteVerwaltung',
  data() {
    return {
      benutzer: [],
      form: {
        username: '',
        role: 'viewer',
        permissions: []
      },
      editItem: null,
      showCreate: false
    }
  },
  methods: {
    async loadBenutzer() {
      try {
        const res = await fetch('/benutzer/');
        if (!res.ok) throw new Error('Fehler beim Laden der Benutzer');
        this.benutzer = await res.json();
      } catch (e) {
        alert('Fehler beim Laden der Benutzer: ' + e.message);
      }
    },
    async saveUser() {
      try {
        if (this.editItem) {
          // Update
          const res = await fetch(`/benutzer/${this.editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.form)
          });
          if (!res.ok) throw new Error('Fehler beim Aktualisieren');
        } else {
          // Create
          const res = await fetch('/benutzer/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.form)
          });
          if (!res.ok) throw new Error('Fehler beim Anlegen');
        }
        this.closeModal();
        this.loadBenutzer();
      } catch (e) {
        alert('Fehler beim Speichern: ' + e.message);
      }
    },
    editUser(user) {
      this.editItem = user;
      this.form = { username: user.username, role: user.role, permissions: [...user.permissions] };
      this.showCreate = false;
    },
    async deleteUser(id) {
      if (confirm('Wirklich löschen?')) {
        try {
          const res = await fetch(`/benutzer/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Fehler beim Löschen');
          this.loadBenutzer();
        } catch (e) {
          alert('Fehler beim Löschen: ' + e.message);
        }
      }
    },
    closeModal() {
      this.showCreate = false;
      this.editItem = null;
      this.form = { username: '', role: 'viewer', permissions: [] };
    }
  },
  mounted() {
    this.loadBenutzer();
  }
}
</script>

<style scoped>
.rechte-verwaltung {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  padding: 2rem;
}
  .user-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.5rem;
  }
  .user-table th, .user-table td {
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    text-align: left;
  }
  .user-table th {
    background: #f5f5f5;
  }
  .modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal-content {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    min-width: 320px;
    max-width: 90vw;
    box-shadow: 0 2px 8px rgba(44,62,80,0.15);
  }
  .modal-actions {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
  }
</style>
