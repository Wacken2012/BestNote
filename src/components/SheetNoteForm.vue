<template>
  <form @submit.prevent="submit" aria-label="Sheet note form">
    <label for="content">Notiz hinzufügen</label>
    <textarea id="content" v-model="content" />
    <button type="submit">Speichern</button>
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
const toastRef = ref<InstanceType<typeof NoteCreatedToast> | null>(null)

function submit() {
  store.addNote(Number(route.params.id), content.value)
  content.value = ''
  // show a small toast confirmation
  // @ts-ignore - defineExpose() returns showToast at runtime
  toastRef.value?.showToast()
}
</script>
