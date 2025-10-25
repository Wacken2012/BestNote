<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <h3>{{ title }}</h3>
      <form @submit.prevent="submit">
        <label>Title<input v-model="form.title" required /></label>
        <label>Composer<input v-model="form.composer" /></label>
        <label>Voice<input v-model="form.voice" /></label>
        <label>Tags (comma-separated)<input v-model="tagsInput" /></label>
        <label>PDF Upload<input type="file" @change="onFile" accept="application/pdf" /></label>
        <div class="actions">
          <button type="button" @click="close">Cancel</button>
          <button type="submit">Add</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useLibraryStore } from '../store/library'
import { useUserStore } from '../store/user'
import { v4 as uuidv4 } from 'uuid'
import { canUploadPiece, Role as PRole } from '../services/PermissionService'

const props = defineProps<{ title?: string }>()
const emit = defineEmits(['close', 'added'])
const title = props.title || 'Add piece'

const form = ref({ title: '', composer: '', voice: '' })
const tagsInput = ref('')
const file = ref<File | null>(null)
const library = useLibraryStore()
const userStore = useUserStore()

function mapToPermissionRole(r: string) {
  switch (r) {
    case 'admin': return PRole.Admin
    case 'notenwart': return PRole.Notenwart
    case 'dirigent': return PRole.Dirigent
    case 'vorstand': return PRole.Vorstand
    case 'kassierer': return PRole.Kassierer
    case 'mitglied': return PRole.Mitglied
    default: return PRole.Mitglied
  }
}

const currentUser = computed(() => ({ role: mapToPermissionRole(userStore.primaryRole) }))
const mayUpload = computed(() => canUploadPiece(currentUser.value))

function onFile(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files && t.files.length) file.value = t.files[0]
}

async function submit() {
  if (!mayUpload.value) return
  const tags = tagsInput.value.split(',').map((s: string) => s.trim()).filter(Boolean)
  const p = { id: uuidv4(), title: form.value.title, composer: form.value.composer, voice: form.value.voice, tags }
  // In a real app, upload the PDF to WebDAV and store URL; here we persist metadata only
  library.addPiece(p)
  emit('added', p)
  close()
}

function close() { emit('close') }

</script>

<style scoped>
.modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.35) }
.modal { background:white; padding:16px; border-radius:8px; width:320px }
.modal label { display:block; margin-bottom:8px }
.actions { display:flex; justify-content:flex-end; gap:8px }
</style>
