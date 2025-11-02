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
import { ref } from 'vue'
import NoteCard from '@/components/NoteCard.vue'

const notes = ref([
  { id: 1, title: 'Erste Notiz', content: 'Inhalt der ersten Notiz' },
  { id: 2, title: 'Zweite Notiz', content: 'Inhalt der zweiten Notiz' },
])
</script>

<style scoped>
section[role="list"] { display: grid; grid-template-columns: 1fr; gap: 0.5rem }
</style>
