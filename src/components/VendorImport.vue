<template>
  <div>
    <h3>Vendor Import Preview</h3>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul>
      <li v-for="m in members" :key="m.id">{{ m.name || m.id }} <small>({{ m.id }})</small></li>
    </ul>
    <label style="display:block; margin:8px 0">
      <input type="checkbox" v-model="backupBefore" :disabled="applying || committing" /> Backup vor Import erstellen
    </label>
  <button @click="preview" :disabled="members.length===0 || applying || committing">Import übernehmen</button>
  <div v-if="applying || committing" style="margin-top:8px">{{ applying ? 'Vorschau wird geladen…' : 'Import wird angewendet…' }}</div>

    <!-- simple modal -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal">
        <h4>Import Vorschau</h4>
        <p>Neue Mitglieder: <strong>{{ previewResult.created }}</strong></p>
        <p>Aktualisiert: <strong>{{ previewResult.updated }}</strong></p>
        <div class="actions">
          <button @click="confirmImport" :disabled="committing">{{ committing ? 'Import wird angewendet…' : 'Import bestätigen' }}</button>
          <button @click="closeModal" :disabled="committing">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import { useNotify } from '../composables/useNotify'
const members = ref<any[]>([])
const loading = ref(false)
const applying = ref(false)
const showModal = ref(false)
const committing = ref(false)
const previewResult = ref({ created: 0, updated: 0 })
const error = ref('')
const { request } = useApi()
const { push } = useNotify()
const backupBefore = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await request('/api/vendor/members?vendor=openjverein')
    members.value = res.members || []
  } catch (e:any) { error.value = e.message }
  loading.value = false
}

async function preview() {
  if (!members.value.length) return push('Keine Mitglieder zum Importieren', 'error')
  applying.value = true
  try {
    const res = await request('/api/members/import?dry=true', { method: 'POST', body: JSON.stringify({ members: members.value }) })
    previewResult.value = { created: res.created || 0, updated: res.updated || 0 }
    showModal.value = true
  } catch (e:any) {
    push(e.message || 'Vorschau fehlgeschlagen', 'error')
  }
  applying.value = false
}

function closeModal() { showModal.value = false }

async function confirmImport() {
  if (!members.value.length) return push('Keine Mitglieder zum Importieren', 'error')
  committing.value = true
  try {
    const res = await request('/api/members/import', { method: 'POST', body: JSON.stringify({ members: members.value, backup: backupBefore.value }) })
    push('Import erfolgreich: ' + (res.created || 0) + ' erstellt, ' + (res.updated || 0) + ' aktualisiert', 'success')
    showModal.value = false
  } catch (e:any) {
    push(e.message || 'Import fehlgeschlagen', 'error')
  }
  committing.value = false
}
onMounted(load)
</script>

<style scoped>
.error { color: #b00 }
</style>
