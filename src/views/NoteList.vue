<template>
  <div>
    <router-link to="/create">
      <button aria-label="Neue Notiz erstellen">Neue Notiz</button>
    </router-link>
    <section aria-label="Notizliste" role="list">
      <NoteCard v-for="note in notes" :key="note.id" :note="note" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useNoteStore } from '../stores/noteStore'
import NoteCard from '@/components/NoteCard.vue'

const store = useNoteStore()
const notes = store.notes
</script>

<style scoped>
section[role="list"] { display: grid; grid-template-columns: 1fr; gap: 0.5rem }
</style>
