<template>
  <form @submit.prevent="create">
    <label for="title">Titel</label>
    <input id="title" v-model="title" />

    <label for="content">Inhalt</label>
    <textarea id="content" v-model="content" />

    <button type="submit">Neue Notiz erstellen</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '../stores/noteStore'

const store = useNoteStore()
const router = useRouter()
const title = ref('')
const content = ref('')

function create() {
  const id = store.createNote(title.value, content.value)
  title.value = ''
  content.value = ''
  // optimistic redirect to newly created note
  router.push(`/notes/${id}`)
}
</script>
