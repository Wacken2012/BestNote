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
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const note = ref({ id: route.params.id || 'new', title: '', content: '' })

function saveNote() {
  console.log('Note saved:', note.value)
  // TODO: persist note via store or API
}
</script>

<style scoped>
form { display: flex; flex-direction: column; gap: 0.5rem }
label { font-weight: 600 }
input, textarea { padding: .5rem; border: 1px solid #ddd; border-radius: 4px }
</style>
