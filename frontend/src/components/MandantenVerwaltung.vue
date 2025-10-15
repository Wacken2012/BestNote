<template>
  <div class="mandanten-verwaltung">
    <h3>Mandantenverwaltung</h3>
    <button @click="showCreate = true" class="create-btn">Neuen Mandanten anlegen</button>
    <table class="mandanten-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Beschreibung</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mandant in mandanten" :key="mandant.id">
          <td>{{ mandant.id }}</td>
          <td>{{ mandant.name }}</td>
          <td>{{ mandant.description }}</td>
          <td>
            <button @click="editMandant(mandant)">Bearbeiten</button>
            <button @click="deleteMandant(mandant.id)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mandant anlegen/bearbeiten Modal -->
    <div v-if="showCreate || editItem" class="modal">
      <div class="modal-content">
        <h4>{{ editItem ? 'Mandant bearbeiten' : 'Neuen Mandanten anlegen' }}</h4>
        <form @submit.prevent="saveMandant">
          <label>Name:<input v-model="form.name" required /></label>
          <label>Beschreibung:<input v-model="form.description" /></label>
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
  name: 'MandantenVerwaltung',
  data() {
    return {
      mandanten: [],
      showCreate: false,
      editItem: null,
      form: { name: '', description: '' }
    }
  },
  mounted() {
    this.loadMandanten()
  },
  methods: {
    async loadMandanten() {
      const res = await fetch('/mandant')
      if (res.ok) this.mandanten = await res.json()
    },
    async saveMandant() {
      if (this.editItem) {
        // Update
        await fetch(`/mandant/${this.editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
      } else {
        // Create
        await fetch('/mandant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
      }
      this.closeModal()
      this.loadMandanten()
    },
    editMandant(mandant) {
      this.editItem = mandant
      this.form = { name: mandant.name, description: mandant.description }
      this.showCreate = false
    },
    async deleteMandant(id) {
      if (confirm('Wirklich löschen?')) {
        await fetch(`/mandant/${id}`, { method: 'DELETE' })
        this.loadMandanten()
      }
    },
    closeModal() {
      this.showCreate = false
      this.editItem = null
      this.form = { name: '', description: '' }
    }
  }
}
</script>

<style scoped>
.mandanten-verwaltung {
  max-width: 700px;
  margin: 0 auto;
}
.mandanten-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}
.mandanten-table th, .mandanten-table td {
  border: 1px solid #eee;
  padding: 0.5rem 1rem;
  text-align: left;
}
.create-btn {
  margin-bottom: 1rem;
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 320px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>
