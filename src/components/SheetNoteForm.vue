<template>
  <form @submit.prevent="submit" aria-label="Sheet note form">
    <label for="content">Notiz hinzufügen</label>
    <textarea id="content" v-model="content" :maxlength="maxLength" />
    <p>{{ content.length }} / {{ maxLength }} Zeichen</p>
    <button type="submit">Speichern</button>
    <p v-if="submitted" role="status">✅ Notiz gespeichert</p>
  </form>
  <NoteCreatedToast ref="toastRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNoteStore } from '../stores/noteStore'
import { useRoute } from 'vue-router'
import NoteCreatedToast from './NoteCreatedToast.vue'

const store = useNoteStore()
const route = useRoute()
const content = ref('')
const maxLength = 500
const submitted = ref(false)
const toastRef = ref<InstanceType<typeof NoteCreatedToast> | null>(null)

function submit() {
  if (content.value.trim().length === 0) return
  store.addNote(Number(route.params.id), content.value)
  content.value = ''
  submitted.value = true
  // hide the submitted status after 3s
  setTimeout(() => (submitted.value = false), 3000)
  // show a small toast confirmation
  // @ts-ignore - defineExpose() returns showToast at runtime
  toastRef.value?.showToast()
}
</script>
