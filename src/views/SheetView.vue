<template>
  <h2>Musiknote: {{ sheetId }}</h2>
  <!-- PDF-Anzeige oder Download-Link hier -->
  <SheetNoteForm />
  <SheetNoteList />
</template>

<script setup lang="ts">
import SheetNoteForm from '../components/SheetNoteForm.vue'
import SheetNoteList from '../components/SheetNoteList.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sheetId = route.params.id
</script>
