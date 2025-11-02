<template>
  <input v-model="query" placeholder="Notiz suchen..." />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNoteStore } from '../stores/noteStore'

const query = ref('')
const store = useNoteStore()
const filteredNotes = computed(() =>
  store.notes.filter((n: any) => n.title.includes(query.value) || n.content.includes(query.value))
)

defineExpose({ filteredNotes })
</script>
