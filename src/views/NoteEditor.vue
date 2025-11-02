<template>
  <form aria-label="Notizeditor" @submit.prevent="saveNote">
    <div>
      <label for="title">Titel</label>
      <input id="title" v-model="note.title" />
    </div>

    <div>
      <label for="content">Inhalt</label>
      <textarea id="content" v-model="note.content" />
    </div>

    <button type="submit">Speichern</button>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNoteStore } from '../stores/noteStore'

const route = useRoute()
const store = useNoteStore()

const noteId = Number(route.params.id)
type Note = { id: number | string; title: string; content: string }
const note = computed<Note>(() => (store.notes as Note[]).find((n: Note) => n.id === noteId) || { id: noteId || 'new', title: '', content: '' })

function saveNote() {
  if (note.value && typeof note.value.id === 'number') {
    store.updateNote(note.value.id, note.value.title, note.value.content)
    console.log('Note saved via store:', note.value)
  } else {
    console.log('New note (not persisted):', note.value)
  }
}
</script>

<style scoped>
form { display: flex; flex-direction: column; gap: 0.5rem }
label { font-weight: 600 }
input, textarea { padding: .5rem; border: 1px solid #ddd; border-radius: 4px }
</style>
