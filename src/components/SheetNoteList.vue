<template>
  <section aria-label="Notizen zur Musiknote">
    <div v-for="note in notes" :key="note.id" role="listitem">
      <p><strong>{{ note.author }}</strong> ({{ formatDate(note.createdAt) }}):</p>
      <p>{{ note.content }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useNoteStore } from '../stores/noteStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Note } from '../types/note'

const store = useNoteStore()
const route = useRoute()
const sheetId = computed(() => Number(route.params.id))
const notes = computed<Note[]>(() => store.getNotesForSheet(sheetId.value))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
</script>
