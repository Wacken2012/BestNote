<template>
  <article class="note-card" role="listitem" :aria-label="`Notiz ${note.id}`">
    <h3>{{ note.title }}</h3>
    <p>{{ note.content }}</p>
    <router-link :to="`/notes/${note.id}`" class="edit-link">Bearbeiten</router-link>
  </article>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{ note: { id: number|string, title: string, content: string } }>()
const note = props.note
</script>

<style scoped>
.note-card { border: 1px solid #ddd; padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0 }
.edit-link { display: inline-block; margin-top: .5rem }
</style>
